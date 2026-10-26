import os
import io
import json
from app import create_app
from app.models import User
from flask_jwt_extended import create_access_token

def test_upload_flow():
    app = create_app()
    with app.app_context():
        client = app.test_client()
        user = User.query.filter_by(email='user@meditrack.local').first()
        if not user:
            print("ERROR: User user@meditrack.local not found!")
            return
        
        token = create_access_token(identity=str(user.id))
        headers = {'Authorization': f'Bearer {token}'}

        test_img_path = os.path.join(os.path.dirname(__file__), 'test_prescription_multi.png')
        with open(test_img_path, 'rb') as f:
            data = {
                'file': (io.BytesIO(f.read()), 'test_prescription_multi.png')
            }
            res = client.post('/api/prescriptions/upload', headers=headers, data=data, content_type='multipart/form-data')
            print(f"Flask TestClient Status: {res.status_code}")
            try:
                res_json = res.get_json()
                print("Response JSON keys:", list(res_json.keys()) if res_json else "None")
                if res.status_code == 201:
                    print("Extracted Text Preview:\n", res_json.get('extracted_text', '')[:200])
                    print("Medicines Detected:", res_json.get('parsed_fields', {}).get('total_medicines_detected'))
                    for m in res_json.get('parsed_fields', {}).get('medicines', []):
                        print(f"  -> {m.get('medicine_name')} | {m.get('strength')} | {m.get('dosage')} | {m.get('frequency')} | {m.get('timing')} | {m.get('duration')}")
                else:
                    print("Error response:", res_json)
            except Exception as e:
                print("Error parsing json:", e, res.data)

if __name__ == '__main__':
    test_upload_flow()
