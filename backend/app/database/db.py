"""
Database Connection and Initialization
"""

import logging
from flask_sqlalchemy import SQLAlchemy
import config

logger = logging.getLogger(__name__)

db = SQLAlchemy()


def init_db(app):
    """Initialize database"""
    app.config['SQLALCHEMY_DATABASE_URI'] = config.DATABASE_URL
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        logger.info("✅ Database initialized")


def get_db_session():
    """Get database session"""
    return db.session
