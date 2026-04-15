import pandas as pd
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
import os

# Configuration
EXCEL_PATH = "crop_disease_labels.xlsx"
MODEL_SAVE_PATH = os.path.join("agrimarket", "ml_service", "crop_model_v2.h5")
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 5

def train_model():
    print("[PHASE 3] AI Model Training (EfficientNetB0)")
    
    # 1. Load Labels
    if not os.path.exists(EXCEL_PATH):
        print(f"[ERROR] Error: {EXCEL_PATH} not found.")
        return
    
    df = pd.read_excel(EXCEL_PATH)
    # Combine Crop and Disease for full label
    df['full_label'] = df['crop'] + " " + df['disease']
    
    print(f"[LOG] Dataset loaded: {len(df)} images.")
    print(f"[INFO] Unique Classes: {df['full_label'].nunique()}")

    # 2. Split Data
    train_df, val_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df['full_label'])

    # 3. Data Generators (Augmentation)
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    val_datagen = ImageDataGenerator(rescale=1./255)

    train_generator = train_datagen.flow_from_dataframe(
        train_df,
        x_col='path',
        y_col='full_label',
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )

    val_generator = val_datagen.flow_from_dataframe(
        val_df,
        x_col='path',
        y_col='full_label',
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )

    # 4. Build Model (EfficientNetB0)
    base_model = EfficientNetB0(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False  # Freeze base layers initially

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.5)(x)
    predictions = Dense(len(train_generator.class_indices), activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    # 5. Training
    print("[SYSTEM] Starting Training Loop...")
    
    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
        tf.keras.callbacks.ModelCheckpoint(MODEL_SAVE_PATH, save_best_only=True)
    ]

    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=EPOCHS,
        callbacks=callbacks
    )

    # 6. Save Final Model
    print(f"[SUCCESS] Training Complete! Model saved to {MODEL_SAVE_PATH}")
    
    # Export class indices for later use
    class_indices_path = os.path.join("agrimarket", "ml_service", "class_indices.txt")
    with open(class_indices_path, "w") as f:
        for cls, idx in train_generator.class_indices.items():
            f.write(f"{cls}:{idx}\n")
    print(f"[INFO] Class indices saved to {class_indices_path}")

if __name__ == "__main__":
    train_model()
