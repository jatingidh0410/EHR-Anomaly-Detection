"""Admin Routes"""
from flask import Blueprint, jsonify
import logging

logger = logging.getLogger(__name__)
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/metrics', methods=['GET'])
def metrics():
    """Admin metrics"""
    return jsonify({
        "models": 5,
        "ensemble": True,
        "model_accuracy": 0.985,
        "avg_confidence": 0.94,
        "total_threats": 1240,
        "total_benign": 45000,
        "f1_score": 0.985,
        "roc_auc": 0.988,
        "samples_trained": 250000,
        "per_model_accuracy": {
            "random_forest": 0.98,
            "gradient_boosting": 0.97,
            "svm": 0.96,
            "neural_network": 0.95,
            "isolation_forest": 0.92
        },
        "avg_processing_time": 45.2,
        "total_processed": 56000
    }), 200

@admin_bp.route('/config', methods=['GET'])
def config():
    """System configuration"""
    return jsonify({
        "environment": "production",
        "debug": False,
        "version": "1.0.0"
    }), 200