"""
Alert Generation and Management
"""

import logging
from typing import Dict
from datetime import datetime

logger = logging.getLogger(__name__)


class AlertManager:
    """Generate and manage alerts"""
    
    def __init__(self):
        self.alerts = []
    
    def generate_alert(self, threat_data: Dict) -> Dict:
        """Generate alert from threat"""
        confidence = threat_data.get('confidence', 0)
        
        if confidence > 0.95:
            severity = 'CRITICAL'
        elif confidence > 0.85:
            severity = 'WARNING'
        else:
            severity = 'INFO'
        
        alert = {
            'severity': severity,
            'threat': threat_data,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.alerts.append(alert)
        return alert