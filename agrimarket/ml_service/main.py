from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time

# Direct import — works when running from agrimarket/ml_service directory
from model_loader import ai_engine, soil_engine


app = FastAPI(
    title="AgriMarket Senior AI Multi-Crop Service",
    description="Production-ready crop disease classification and diagnostic pipeline.",
    version="3.0.0"
)

# Robust CORS for Distributed Architecture
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "status": "AI Service Online",
        "engine": "EfficientNetB0-V3-Senior",
        "timestamp": time.time(),
        "supported_crops": ['Rice', 'Tomato', 'Potato', 'Wheat', 'Corn', 'Cotton', 'Pepper', 'Eggplant'],
        "features": ["Disease Diagnosis", "Soil Fertility Analysis", "Crop Prediction"]
    }

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    """
    Main diagnostic endpoint.
    Expects a multipart form-data image file.
    Returns hierarchical classification and medicine recommendations.
    """
    try:
        # 1. Validation
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400, 
                detail="Unsupported Media Type. Please upload a JPEG or PNG image of the crop leaf."
            )

        # 2. Binary Extraction
        contents = await file.read()
        
        # 3. Senior Inference Logic
        start_time = time.time()
        result = ai_engine.predict(contents)
        latency = time.time() - start_time
        
        # 4. Response Composition
        return {
            "success": True,
            "latency_ms": round(latency * 1000, 2),
            **result
        }

    except Exception as e:
        # Production Error Masking with Logging
        print(f"[ERROR] Critical Inference Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="The AI Diagnostic Engine encountered a processing error. Our engineers have been notified."
        )

@app.post("/analyze-soil")
async def analyze_soil(data: dict):
    """
    Soil Fertility & Crop Prediction endpoint.
    Input: N, P, K, pH, temp, hum, rain
    """
    try:
        start_time = time.time()
        result = soil_engine.analyze(data)
        latency = time.time() - start_time
        
        return {
            "success": True,
            "latency_ms": round(latency * 1000, 2),
            **result
        }
    except Exception as e:
        print(f"[ERROR] Soil Analysis Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Optimized for production scale
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=1)
