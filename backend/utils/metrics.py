"""
Performance Metrics
"""

import logging
from datetime import datetime
from typing import Dict

logger = logging.getLogger(__name__)


class MetricsCollector:
    """Collect and report metrics"""
    
    def __init__(self):
        self.metrics = {
            'total_predictions': 0,
            'threats_detected': 0,
            'benign_detected': 0,
            'avg_confidence': 0,
            'start_time': datetime.now(),
        }
    
    def record_prediction(self, is_threat: bool, confidence: float):
        """Record prediction"""
        self.metrics['total_predictions'] += 1
        if is_threat:
            self.metrics['threats_detected'] += 1
        else:
            self.metrics['benign_detected'] += 1
        
        # Update average confidence
        current_avg = self.metrics['avg_confidence']
        total = self.metrics['total_predictions']
        self.metrics['avg_confidence'] = (
            (current_avg * (total - 1) + confidence) / total
        )
    
    def get_metrics(self) -> Dict:
        """Get all metrics"""
        return self.metrics