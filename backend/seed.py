import json
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models import (
    User, DoctorProfile, DoctorPatientAccess, Pharmacy, Medicine,
    PharmacyInventory, MedicationSchedule, MedicationReminder,
    Appointment, Order, OrderItem, Delivery, Cart, CartItem, Prescription, AuditLog
)

def seed_database():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        print("[Seed] Creating Core Users for All 5 Roles...")

        # 1. Patient User
        patient = User(
            name="Rahul Sharma",
            email="user@meditrack.local",
            phone="+91 98765 43210",
            role="patient",
            status="ACTIVE",
            address="No. 42, Mount Road, T. Nagar, Chennai, Tamil Nadu",
            latitude=13.0418,
            longitude=80.2341
        )
        patient.set_password("Demo@123")

        # 2. Doctor User
        doctor = User(
            name="Dr. Aris Thorne, MD",
            email="doctor@meditrack.local",
            phone="+91 98765 55555",
            role="doctor",
            status="ACTIVE",
            address="City Healthcare Clinic, Anna Salai, Chennai",
            latitude=13.0604,
            longitude=80.2496
        )
        doctor.set_password("Demo@123")

        # 3. Pharmacy User
        pharmacy_user = User(
            name="Apollo Pharmacist",
            email="pharmacy@meditrack.local",
            phone="+91 98765 11111",
            role="pharmacy",
            status="ACTIVE",
            address="Usman Road, T. Nagar, Chennai",
            latitude=13.0418,
            longitude=80.2341
        )
        pharmacy_user.set_password("Demo@123")

        # 4. Delivery Agent User
        delivery_user = User(
            name="Karthik Delivery",
            email="delivery@meditrack.local",
            phone="+91 98765 22222",
            role="delivery",
            status="ACTIVE",
            address="Adyar, Chennai",
            latitude=13.0067,
            longitude=80.2570
        )
        delivery_user.set_password("Demo@123")

        # 5. Administrator User
        admin_user = User(
            name="System Admin",
            email="admin@meditrack.local",
            phone="+91 98765 33333",
            role="admin",
            status="ACTIVE",
            address="Anna Nagar, Chennai",
            latitude=13.0850,
            longitude=80.2101
        )
        admin_user.set_password("Demo@123")

        db.session.add_all([patient, doctor, pharmacy_user, delivery_user, admin_user])
        db.session.commit()

        # Doctor Profile
        doc_prof = DoctorProfile(
            user_id=doctor.id,
            specialization="Internal Medicine & Cardiology",
            qualification="MBBS, MD (General Medicine)",
            license_number="MCI-48291",
            hospital_affiliation="City Healthcare Clinic",
            experience_years=12,
            consultation_fee=600.0,
            is_verified=True
        )
        db.session.add(doc_prof)

        # Clinical Access Grant between Dr. Thorne and Patient Rahul Sharma
        access_grant = DoctorPatientAccess(
            doctor_id=doctor.id,
            patient_id=patient.id,
            status="ACTIVE",
            access_reason="Primary Care Physician & Chronic Care Consultation"
        )
        db.session.add(access_grant)
        db.session.commit()

        print("[Seed] Creating Medicines Catalog...")
        medicines = [
            Medicine(name="Paracetamol", generic_name="Acetaminophen", dosage_form="Tablet", strength="500 mg", description="Pain reliever and fever reducer."),
            Medicine(name="Amoxicillin", generic_name="Amoxicillin Trihydrate", dosage_form="Capsule", strength="500 mg", description="Penicillin antibiotic used to treat bacterial infections."),
            Medicine(name="Azithromycin", generic_name="Azithromycin Dihydrate", dosage_form="Tablet", strength="500 mg", description="Macrolide antibiotic used for respiratory & skin infections."),
            Medicine(name="Cetirizine", generic_name="Cetirizine Hydrochloride", dosage_form="Tablet", strength="10 mg", description="Antihistamine used to relieve allergy symptoms."),
            Medicine(name="Ibuprofen", generic_name="Ibuprofen", dosage_form="Tablet", strength="400 mg", description="Nonsteroidal anti-inflammatory drug (NSAID)."),
            Medicine(name="Pantoprazole", generic_name="Pantoprazole Sodium", dosage_form="Tablet", strength="40 mg", description="Proton pump inhibitor used to reduce stomach acid."),
            Medicine(name="Metformin", generic_name="Metformin Hydrochloride", dosage_form="Tablet", strength="500 mg", description="First-line medication for type 2 diabetes management.")
        ]
        db.session.add_all(medicines)
        db.session.commit()

        print("[Seed] Creating Pharmacies...")
        p1 = Pharmacy(
            user_id=pharmacy_user.id,
            name="Apollo Pharmacy - T. Nagar",
            address="Usman Road, T. Nagar, Chennai - 600017",
            latitude=13.0418,
            longitude=80.2341,
            phone="+91 44 2434 5678",
            email="apollo.tnagar@meditrack.local",
            opening_hours="08:00 AM - 11:00 PM",
            license_number="DL-TN-00101",
            is_verified=True
        )
        p2 = Pharmacy(
            name="CityCare Medicals - Adyar",
            address="Lattice Bridge Road, Adyar, Chennai - 600020",
            latitude=13.0067,
            longitude=80.2570,
            phone="+91 44 2441 1234",
            email="citycare.adyar@meditrack.local",
            opening_hours="24 Hours Open",
            license_number="DL-TN-00102",
            is_verified=True
        )
        p3 = Pharmacy(
            name="HealthPlus Pharmacy - Anna Nagar",
            address="2nd Avenue, Anna Nagar, Chennai - 600040",
            latitude=13.0850,
            longitude=80.2101,
            phone="+91 44 2621 9876",
            email="healthplus.annanagar@meditrack.local",
            opening_hours="07:00 AM - 10:30 PM",
            license_number="DL-TN-00103",
            is_verified=True
        )
        db.session.add_all([p1, p2, p3])
        db.session.commit()

        print("[Seed] Creating Pharmacy Inventories...")
        inventories = [
            # Apollo Pharmacy
            PharmacyInventory(pharmacy_id=p1.id, medicine_id=medicines[0].id, medicine_name="Paracetamol", price=120.0, stock_quantity=100, availability=True),
            PharmacyInventory(pharmacy_id=p1.id, medicine_id=medicines[1].id, medicine_name="Amoxicillin", price=180.0, stock_quantity=45, availability=True),
            PharmacyInventory(pharmacy_id=p1.id, medicine_id=medicines[2].id, medicine_name="Azithromycin", price=250.0, stock_quantity=20, availability=True),
            PharmacyInventory(pharmacy_id=p1.id, medicine_id=medicines[3].id, medicine_name="Cetirizine", price=45.0, stock_quantity=60, availability=True),
            PharmacyInventory(pharmacy_id=p1.id, medicine_id=medicines[4].id, medicine_name="Ibuprofen", price=75.0, stock_quantity=80, availability=True),

            # CityCare Medicals
            PharmacyInventory(pharmacy_id=p2.id, medicine_id=medicines[0].id, medicine_name="Paracetamol", price=135.0, stock_quantity=80, availability=True),
            PharmacyInventory(pharmacy_id=p2.id, medicine_id=medicines[1].id, medicine_name="Amoxicillin", price=195.0, stock_quantity=30, availability=True),
            PharmacyInventory(pharmacy_id=p2.id, medicine_id=medicines[2].id, medicine_name="Azithromycin", price=240.0, stock_quantity=15, availability=True),
            PharmacyInventory(pharmacy_id=p2.id, medicine_id=medicines[5].id, medicine_name="Pantoprazole", price=110.0, stock_quantity=50, availability=True),

            # HealthPlus Pharmacy
            PharmacyInventory(pharmacy_id=p3.id, medicine_id=medicines[0].id, medicine_name="Paracetamol", price=100.0, stock_quantity=120, availability=True),
            PharmacyInventory(pharmacy_id=p3.id, medicine_id=medicines[1].id, medicine_name="Amoxicillin", price=160.0, stock_quantity=0, availability=False),
            PharmacyInventory(pharmacy_id=p3.id, medicine_id=medicines[3].id, medicine_name="Cetirizine", price=38.0, stock_quantity=90, availability=True),
            PharmacyInventory(pharmacy_id=p3.id, medicine_id=medicines[6].id, medicine_name="Metformin", price=90.0, stock_quantity=70, availability=True)
        ]
        db.session.add_all(inventories)
        db.session.commit()

        print("[Seed] Creating Verified Prescriptions...")
        meds_data = [
            {"medicine_name": "Amoxicillin", "strength": "500 mg", "dosage": "1 capsule", "frequency": "Twice daily", "timing": "After food", "duration": "5 days", "quantity": 10},
            {"medicine_name": "Cetirizine", "strength": "10 mg", "dosage": "1 tablet", "frequency": "Once daily", "timing": "Night", "duration": "7 days", "quantity": 7}
        ]
        rx = Prescription(
            user_id=patient.id,
            doctor_id=doctor.id,
            image_path="/api/uploads/test_prescription_A.png",
            original_extracted_text="CITY HEALTHCARE CLINIC - PRESCRIPTION\nDr. Aris Thorne, MD\nPatient: Rahul Sharma\nRx: Amoxicillin 500 mg 1 cap twice daily after food\nCetirizine 10 mg 1 tab at bedtime",
            structured_medicines=json.dumps(meds_data),
            verified_text="Confirmed Medications: Amoxicillin 500 mg (1 capsule, Twice daily); Cetirizine 10 mg (1 tablet, Once daily)",
            ocr_engine_used="EasyOCR (Confidence: 85.0%)",
            confidence=85.0,
            is_verified=True
        )
        db.session.add(rx)
        db.session.flush()

        print("[Seed] Creating Medication Schedules & Reminders...")
        # 1. Amoxicillin (Running Low alert - 4 left)
        sch1 = MedicationSchedule(
            user_id=patient.id,
            prescription_id=rx.id,
            medicine_id=medicines[1].id,
            medicine_name="Amoxicillin 500 mg",
            dosage="1 capsule",
            frequency="Twice daily",
            timing="Morning, Night",
            route="Oral",
            start_date=datetime.now().strftime("%Y-%m-%d"),
            end_date=(datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            quantity=20,
            remaining_quantity=4,
            status="ACTIVE"
        )
        # 2. Cetirizine
        sch2 = MedicationSchedule(
            user_id=patient.id,
            prescription_id=rx.id,
            medicine_id=medicines[3].id,
            medicine_name="Cetirizine 10 mg",
            dosage="1 tablet",
            frequency="Once daily",
            timing="Night",
            route="Oral",
            start_date=datetime.now().strftime("%Y-%m-%d"),
            end_date=(datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d"),
            quantity=10,
            remaining_quantity=8,
            status="ACTIVE"
        )
        db.session.add_all([sch1, sch2])
        db.session.flush()

        rem1 = MedicationReminder(schedule_id=sch1.id, reminder_time="08:00 AM", status="PENDING")
        rem2 = MedicationReminder(schedule_id=sch1.id, reminder_time="08:00 PM", status="PENDING")
        rem3 = MedicationReminder(schedule_id=sch2.id, reminder_time="09:30 PM", status="PENDING")
        db.session.add_all([rem1, rem2, rem3])

        print("[Seed] Creating Doctor Appointments...")
        app1 = Appointment(
            user_id=patient.id,
            doctor_id=doctor.id,
            doctor_name="Dr. Aris Thorne, MD",
            hospital_name="City Healthcare Clinic",
            appointment_date=(datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
            appointment_time="05:00 PM",
            notes="Follow-up consultation for respiratory symptoms and prescription review.",
            reminder_enabled=True,
            status="CONFIRMED"
        )
        db.session.add(app1)

        print("[Seed] Creating Patient Cart...")
        cart = Cart(user_id=patient.id, pharmacy_id=p1.id)
        db.session.add(cart)
        db.session.flush()

        c_item = CartItem(
            cart_id=cart.id,
            medicine_id=medicines[1].id,
            medicine_name="Amoxicillin 500 mg",
            quantity=2,
            price=180.0
        )
        db.session.add(c_item)

        print("[Seed] Creating Orders & Deliveries...")
        sample_order = Order(
            user_id=patient.id,
            pharmacy_id=p1.id,
            delivery_person_id=delivery_user.id,
            total_amount=360.0,
            delivery_address="No. 42, Mount Road, T. Nagar, Chennai, Tamil Nadu",
            latitude=13.0418,
            longitude=80.2341,
            payment_method="Cash on Delivery",
            status="OUT FOR DELIVERY"
        )
        db.session.add(sample_order)
        db.session.flush()

        order_item = OrderItem(
            order_id=sample_order.id,
            medicine_id=medicines[1].id,
            medicine_name="Amoxicillin 500 mg",
            quantity=2,
            price=180.0
        )
        db.session.add(order_item)

        delivery_rec = Delivery(
            order_id=sample_order.id,
            delivery_person_id=delivery_user.id,
            status="OUT_FOR_DELIVERY",
            pickup_time=datetime.utcnow() - timedelta(minutes=45),
            out_for_delivery_time=datetime.utcnow() - timedelta(minutes=15)
        )
        db.session.add(delivery_rec)

        print("[Seed] Logging System Initialization Audit...")
        init_audit = AuditLog(
            user_id=admin_user.id,
            action="SYSTEM_INITIALIZED",
            entity_type="system",
            entity_id=1,
            details="MediTrack AI database initialized with verified accounts for all 5 roles.",
            ip_address="127.0.0.1"
        )
        db.session.add(init_audit)

        db.session.commit()
        print("[Seed] All 5 roles and clinical ecosystem successfully seeded!")

if __name__ == '__main__':
    seed_database()
