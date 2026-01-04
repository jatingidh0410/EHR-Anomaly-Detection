"""
Request/Response Middleware
"""

import logging
from functools import wraps
from flask import request, jsonify

logger = logging.getLogger(__name__)


def validate_json(f):
    """Validate JSON input"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({'error': 'Invalid JSON'}), 400
        return f(*args, **kwargs)
    return decorated_function