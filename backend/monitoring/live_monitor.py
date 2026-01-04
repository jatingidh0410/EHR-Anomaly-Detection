"""
Real-time Threat Monitoring
"""

import logging
from typing import List, Dict
from datetime import datetime

logger = logging.getLogger(__name__)


class LiveMonitor:
    """Real-time threat monitor"""
    
    def __init__(self):
        self.threats = []
        self.max_buffer = 1000
    
    def add_threat(self, threat_data: Dict):
        """Add threat to monitor"""
        self.threats.append({
            **threat_data,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        # Keep buffer size limited
        if len(self.threats) > self.max_buffer:
            self.threats.pop(0)
    
    def get_recent(self, limit: int = 100) -> List[Dict]:
        """Get recent threats"""
        return self.threats[-limit:]