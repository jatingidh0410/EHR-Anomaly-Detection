"""
Security Utilities
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)


def sanitize_input(data: Any) -> Any:
    """Sanitize user input"""
    if isinstance(data, str):
        # Remove potentially harmful characters
        return data.replace('<', '').replace('>', '').replace(';', '')
    return data


def validate_api_key(api_key: str, expected_key: str) -> bool:
    """Validate API key"""
    return api_key == expected_key