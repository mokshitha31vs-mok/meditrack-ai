import os
from app.services.medicine_parser import parse_prescription_text

def test_multi_medicine_parser():
    print("=== Testing Advanced Healthcare OCR Medicine Parser ===")

    raw_text = """CITY HEALTHCARE CLINIC - PRESCRIPTION
Dr. Aris Thorne, MD - Senior Consultant Physician
Registration No: 45281
Patient Name: Rahul Sharma    Date: 2026-10-23
Diagnosis: Acute Bronchitis and Fever

Rx:
1. Amoxicillin 500 mg
Take 1 capsule twice daily after food for 5 days
Qty: 10 capsules

2. Paracetamol 650 mg
Take 1 tablet as needed (SOS) for fever
Duration: 3 days

3. Cetirizine 10 mg
Take 1 tablet once daily at bedtime for 7 days

Signature: Dr. Aris Thorne
Follow-up: 5 days later
"""

    res = parse_prescription_text(raw_text)

    print(f"Detected Clinic: {res['header_info'].get('clinic_name')}")
    print(f"Detected Doctor: {res['header_info'].get('doctor_name')}")
    print(f"Detected Patient: {res['header_info'].get('patient_name')}")
    print(f"Total Medicines Detected: {res['total_medicines_detected']}")

    for idx, m in enumerate(res['medicines']):
        print(f"   [{idx+1}] {m['medicine_name']} | Strength: {m['strength']} | Dose: {m['dosage']} | Freq: {m['frequency']} | Timing: {m['timing']} | Dur: {m['duration']} | Status: {m['verification_status']}")

    # 1. Total medicines check
    assert res['total_medicines_detected'] == 3, f"Expected 3 medicines, got {res['total_medicines_detected']}"

    # 2. Medicine 1 check
    med1 = res['medicines'][0]
    assert med1['medicine_name'] == 'Amoxicillin'
    assert med1['strength'] == '500 mg'
    assert med1['dosage_form'] == 'Capsule'
    assert 'twice daily' in med1['frequency'].lower()
    assert '5 days' in med1['duration'].lower()

    # 3. Medicine 2 check (Independent dosage & SOS handling)
    med2 = res['medicines'][1]
    assert med2['medicine_name'] == 'Paracetamol'
    assert med2['strength'] == '650 mg'
    assert 'SOS' in med2['frequency']
    assert '3 days' in med2['duration'].lower()

    # 4. Medicine 3 check
    med3 = res['medicines'][2]
    assert med3['medicine_name'] == 'Cetirizine'
    assert med3['strength'] == '10 mg'
    assert 'once daily' in med3['frequency'].lower()
    assert '7 days' in med3['duration'].lower()

    # 5. Verify NO details were copied across medicines
    assert med1['strength'] != med2['strength']
    assert med1['frequency'] != med2['frequency']
    assert med1['duration'] != med2['duration']

    # 6. Verify Doctor and Patient were NOT classified as medicines
    med_names = [m['medicine_name'] for m in res['medicines']]
    assert 'Dr. Aris Thorne' not in med_names
    assert 'Rahul Sharma' not in med_names
    assert 'City Healthcare Clinic' not in med_names

    print("\nSUCCESS: Multi-medicine detection, layout filtering, and independent extraction verified 100%!")

if __name__ == '__main__':
    test_multi_medicine_parser()
