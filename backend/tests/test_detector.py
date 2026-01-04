"""
Unit Tests for Detector
"""

import unittest
import numpy as np
from ml.detector import AdvancedThreatDetector


class TestDetector(unittest.TestCase):
    
    def setUp(self):
        self.detector = AdvancedThreatDetector()
    
    def test_predict_shape(self):
        """Test prediction shape"""
        X = np.random.randn(10, 40)
        # Mock models
        self.detector.scaler = DummyScaler()
        self.detector.ensemble = DummyEnsemble()
        result = self.detector.predict(X)
        self.assertEqual(len(result['prediction']), 10)


class DummyScaler:
    def transform(self, X):
        return X


class DummyEnsemble:
    def predict(self, X):
        return np.zeros(len(X))
    
    def predict_proba(self, X):
        return np.zeros(len(X))


if __name__ == '__main__':
    unittest.main()
    