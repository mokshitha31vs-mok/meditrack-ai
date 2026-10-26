import os
import io
import json
from app import create_app
from app.services.ocr_service import perform_ocr
from app.services.medicine_parser import parse_prescription_text
from app.models import User
from flask_jwt_extended import create_access_token

app = create_app()

def test_full_ocr_pipeline():
    print("=" * 70)
    print("TEST 1: OCR & PARSER ON USER'S SUPPLIED PRESCRIPTION IMAGE")
    print("=" * 70)
    image1 = "backend/uploads/u6_1792750940_Screenshot_2026-10-08_225510.png"
    assert os.path.exists(image1), f"Image file not found: {image1}"

    text1, engine1, conf1, items1 = perform_ocr(image1)
    print(f"Engine: {engine1}")
    print(f"Confidence: {conf1}%")
    print(f"Extracted Lines Count: {len(text1.splitlines())}")

    parsed1 = parse_prescription_text(text1)
    meds1 = parsed1.get('medicines', [])
    print(f"Total Medicines Detected: {len(meds1)}")
    print(json.dumps(meds1, indent=2))

    # Assert all 4 medicines are identified
    med_names = [m['medicine_name'].lower() for m in meds1]
    assert any('amoxicillin' in n for n in med_names), "Amoxicillin not detected"
    assert any('paracetamol' in n for n in med_names), "Paracetamol not detected"
    assert any('pantoprazole' in n for n in med_names), "Pantoprazole not detected"
    assert any('cetirizine' in n for n in med_names), "Cetirizine not detected"

    # Assert each medicine contains ONLY the 4 required fields (+ verification/raw text metadata)
    forbidden_keys = {'patient_name', 'doctor_name', 'hospital_name', 'address', 'phone', 'diagnosis', 'strength', 'dosage_form', 'route', 'advice', 'follow_up'}
    for m in meds1:
        assert set(m.keys()).isdisjoint(forbidden_keys), f"Forbidden field found in medicine: {set(m.keys()) & forbidden_keys}"
        assert 'medicine_name' in m
        assert 'units_per_dose' in m
        assert 'administration_times' in m
        assert 'duration_days' in m

    print("\n--- Field-by-Field Reference Comparison ---")
    for m in meds1:
        name = m['medicine_name']
        units = m['units_per_dose']
        times = m['administration_times']
        dur = m['duration_days']
        times_display = ", ".join(t.capitalize() for t in times) if times else "Requires review if exact times cannot be established"
        print(f"| {name:<14} | Units: {str(units):<4} | Times: {times_display:<50} | Duration: {str(dur) + ' days':<10} |")

    print("\n" + "=" * 70)
    print("TEST 2: OCR & PARSER ON SECOND PRESCRIPTION IMAGE")
    print("=" * 70)
    image2 = "backend/uploads/u5_1791478144_Screenshot_2026-10-08_221008.png"
    if os.path.exists(image2):
        text2, engine2, conf2, items2 = perform_ocr(image2)
        parsed2 = parse_prescription_text(text2)
        meds2 = parsed2.get('medicines', [])
        print(f"Second image engine: {engine2}, conf: {conf2}%")
        print(f"Second image detected {len(meds2)} medicine(s):")
        for m in meds2:
            print(f" - {m.get('medicine_name')}: units={m.get('units_per_dose')}, times={m.get('administration_times')}, duration={m.get('duration_days')}")
    else:
        print(f"Note: Second image {image2} not found, skipping second image file test.")

    print("\n" + "=" * 70)
    print("TEST 3: LIVE FLASK CLIENT ENDPOINT TEST (Upload -> Verify -> Get/Refresh)")
    print("=" * 70)
    with app.app_context():
        patient = User.query.filter_by(role='patient').first()
        if not patient:
            patient = User(name="Test Patient", email="testpatient_ocr@meditrack.com", role="patient")
            patient.set_password("Password123!")
            from app.extensions import db
            db.session.add(patient)
            db.session.commit()
        token = create_access_token(identity=str(patient.id))

        client = app.test_client()
        headers = {'Authorization': f'Bearer {token}'}

        # Step A: Upload image
        with open(image1, 'rb') as f:
            file_bytes = f.read()

        data = {
            'file': (io.BytesIO(file_bytes), 'presc_test.png')
        }
        upload_resp = client.post('/api/prescriptions/upload', headers=headers, data=data, content_type='multipart/form-data')
        print(f"Upload Response Status: {upload_resp.status_code}")
        assert upload_resp.status_code == 201, f"Upload failed: {upload_resp.get_data(as_text=True)}"
        upload_data = upload_resp.get_json()
        prescription_id = upload_data['prescription']['id']
        parsed_medicines = upload_data['parsed_fields']['medicines']
        print(f"Uploaded Prescription ID: {prescription_id}")
        print(f"Medicines returned from Upload endpoint: {len(parsed_medicines)}")

        # Step B: Verify medicines (submitting 4 fields)
        verified_payload = {
            'verified_medicines': [
                {
                    'medicine_name': 'Amoxicillin',
                    'units_per_dose': 1,
                    'administration_times': ['morning', 'night'],
                    'duration_days': 5
                },
                {
                    'medicine_name': 'Paracetamol',
                    'units_per_dose': 1,
                    'administration_times': ['morning', 'afternoon', 'night'],
                    'duration_days': 3
                },
                {
                    'medicine_name': 'Pantoprazole',
                    'units_per_dose': 1,
                    'administration_times': ['morning'],
                    'duration_days': 10
                },
                {
                    'medicine_name': 'Cetirizine',
                    'units_per_dose': 1,
                    'administration_times': ['night'],
                    'duration_days': 7
                }
            ]
        }
        verify_resp = client.put(
            f'/api/prescriptions/{prescription_id}/verify',
            headers=headers,
            json=verified_payload
        )
        print(f"Verify Response Status: {verify_resp.status_code}")
        assert verify_resp.status_code == 200, f"Verify failed: {verify_resp.get_data(as_text=True)}"
        verify_data = verify_resp.get_json()
        print(f"Schedules Created: {len(verify_data.get('schedules', []))}")

        # Step C: Re-fetch (Simulating page refresh)
        get_resp = client.get(
            f'/api/prescriptions/{prescription_id}',
            headers=headers
        )
        print(f"Get/Refresh Response Status: {get_resp.status_code}")
        assert get_resp.status_code == 200, f"Get failed: {get_resp.get_data(as_text=True)}"
        get_data = get_resp.get_json()
        assert get_data['is_verified'] is True, "Prescription should be marked verified"
        assert len(get_data['structured_medicines']) == 4, "Structured medicines not persisted properly"
        print("Persisted 4-field medicines verified after refresh:")
        for sm in get_data['structured_medicines']:
            print(f"  * {sm['medicine_name']} | units={sm['units_per_dose']} | times={sm['administration_times']} | duration={sm['duration_days']} days")

    print("\nALL TESTS PASSED WITH 100% SUCCESS!")

if __name__ == '__main__':
    test_full_ocr_pipeline()
