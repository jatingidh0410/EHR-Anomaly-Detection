"""
Flask API Application with 30+ Endpoints
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import config

logger = logging.getLogger(__name__)

def create_app():
    """Create Flask application"""
    app = Flask(__name__)
    app.config.from_object(config)
    
    # Enable CORS - CORRECT LOCATION
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad Request'}), 400
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not Found'}), 404
    
    @app.errorhandler(500)
    def server_error(error):
        return jsonify({'error': 'Internal Server Error'}), 500
    
    # Register blueprints
    from app.routes.threat_detection import threat_bp
    from app.routes.monitoring import monitoring_bp
    from app.routes.admin import admin_bp
    
    app.register_blueprint(threat_bp)
    app.register_blueprint(monitoring_bp)
    app.register_blueprint(admin_bp)
    
    # Health check
    @app.route('/api/system/health', methods=['GET'])
    def health():
        return jsonify({
            'status': 'healthy',
            'version': '1.0.0',
            'environment': config.FLASK_ENV
        })
    
    logger.info("✅ Flask app created with all blueprints")
    return app
