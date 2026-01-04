"""
Configuration file for Intrusion Detection System
Fix: Unified all paths and model names
"""
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"  # Adjust based on your structure
MODELS_FOLDER = BASE_DIR / "models"
MODELS_FOLDER.mkdir(exist_ok=True)

# Dataset paths
CICIDS_PATH = str(DATA_DIR / "cicids2017")
NETWORK_INTRUSION_PATH = str(DATA_DIR / "network_intrusion")
UNSW_PATH = str(DATA_DIR / "unsw_nb15")

# Model file names (CRITICAL)
MODEL_NAMES = {
    "rf": "random_forest.pkl",
    "gb": "gradient_boosting.pkl",
    "svm": "svm.pkl",
    "nn": "neural_network.pkl",
    "iso": "isolation_forest.pkl",
    "scaler": "scaler.pkl",
    "features": "features.pkl",
    "metrics": "advanced_metrics.pkl",
    "ensemble": "ensemble.pkl"
}

# ML Model hyperparameters
MODEL_PARAMS = {
    "random_forest": {
        "n_estimators": 200,
        "max_depth": 20,
        "min_samples_split": 5,
        "min_samples_leaf": 2,
        "random_state": 42,
        "n_jobs": -1,
        "class_weight": "balanced"
    },
    "gradient_boosting": {
        "n_estimators": 150,
        "learning_rate": 0.1,
        "max_depth": 7,
        "min_samples_split": 5,
        "subsample": 0.8,
        "random_state": 42
    },
    "svm": {
        "kernel": "rbf",
        "C": 100,
        "gamma": "scale",
        "probability": True,
        "random_state": 42
    },
    "neural_network": {
        "hidden_layer_sizes": (128, 64, 32),
        "activation": "relu",
        "solver": "adam",
        "learning_rate": "adaptive",
        "max_iter": 500,
        "random_state": 42,
        "early_stopping": True,
        "validation_fraction": 0.1
    },
    "isolation_forest": {
        "n_estimators": 100,
        "contamination": 0.1,
        "random_state": 42,
        "n_jobs": -1
    }
}

# Flask config
FLASK_ENV = os.getenv("FLASK_ENV", "development")
DEBUG = FLASK_ENV == "development"
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

# Database (optional - comment out if not using)
# DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///threats.db")

# Threat thresholds (CRITICAL FOR API RESPONSE)
THREAT_THRESHOLDS = {
    "critical": 0.95,
    "warning": 0.80,
    "normal": 0.0
}

# Logging
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
