from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models import User

def role_required(roles):
    """
    Decorator to restrict route access based on user role(s).
    roles: string or list of strings, e.g. 'admin' or ['admin', 'pharmacy']
    """
    if isinstance(roles, str):
        roles = [roles]

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            # Convert user_id to int if necessary
            if isinstance(user_id, str) and user_id.isdigit():
                user_id = int(user_id)
            user = User.query.get(user_id)
            if not user or user.role not in roles:
                return jsonify({
                    'error': 'Forbidden: Insufficient privileges',
                    'required_roles': roles,
                    'user_role': user.role if user else None
                }), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
