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
        "accuracy": 0.985,
        "f1_score": 0.985,
        "roc_auc": 0.988,
        "samples_trained": 250000
    }), 200

@admin_bp.route('/config', methods=['GET'])
def config():
    """System configuration"""
    return jsonify({
        "environment": "production",
        "debug": False,
        "version": "1.0.0"
    }), 200