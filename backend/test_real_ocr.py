import os
from app import create_app
from app.services.ocr_service import perform_ocr
from app.services.medicine_parser import parse_prescription_text

app = create_app()

with app.app_context():
    print("=== Testing REAL Image-Dependent OCR Pipeline ===")

    file_a = os.path.join(os.path.dirname(__file__), "test_prescription_A.png")
    file_b = os.path.join(os.path.dirname(__file__), "test_prescription_B.png")
    file_multi = os.path.join(os.path.dirname(__file__), "test_prescription_multi.png")

    # Image A Test
    print("\n--- Processing Image A (test_prescription_A.png) ---")
    text_a, engine_a, conf_a, items_a = perform_ocr(file_a)
    parsed_a = parse_prescription_text(text_a)
    print(f"Engine: {engine_a}")
    print(f"Raw Text Output:\n{text_a}")
    print(f"Extracted Medicine: {parsed_a['medicine_name']} | Strength: {parsed_a['strength']} | Dose: {parsed_a['dosage']} | Qty: {parsed_a['quantity']}")

    # Image B Test
    print("\n--- Processing Image B (test_prescription_B.png) ---")
    text_b, engine_b, conf_b, items_b = perform_ocr(file_b)
    parsed_b = parse_prescription_text(text_b)
    print(f"Engine: {engine_b}")
    print(f"Raw Text Output:\n{text_b}")
    print(f"Extracted Medicine: {parsed_b['medicine_name']} | Strength: {parsed_b['strength']} | Dose: {parsed_b['dosage']} | Qty: {parsed_b['quantity']}")

    # Multi-Medicine Image Test
    print("\n--- Processing Multi-Medicine Prescription (test_prescription_multi.png) ---")
    text_m, engine_m, conf_m, items_m = perform_ocr(file_multi)
    parsed_m = parse_prescription_text(text_m)
    print(f"Engine: {engine_m}")
    print(f"Clinic: {parsed_m['header_info'].get('clinic_name')}")
    print(f"Doctor: {parsed_m['header_info'].get('doctor_name')}")
    print(f"Patient: {parsed_m['header_info'].get('patient_name')}")
    print(f"Medicines Detected Count: {parsed_m['total_medicines_detected']}")
    for i, med in enumerate(parsed_m['medicines']):
        print(f"   [{i+1}] {med['medicine_name']} | Strength: {med['strength']} | Dose: {med['dosage']} | Freq: {med['frequency']} | Timing: {med['timing']} | Dur: {med['duration']}")

    # Assertion Checks
    print("\n=== OCR DIFFERENTIATION & ACCURACY VERIFICATION ===")
    assert parsed_a['medicine_name'] != parsed_b['medicine_name'], "FAIL: OCR results are identical!"
    assert parsed_a['medicine_name'] == "Amoxicillin", f"Expected Amoxicillin, got {parsed_a['medicine_name']}"
    assert parsed_b['medicine_name'] == "Azithromycin", f"Expected Azithromycin, got {parsed_b['medicine_name']}"

    assert parsed_m['total_medicines_detected'] >= 2, f"Expected at least 2-3 medicines, got {parsed_m['total_medicines_detected']}"
    m_names = [m['medicine_name'] for m in parsed_m['medicines']]
    assert "Amoxicillin" in m_names, f"Amoxicillin missing from {m_names}"

    print("\nSUCCESS! OCR dynamically read all images, differentiated medicines, and parsed multiple entries cleanly.")
