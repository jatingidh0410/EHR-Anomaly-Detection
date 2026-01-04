"""SHAP Explainer"""
import logging

logger = logging.getLogger(__name__)

class ThreatExplainer:
    """Feature importance explanation"""
    
    def __init__(self, model, feature_names):
        self.model = model
        self.feature_names = feature_names
        logger.info("✅ ThreatExplainer initialized")
    
    def explain(self, X):
        """Get feature importance"""
        if hasattr(self.model, 'feature_importances_'):
            return self.model.feature_importances_
        return None