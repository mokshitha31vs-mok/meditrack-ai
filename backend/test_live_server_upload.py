import os
import json
import urllib.request
import urllib.parse
from app import create_app
from app.models import User
from flask_jwt_extended import create_access_token

def test_live_http_upload():
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email='user@meditrack.local').first()
        token = create_access_token(identity=str(user.id))

    boundary = '----WebKitFormBoundaryTest123456789'
    img_path = os.path.join(os.path.dirname(__file__), 'test_prescription_multi.png')
    with open(img_path, 'rb') as f:
        file_bytes = f.read()

    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="file"; filename="test_prescription_multi.png"\r\n'
        f'Content-Type: image/png\r\n\r\n'
    ).encode('utf-8') + file_bytes + f'\r\n--{boundary}--\r\n'.encode('utf-8')

    req = urllib.request.Request(
        'http://127.0.0.1:5000/api/prescriptions/upload',
        data=body,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': f'multipart/form-data; boundary={boundary}'
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            print("HTTP Status Code:", response.status)
            res_json = json.loads(res_body)
            print("Message:", res_json.get('message'))
            print("Medicines Detected:", res_json.get('parsed_fields', {}).get('total_medicines_detected'))
            for m in res_json.get('parsed_fields', {}).get('medicines', []):
                print(f"  -> {m.get('medicine_name')} ({m.get('strength')})")
    except urllib.error.HTTPError as e:
        print("HTTP Error:", e.code, e.read().decode('utf-8'))

if __name__ == '__main__':
    test_live_http_upload()
