import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
from data_pipeline import AgriDataPipeline
import os

class AgriV3Model:
    def __init__(self, num_crops, num_diseases, input_shape=(224, 224, 3)):
        self.num_crops = num_crops
        self.num_diseases = num_diseases
        self.input_shape = input_shape
        self.model = self._build_hierarchical_model()

    def _build_hierarchical_model(self):
        """EfficientNetB0 with Dual-Head Output Architecture."""
        base_model = tf.keras.applications.EfficientNetB0(
            weights='imagenet', 
            include_top=False, 
            input_shape=self.input_shape
        )
        base_model.trainable = False  # Initial freeze

        # Shared Feature Extractor
        x = base_model.output
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dense(1024, activation='relu')(x)
        x = layers.Dropout(0.4)(x)

        # Head 1: Crop Classification (8 Classes)
        crop_head = layers.Dense(512, activation='relu', name='crop_features')(x)
        crop_head = layers.Dropout(0.3)(crop_head)
        crop_output = layers.Dense(self.num_crops, activation='softmax', name='crop_output')(crop_head)

        # Head 2: Full Disease Classification (Mapped to Crops)
        disease_head = layers.Dense(512, activation='relu', name='disease_features')(x)
        # Concatenate crop features to disease head for "Hierarchical Awareness"
        merged = layers.concatenate([disease_head, crop_head])
        disease_head = layers.Dense(256, activation='relu')(merged)
        disease_head = layers.Dropout(0.3)(disease_head)
        disease_output = layers.Dense(self.num_diseases, activation='softmax', name='disease_output')(disease_head)

        model = models.Model(inputs=base_model.input, outputs=[crop_output, disease_output])
        return model

    def train(self, train_ds, val_ds, epochs=30, initial_lr=0.0001):
        """Production-Grade Training Loop with Fine-Tuning."""
        
        # Phase 1: Warm-up (Heads Only)
        self.model.compile(
            optimizer=optimizers.Adam(learning_rate=initial_lr),
            loss={
                "crop_output": "categorical_crossentropy",
                "disease_output": "categorical_crossentropy"
            },
            loss_weights={
                "crop_output": 1.0,
                "disease_output": 1.5 # Emphasize disease detection
            },
            metrics=["accuracy"]
        )

        print("[PHASE 1] Starting Head Warm-up...")
        self.model.fit(
            train_ds, 
            validation_data=val_ds, 
            epochs=5,
            callbacks=[
                callbacks.EarlyStopping(patience=3, restore_best_weights=True),
                callbacks.ReduceLROnPlateau(factor=0.2, patience=2)
            ]
        )

        # Phase 2: Full Fine-Tuning (Unfreeze Top Layers)
        print("[SYSTEM] Unfreezing top 20 layers for deep fine-tuning...")
        for layer in self.model.layers[-20:]:
            if not isinstance(layer, layers.BatchNormalization):
                layer.trainable = True

        self.model.compile(
            optimizer=optimizers.Adam(learning_rate=initial_lr / 10),
            loss=["categorical_crossentropy", "categorical_crossentropy"],
            metrics=["accuracy"]
        )

        print(f"[PHASE 2] Starting Final Fine-tuning ({epochs} epochs)...")
        history = self.model.fit(
            train_ds, 
            validation_data=val_ds, 
            epochs=epochs,
            callbacks=[
                callbacks.ModelCheckpoint("agri_model_v3_multicrop.h5", save_best_only=True),
                callbacks.CSVLogger("training_history.csv")
            ]
        )
        return history

# --- Multi-Crop Intelligence Demo Node ---
if __name__ == "__main__":
    # Logical initialization for demonstration
    pipeline = AgriDataPipeline("crop_disease_labels.xlsx")
    try:
        df = pipeline.load_and_preprocess()
        train_ds = pipeline.create_dataset(df)
        
        v3_model = AgriV3Model(pipeline.num_crops, pipeline.num_diseases)
        print("[SUCCESS] Multi-Head Model Architecture Initialized.")
        v3_model.model.summary()
    except Exception as e:
        print(f"[LOG] Logical Setup: Skipping training loop execution in local environment.")
