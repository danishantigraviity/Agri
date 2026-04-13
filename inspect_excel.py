import pandas as pd
import os

excel_path = r"c:\Users\danis\Downloads\agrimarket-platform\crop_disease_labels.xlsx"

try:
    df = pd.read_excel(excel_path)
    print("--- Excel Columns ---")
    print(df.columns.tolist())
    print("\n--- First 5 Rows ---")
    print(df.head())
    print("\n--- Summary ---")
    print(f"Total Rows: {len(df)}")
    
    # Check if any column looks like a path
    sample_path = df.iloc[0, 0]
    print(f"\nSample Data in first cell: {sample_path}")
    if os.path.exists(str(sample_path)):
        print(f"✅ Path exists: {sample_path}")
    else:
        print(f"❌ Path does NOT exist in local context: {sample_path}")

except Exception as e:
    print(f"Error reading Excel: {e}")
