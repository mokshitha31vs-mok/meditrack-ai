import os
import io
import json
from app import create_app
from app.models import User, Prescription, MedicationSchedule, AuditLog
from flask_jwt_extended import create_access_token

def run_tests():
    app = create_app()
    with app.app_context():
        client = app.test_client()

        # Step 1: Authenticate Patient
        user = User.query.filter_by(email='user@meditrack.local').first()
        assert user is not None, "Test patient user@meditrack.local must exist in database"
        token = create_access_token(identity=str(user.id))
        headers = {'Authorization': f'Bearer {token}'}

        print("=== TEST A & B: Image Upload & Real OCR Processing ===")
        img_path = os.path.join(os.path.dirname(__file__), 'test_prescription_multi.png')
        assert os.path.exists(img_path), "Test prescription image must exist"
        
        with open(img_path, 'rb') as f:
            data = {'file': (io.BytesIO(f.read()), 'test_prescription_multi.png')}
            res = client.post('/api/prescriptions/upload', headers=headers, data=data, content_type='multipart/form-data')

        assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.get_json()}"
        res_data = res.get_json()
        rx = res_data['prescription']
        rx_id = rx['id']
        extracted_text = res_data['extracted_text']
        parsed_fields = res_data['parsed_fields']
        ocr_engine = res_data['ocr_engine_used']
        confidence = res_data['confidence']

        print(f"[PASSED] Upload succeeded! Prescription ID #{rx_id}")
        print(f"[PASSED] OCR Engine: {ocr_engine} (Confidence: {confidence}%)")
        print(f"[PASSED] Raw Text Extracted: {len(extracted_text)} chars")
        assert len(extracted_text) > 20, "OCR must extract real text from the image"

        print("\n=== TEST C, D & E: Multi-Medicine Extraction, Independent Dosages, and Header Filtering ===")
        meds = parsed_fields.get('medicines', [])
        med_names = [m.get('medicine_name', '').lower() for m in meds]
        print(f"Total medicines detected: {len(meds)}")
        for idx, m in enumerate(meds, 1):
            print(f"  Medicine {idx}: {m.get('medicine_name')} | Strength: {m.get('strength')} | Dose: {m.get('dosage')} | Freq: {m.get('frequency')} | Timing: {m.get('timing')} | Dur: {m.get('duration')}")

        # Check multi-medicine
        assert len(meds) >= 2, f"Expected at least 2 medicines, detected {len(meds)}"
        assert any('amoxicillin' in n for n in med_names), "Amoxicillin must be detected"
        assert any('cetirizine' in n for n in med_names), "Cetirizine must be detected"

        # Check independent strengths (no dosage bleed)
        amox = next(m for m in meds if 'amoxicillin' in m.get('medicine_name', '').lower())
        cet = next(m for m in meds if 'cetirizine' in m.get('medicine_name', '').lower())
        assert amox.get('strength') == '500 mg', f"Expected Amoxicillin 500 mg, got {amox.get('strength')}"
        assert cet.get('strength') == '10 mg', f"Expected Cetirizine 10 mg, got {cet.get('strength')}"
        assert amox.get('strength') != cet.get('strength'), "Different medicines must have distinct strengths"
        print("[PASSED] Independent strengths verified: Amoxicillin (500 mg) vs Cetirizine (10 mg) - Zero dosage bleed!")

        # Check header/doctor/patient filtering (False candidates prevented)
        for non_med in ['cityhealthcareclinic', 'aris thorne', 'rahul sharma', 'prescription']:
            assert not any(non_med in n for n in med_names), f"False candidate '{non_med}' incorrectly extracted as medicine"
        print("[PASSED] Header, doctor name, and patient name properly excluded from medicine list.")

        print("\n=== TEST F: Manual Verification & Database Persistence ===")
        verified_payload = {
            'verified_medicines': [
                {
                    'medicine_name': 'Amoxicillin',
                    'strength': '500 mg',
                    'dosage': '1 capsule',
                    'frequency': 'Twice daily',
                    'timing': 'Morning, Night',
                    'route': 'Oral',
                    'duration': '5 days',
                    'quantity': 10
                },
                {
                    'medicine_name': 'Cetirizine',
                    'strength': '10 mg',
                    'dosage': '1 tablet',
                    'frequency': 'Once daily',
                    'timing': 'Night',
                    'route': 'Oral',
                    'duration': '7 days',
                    'quantity': 7
                }
            ]
        }
        verify_res = client.put(f'/api/prescriptions/{rx_id}/verify', headers=headers, json=verified_payload)
        assert verify_res.status_code == 200, f"Expected 200, got {verify_res.status_code}: {verify_res.get_json()}"
        verify_data = verify_res.get_json()
        print(f"[PASSED] Verification response: {verify_data.get('message')}")
        schedules = verify_data.get('schedules', [])
        assert len(schedules) == 2, f"Expected 2 schedules, created {len(schedules)}"

        # Verify database persistence
        db_rx = Prescription.query.get(rx_id)
        assert db_rx.is_verified is True, "Prescription must be marked is_verified=True"
        db_schedules = MedicationSchedule.query.filter_by(prescription_id=rx_id).all()
        assert len(db_schedules) == 2, "2 MedicationSchedule records must persist in database"
        print(f"[PASSED] Verified persistence in database. Rx #{rx_id} has {len(db_schedules)} active schedules.")

        print("\n=== TEST G: Failure Handling (Invalid File Format) ===")
        bad_data = {'file': (io.BytesIO(b"corrupted exe file"), 'malicious_script.exe')}
        bad_res = client.post('/api/prescriptions/upload', headers=headers, data=bad_data, content_type='multipart/form-data')
        assert bad_res.status_code == 400, f"Expected 400, got {bad_res.status_code}"
        print(f"[PASSED] Bad file type safely rejected with 400: {bad_res.get_json().get('error')}")

        print("\n=== ALL CRITICAL E2E UPLOAD AND OCR TESTS PASSED 100%! ===")

if __name__ == '__main__':
    run_tests()
