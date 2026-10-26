from app import create_app
from app.models import User, DoctorProfile, DoctorPatientAccess, Pharmacy, Medicine, Order, MedicationSchedule, Prescription, AuditLog
from app.services.ocr_service import perform_ocr
from app.services.medicine_parser import parse_prescription_text
from app.services.recommendation_service import calculate_pharmacy_recommendation

app = create_app()

with app.app_context():
    print("=== Testing MediTrack AI Backend Verification ===")

    # 1. Test User Accounts for all 5 roles
    users = User.query.all()
    print(f"[OK] Total registered users: {len(users)}")
    roles_present = set()
    for u in users:
        print(f"   - {u.name} ({u.email}) -> Role: {u.role}")
        roles_present.add(u.role)

    expected_roles = {'patient', 'doctor', 'pharmacy', 'delivery', 'admin'}
    assert expected_roles.issubset(roles_present), f"Missing roles: {expected_roles - roles_present}"
    print("[OK] All 5 roles confirmed present in database.")

    # 2. Test Doctor Clinical Access Grants
    doc = User.query.filter_by(role='doctor').first()
    assert doc is not None, "Doctor account missing"
    assert doc.doctor_profile is not None, "Doctor profile missing"
    print(f"[OK] Doctor Profile: {doc.name} | Spec: {doc.doctor_profile.specialization} | License: {doc.doctor_profile.license_number}")

    grants = DoctorPatientAccess.query.filter_by(doctor_id=doc.id).all()
    assert len(grants) > 0, "Doctor clinical access grant missing"
    print(f"[OK] Authorized Patient Grants for Doctor: {len(grants)}")

    # 3. Test Medicines & Pharmacies
    meds = Medicine.query.all()
    pharmacies = Pharmacy.query.all()
    print(f"[OK] Total medicines: {len(meds)}, Total pharmacies: {len(pharmacies)}")
    assert len(meds) >= 5, "Insufficient medicines"
    assert len(pharmacies) >= 2, "Insufficient pharmacies"

    # 4. Test Prescriptions & Schedules
    prescriptions = Prescription.query.all()
    print(f"[OK] Prescriptions stored: {len(prescriptions)}")
    assert len(prescriptions) > 0, "Prescription seed missing"
    schedules = MedicationSchedule.query.all()
    print(f"[OK] Medication schedules: {len(schedules)}")

    # 5. Test Recommendation Algorithm
    rec = calculate_pharmacy_recommendation([], 13.0827, 80.2707)
    print(f"[OK] Recommendation algorithm executes cleanly.")

    # 6. Test Orders
    orders = Order.query.all()
    print(f"[OK] Total seeded orders: {len(orders)}")
    for o in orders:
        print(f"   - Order #{o.id} | Status: {o.status} | Total: Rs. {o.total_amount}")

    # 7. Test Audit Logs
    audit_count = AuditLog.query.count()
    print(f"[OK] System Audit Logs Recorded: {audit_count}")
    assert audit_count > 0, "Audit logs missing"

    print("=== ALL BACKEND VERIFICATIONS PASSED 100% ===")
