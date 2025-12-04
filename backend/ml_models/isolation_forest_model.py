import pandas as pd
from pathlib import Path
from sklearn.ensemble import IsolationForest
import joblib
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnomalyModel:
    def __init__(self, data_path="data/processed_mimic_for_ml.csv", model_path="ml_models/isolation_forest_model.pkl"):
        self.data_path = Path(data_path)
        self.model_path = Path(model_path)
        self.model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    
    def load_data(self):
        logger.info(f"Loading processed data from {self.data_path}")
        data = pd.read_csv(self.data_path, index_col=0)
        return data
    
    def train(self):
        X = self.load_data()
        logger.info(f"Training Isolation Forest on dataset with shape: {X.shape}")
        self.model.fit(X)
        logger.info("Training complete")
    
    def save_model(self):
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, self.model_path)
        logger.info(f"Model saved to {self.model_path}")
    
    def run(self):
        self.train()
        self.save_model()

if __name__ == "__main__":
    anomaly = AnomalyModel()
    anomaly.run()
