"""
Data Access Layer
"""

import logging
from datetime import datetime, timedelta
from database.models import Threat, Alert, SystemMetrics
from database.db import db

logger = logging.getLogger(__name__)


class ThreatRepository:
    """Threat data access"""
    
    @staticmethod
    def create(prediction: int, confidence: float, threat_level: str, **kwargs) -> Threat:
        """Create threat record"""
        threat = Threat(
            prediction=prediction,
            confidence=confidence,
            threat_level=threat_level,
            **kwargs
        )
        db.session.add(threat)
        db.session.commit()
        return threat
    
    @staticmethod
    def get_recent(hours: int = 24):
        """Get recent threats"""
        since = datetime.utcnow() - timedelta(hours=hours)
        return Threat.query.filter(Threat.timestamp >= since).all()
    
    @staticmethod
    def get_by_id(threat_id: int) -> Threat:
        """Get threat by ID"""
        return Threat.query.get(threat_id)


class AlertRepository:
    """Alert data access"""
    
    @staticmethod
    def create(threat_id: int, severity: str, message: str) -> Alert:
        """Create alert"""
        alert = Alert(
            threat_id=threat_id,
            severity=severity,
            message=message
        )
        db.session.add(alert)
        db.session.commit()
        return alert
    
    @staticmethod
    def get_unsent():
        """Get unsent alerts"""
        return Alert.query.filter(Alert.sent == False).all()
