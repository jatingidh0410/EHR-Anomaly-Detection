"""
Database Models using SQLAlchemy
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Threat(db.Model):
    """Threat log model"""
    __tablename__ = 'threats'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    prediction = db.Column(db.Integer)  # 0=benign, 1=threat
    confidence = db.Column(db.Float)
    threat_level = db.Column(db.String(50))  # CRITICAL, WARNING, ALERT, NORMAL
    anomaly_score = db.Column(db.Float, nullable=True)
    attack_type = db.Column(db.String(100), nullable=True)
    source_ip = db.Column(db.String(50), nullable=True)
    destination_ip = db.Column(db.String(50), nullable=True)
    features = db.Column(db.JSON, nullable=True)
    explanation = db.Column(db.JSON, nullable=True)


class Alert(db.Model):
    """Alert model"""
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    threat_id = db.Column(db.Integer, db.ForeignKey('threats.id'))
    severity = db.Column(db.String(50))
    message = db.Column(db.String(500))
    sent = db.Column(db.Boolean, default=False)


class SystemMetrics(db.Model):
    """System metrics model"""
    __tablename__ = 'system_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    total_predictions = db.Column(db.Integer)
    threats_detected = db.Column(db.Integer)
    avg_confidence = db.Column(db.Float)
    avg_response_time = db.Column(db.Float)