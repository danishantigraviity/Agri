import pandas as pd
import json
excel_path = r"c:\Users\danis\Downloads\agrimarket-platform\crop_disease_labels.xlsx"
try:
    df = pd.read_excel(excel_path)
    crops = sorted(df['crop'].unique().tolist())
    diseases = sorted(df['disease'].unique().tolist())
    results = {
        "crops": crops,
        "diseases": diseases
    }
    with open('full_labels.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("SUCCESS: full_labels.json created")
except Exception as e:
    print(f"ERROR: {e}")
