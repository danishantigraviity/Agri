import os
import pandas as pd

dataset_root = "agrimarket/ml_service/dataset"
output_csv = "agrimarket/ml_service/dataset_manifest_v3.csv"

data = []
for folder in os.listdir(dataset_root):
    folder_path = os.path.join(dataset_root, folder)
    if not os.path.isdir(folder_path):
        continue
        
    # Standard folder format: [Crop]_[Condition]
    # e.g. "Tomato_Late_Blight"
    parts = folder.split('_')
    crop = parts[0]
    disease = " ".join(parts[1:])
    
    for img_file in os.listdir(folder_path):
        if img_file.lower().endswith(('.jpg', '.jpeg', '.png')):
            data.append({
                "path": os.path.join(folder_path, img_file),
                "crop": crop,
                "disease": disease
            })

df = pd.DataFrame(data)
df.to_csv(output_csv, index=False)
print(f"✅ Created hierarchical manifest: {output_csv}")
print(f"🧬 Detected Crops: {df['crop'].unique()}")
print(f"📸 Total Images: {len(df)}")
