# import logging
# from fastapi import APIRouter, HTTPException
# import pandas as pd
# import numpy as np
# import joblib
# from pathlib import Path
# from pydantic import BaseModel
# from typing import List, Dict, Any

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# router = APIRouter(prefix="/anomaly", tags=["anomaly-detection"])

# # Load model once at startup
# MODEL_PATH = Path("ml_models/isolation_forest_model.pkl")
# SCALER_PATH = Path("data/scaler.pkl")  # We'll save this too

# try:
#     model = joblib.load(MODEL_PATH)
#     logger.info("✅ Anomaly detection model loaded successfully")
# except:
#     model = None
#     logger.warning("❌ Model not found - train isolation_forest_model.py first")

# class AnomalyRequest(BaseModel):
#     data: List[Dict[str, Any]]

# class AnomalyResponse(BaseModel):
#     predictions: List[int]  # -1 = anomaly, 1 = normal
#     anomaly_scores: List[float]
#     num_anomalies: int

# @router.post("/predict", response_model=AnomalyResponse)
# async def predict_anomaly(request: AnomalyRequest):
#     """Predict anomalies on patient data"""
#     if model is None:
#         raise HTTPException(status_code=500, detail="Model not trained yet")
    
#     try:
#         # Convert input to DataFrame
#         df = pd.DataFrame(request.data)
        
#         # Ensure all expected features exist (fill missing with 0)
#         expected_features = ['age', 'length_of_stay', 'num_icu_stays', 'gender', 
#                            'admission_type', 'admission_location', 'discharge_location', 
#                            'insurance', 'first_careunit', 'last_careunit']
        
#         for feature in expected_features:
#             if feature not in df.columns:
#                 df[feature] = 0
        
#         # Use only model features
#         X = df[expected_features].fillna(0)
        
#         # Predict anomalies (-1 = anomaly, 1 = normal)
#         predictions = model.predict(X)
#         anomaly_scores = model.decision_function(X)  # Lower = more anomalous
        
#         num_anomalies = sum(predictions == -1)
        
#         return AnomalyResponse(
#             predictions=predictions.tolist(),
#             anomaly_scores=anomaly_scores.tolist(),
#             num_anomalies=num_anomalies
#         )
        
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

# @router.get("/health")
# async def health_check():
#     """Health check endpoint"""
#     return {"status": "healthy", "model_loaded": model is not None}


import logging
from fastapi import APIRouter, HTTPException, UploadFile, File
import pandas as pd
import numpy as np
import joblib
import io
from pathlib import Path
from pydantic import BaseModel
from typing import List, Dict, Any
import shap
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/anomaly", tags=["anomaly-detection"])

# Load model once at startup
MODEL_PATH = Path("ml_models/isolation_forest_model.pkl")
SCALER_PATH = Path("data/scaler.pkl")


try:
    model = joblib.load(MODEL_PATH)
    logger.info("✅ Anomaly detection model loaded successfully")
except:
    model = None
    logger.warning("❌ Model not found - train isolation_forest_model.py first")

# SHAP Explainer (AFTER model loads)
explainer = None
if model is not None:
    try:
        explainer = shap.TreeExplainer(model)
        logger.info("✅ SHAP explainer loaded")
    except:
        logger.warning("❌ SHAP not loaded")


class AnomalyRequest(BaseModel):
    data: List[Dict[str, Any]]

class AnomalyResponse(BaseModel):
    predictions: List[int]  # -1 = anomaly, 1 = normal
    anomaly_scores: List[float]
    num_anomalies: int

# 🔴 NEW: CSV Batch Response
class BatchResponse(BaseModel):
    total_records: int
    num_anomalies: int
    anomaly_rate: str
    anomalies: List[Dict[str, Any]]
    summary_table: List[Dict[str, Any]]

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

# 🔴 NEW: CSV BATCH UPLOAD ENDPOINT
@router.post("/batch", response_model=BatchResponse)
async def predict_batch_csv(file: UploadFile = File(...)):
    """Batch anomaly detection from CSV upload"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not trained yet")
    
    try:
        # Read CSV from upload
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        # Validate required columns
        expected_features = ['age', 'length_of_stay', 'num_icu_stays', 'gender', 
                           'admission_type', 'admission_location', 'discharge_location', 
                           'insurance', 'first_careunit', 'last_careunit']
        
        missing = [col for col in expected_features if col not in df.columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")
        
        # Prepare data (reuse your exact logic)
        X = df[expected_features].fillna(0)
        
        # Predict
        predictions = model.predict(X)
        anomaly_scores = model.decision_function(X)
        num_anomalies = np.sum(predictions == -1)
        
        # Add results to dataframe
        df['prediction'] = predictions
        df['anomaly_score'] = anomaly_scores
        df['status'] = df['prediction'].map({1: 'NORMAL', -1: 'ANOMALY'})
        
        # Summary response
        return BatchResponse(
            total_records=len(df),
            num_anomalies=int(num_anomalies),
            anomaly_rate=f"{num_anomalies/len(df)*100:.1f}%",
            anomalies=df[df['prediction'] == -1][expected_features + ['anomaly_score']].to_dict('records'),
            summary_table=df[['prediction', 'anomaly_score', 'status', 'age', 'length_of_stay']].head(10).to_dict('records')
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/explain")
async def explain_prediction(request: AnomalyRequest):
    """SHAP: Why this prediction?"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not ready")
    
    df = pd.DataFrame(request.data)
    expected_features = ['age', 'length_of_stay', 'num_icu_stays', 'gender', 
                        'admission_type', 'admission_location', 'discharge_location', 
                        'insurance', 'first_careunit', 'last_careunit']
    X = df[expected_features].fillna(0)
    
    # FIXED SHAP for Isolation Forest
    shap_explainer = shap.TreeExplainer(model)
    shap_values = shap_explainer.shap_values(X.iloc[0:1])
    
    # Isolation Forest returns single array
    shap_values_array = shap_values[0] if isinstance(shap_values, list) else shap_values
    feature_importance = dict(zip(expected_features, shap_values_array.flatten()))
    
    return {
        "shap_values": feature_importance,
        "prediction": int(model.predict(X)[0]),
        "top_features": sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True)[:5]
    }



@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}

HISTORY_FILE = Path("data/history.json")

@router.post("/history/add")
async def add_history_entry(entry: dict):
    """Add prediction to live history"""
    history = []
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE, 'r') as f:
            history = json.load(f)
    
    history.insert(0, {
        "timestamp": entry.get("timestamp", ""),
        "age": entry.get("age", 0),
        "length_of_stay": entry.get("length_of_stay", 0),
        "prediction": entry.get("prediction", 1),
        "anomaly_score": entry.get("anomaly_score", 0.0)
    })
    
    # Keep last 100
    history = history[:100]
    
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f)
    
    return {"status": "saved", "total": len(history)}

@router.get("/history")
async def get_history():
    """Get live history for charts"""
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE, 'r') as f:
            history = json.load(f)
        return history[-50:]  # Last 50
    return []