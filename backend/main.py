"""
Main training & server script
Run this to:
  1. Train all models
  2. Start Flask server
"""
import logging
import sys
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Add to path
sys.path.insert(0, str(Path(__file__).parent))

import config
from ml.detector import AdvancedThreatDetector
from api import create_app

def train_models():
    """Train all models"""
    logger.info("=" * 60)
    logger.info("🎯 STARTING MODEL TRAINING")
    logger.info("=" * 60)
    
    try:
        detector = AdvancedThreatDetector()
        metrics = detector.train_all()
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ TRAINING COMPLETE")
        logger.info("=" * 60)
        logger.info(f"Accuracy: {metrics['accuracy']:.2%}")
        logger.info(f"Precision: {metrics['precision']:.2%}")
        logger.info(f"Recall: {metrics['recall']:.2%}")
        logger.info(f"F1-Score: {metrics['f1']:.2%}")
        logger.info(f"AUC-ROC: {metrics['auc']:.2%}")
        logger.info("=" * 60)
        
        return True
    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
        return False

def run_server():
    """Start Flask server"""
    logger.info("\n" + "=" * 60)
    logger.info("🚀 STARTING FLASK SERVER")
    logger.info("=" * 60)
    
    app = create_app()
    
    logger.info(f"Backend URL: http://localhost:5000")
    logger.info(f"API Base: http://localhost:5000/api")
    logger.info(f"Environment: {config.FLASK_ENV}")
    logger.info("=" * 60)
    
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=config.DEBUG
    )

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Intrusion Detection System")
    parser.add_argument("--train", action="store_true", help="Train models")
    parser.add_argument("--server", action="store_true", default=True, help="Run server")
    
    args = parser.parse_args()
    
    if args.train:
        detector = AdvancedThreatDetector()
        metrics = detector.train_all()  # ✅ CORRECT
        
        print("\n" + "="*60)
        print("✅ TRAINING COMPLETE ✅")
        print("="*60)
        for key, value in metrics.items():
            if isinstance(value, (int, float)):
                print(f"{key}: {value:.4f}")
        print("="*60)
    
    if args.server:
        run_server()