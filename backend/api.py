"""
Flask Application Factory
"""
from flask import Flask, jsonify
from flask_cors import CORS
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import config

logger = logging.getLogger(__name__)

def create_app():
    """Create Flask app"""
    app = Flask(__name__)
    app.config.from_object(config)
    
    # ✅ CORS enabled for frontend
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    logger.info("✅ CORS enabled")
    
    # Error handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad Request"}), 400
    
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not Found"}), 404
    
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal Server Error"}), 500
    
    # Health check
    @app.route('/api/system/health', methods=['GET'])
    def health():
        return jsonify({
            "status": "healthy",
            "version": "1.0.0",
            "environment": config.FLASK_ENV
        }), 200
    
    # Register blueprints
    from app.routes.threat_detection import threat_bp
    from app.routes.monitoring import monitoring_bp
    from app.routes.admin import admin_bp
    from app.routes.reports import reports_bp
    
    app.register_blueprint(threat_bp)
    app.register_blueprint(monitoring_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(reports_bp)
    
    logger.info("✅ All blueprints registered")
    
    return app