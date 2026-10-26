import os
import re
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_safe_filename(original_filename, user_id=0):
    ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else 'jpg'
    safe_name = secure_filename(original_filename.rsplit('.', 1)[0])
    if not safe_name:
        safe_name = "prescription"
    import time
    timestamp = int(time.time())
    return f"u{user_id}_{timestamp}_{safe_name}.{ext}"

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
