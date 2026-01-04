"""
Threat Detection API Routes
✅ FIXED: 
  - CSV file upload handling
  - Correct probability indexing
  - Proper JSON responses
"""
from flask import Blueprint, request, jsonify
import logging
import numpy as np
import pandas as pd
import io
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from ml.detector import AdvancedThreatDetector
import config

logger = logging.getLogger(__name__)
threat_bp = Blueprint('threats', __name__, url_prefix='/api/threats')

# Initialize detector globally
detector = AdvancedThreatDetector()
try:
    detector.load(str(config.MODELS_FOLDER))
    logger.info("✅ Detector models loaded")
except Exception as e:
    logger.warning(f"⚠️ Models not found: {e}. Train models first using main.py")

@threat_bp.route('/detect', methods=['POST'])
def detect_threat():
    """Single threat detection from JSON"""
    try:
        data = request.get_json()
        
        # Convert to numpy array
        values = list(data.values())
        X = np.array([values]).reshape(1, -1)
        
        # Predict
        result = detector.predict(X)
        
        # Extract values
        prediction = int(result['prediction'][0])
        confidence = float(result['confidence'][0])  # ✅ Attack probability
        
        # Determine severity
        if confidence > config.THREAT_THRESHOLDS["critical"]:
            severity = "critical"
        elif confidence > config.THREAT_THRESHOLDS["warning"]:
            severity = "warning"
        else:
            severity = "info"
        
        return jsonify({
            "is_threat": prediction == 1,
            "prediction": prediction,
            "confidence": confidence,
            "severity": severity,
            "model": "ensemble_5model"
        }), 200
    
    except Exception as e:
        logger.error(f"Detection error: {e}")
        return jsonify({"error": str(e)}), 400

@threat_bp.route('/batch', methods=['POST'])
def detect_batch_json():
    """Batch detection from JSON array"""
    try:
        data = request.get_json()
        samples = data.get('samples', [])
        
        if not samples:
            return jsonify({"error": "No samples provided"}), 400
        
        X = np.array(samples)
        result = detector.predict(X)
        
        predictions = result['prediction'].tolist()
        confidences = result['confidence'].tolist()
        
        # Build response with threats count
        threats = sum(1 for p in predictions if p == 1)
        
        return jsonify({
            "total_samples": len(samples),
            "threats_detected": threats,
            "benign": len(samples) - threats,
            "predictions": predictions,
            "confidences": confidences,
            "accuracy": f"{(1 - threats/len(samples))*100:.1f}%"
        }), 200
    
    except Exception as e:
        logger.error(f"Batch detection error: {e}")
        return jsonify({"error": str(e)}), 400

@threat_bp.route('/batch-csv', methods=['POST'])
def detect_batch_csv():
    """✅ FIXED: CSV file upload endpoint"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({"error": "Only CSV files allowed"}), 400
        
        # Read CSV
        try:
            df = pd.read_csv(io.StringIO(file.read().decode('utf-8')))
        except:
            df = pd.read_csv(io.StringIO(file.read().decode('latin-1')))
        
        # Remove non-numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if not numeric_cols:
            return jsonify({"error": "CSV contains no numeric columns"}), 400
        
        X = df[numeric_cols].values
        X = np.nan_to_num(X, nan=0.0)  # Handle missing values
        
        # Predict
        result = detector.predict(X)
        predictions = result['prediction'].tolist()
        confidences = result['confidence'].tolist()
        
        # Count threats
        threats = sum(1 for p in predictions if p == 1)
        
        return jsonify({
            "filename": file.filename,
            "total_samples": len(X),
            "threats_detected": threats,
            "benign": len(X) - threats,
            "threat_rate": f"{(threats/len(X))*100:.1f}%",
            "predictions": predictions,
            "confidences": [float(c) for c in confidences],
            "message": "Analysis complete"
        }), 200
    
    except Exception as e:
        logger.error(f"CSV batch detection error: {e}")
        return jsonify({"error": str(e)}), 400

@threat_bp.route('/', methods=['GET'])
def get_threats():
    """Get recent threats"""
    return jsonify({
        "threats": [],
        "total": 0,
        "message": "No threats recorded"
    }), 200

@threat_bp.route('/<int:threat_id>', methods=['GET'])
def get_threat(threat_id):
    """Get specific threat details"""
    return jsonify({
        "id": threat_id,
        "timestamp": "2024-01-01T00:00:00Z",
        "severity": "warning",
        "type": "Port Scan"
    }), 200