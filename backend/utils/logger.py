"""
Logging Setup
"""

import logging
import logging.handlers
from pathlib import Path
import config


def setup_logging(name: str) -> logging.Logger:
    """Setup logging"""
    logger = logging.getLogger(name)
    logger.setLevel(config.LOG_LEVEL)
    
    # Console handler
    ch = logging.StreamHandler()
    ch.setLevel(config.LOG_LEVEL)
    formatter = logging.Formatter(config.LOG_FORMAT)
    ch.setFormatter(formatter)
    logger.addHandler(ch)
    
    # File handler
    Path(config.LOGS_FOLDER).mkdir(parents=True, exist_ok=True)
    fh = logging.handlers.RotatingFileHandler(
        config.APP_LOG_FILE,
        maxBytes=10485760,
        backupCount=10
    )
    fh.setLevel(config.LOG_LEVEL)
    fh.setFormatter(formatter)
    logger.addHandler(fh)
    
    return logger