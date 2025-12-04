import logging
from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from pydantic import BaseModel
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/anomaly", tags=["anomaly-detection"])

# Load model once at startup
MODEL_PATH = Path("ml_models/isolation_forest_model.pkl")
SCALER_PATH = Path("data/scaler.pkl")  # We'll save this too

try:
    model = joblib.load(MODEL_PATH)
    logger.info("✅ Anomaly detection model loaded successfully")
except:
    model = None
    logger.warning("❌ Model not found - train isolation_forest_model.py first")

class AnomalyRequest(BaseModel):
    data: List[Dict[str, Any]]

class AnomalyResponse(BaseModel):
    predictions: List[int]  # -1 = anomaly, 1 = normal
    anomaly_scores: List[float]
    num_anomalies: int

@router.post("/predict", response_model=AnomalyResponse)
async def predict_anomaly(request: AnomalyRequest):
    """Predict anomalies on patient data"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not trained yet")
    
    try:
        # Convert input to DataFrame
        df = pd.DataFrame(request.data)
        
        # Ensure all expected features exist (fill missing with 0)
        expected_features = ['age', 'length_of_stay', 'num_icu_stays', 'gender', 
                           'admission_type', 'admission_location', 'discharge_location', 
                           'insurance', 'first_careunit', 'last_careunit']
        
        for feature in expected_features:
            if feature not in df.columns:
                df[feature] = 0
        
        # Use only model features
        X = df[expected_features].fillna(0)
        
        # Predict anomalies (-1 = anomaly, 1 = normal)
        predictions = model.predict(X)
        anomaly_scores = model.decision_function(X)  # Lower = more anomalous
        
        num_anomalies = sum(predictions == -1)
        
        return AnomalyResponse(
            predictions=predictions.tolist(),
            anomaly_scores=anomaly_scores.tolist(),
            num_anomalies=num_anomalies
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}
