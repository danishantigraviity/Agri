from model_loader import DiseaseModel
try:
    print("Attempting to load model...")
    model = DiseaseModel()
    print("Model loaded successfully!")
except Exception as e:
    import traceback
    traceback.print_exc()
