import json
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(20), nullable=False, default='patient') # patient, doctor, pharmacy, delivery, admin
    status = db.Column(db.String(20), nullable=False, default='ACTIVE') # ACTIVE, SUSPENDED, PENDING
    address = db.Column(db.String(255), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    prescriptions = db.relationship('Prescription', foreign_keys='Prescription.user_id', backref='user', lazy=True, cascade='all, delete-orphan')
    schedules = db.relationship('MedicationSchedule', backref='user', lazy=True, cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', foreign_keys='Appointment.user_id', backref='user', lazy=True, cascade='all, delete-orphan')
    pharmacy = db.relationship('Pharmacy', backref='user', uselist=False, cascade='all, delete-orphan')
    doctor_profile = db.relationship('DoctorProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    orders = db.relationship('Order', foreign_keys='Order.user_id', backref='customer', lazy=True)
    delivery_orders = db.relationship('Order', foreign_keys='Order.delivery_person_id', backref='delivery_person', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        d = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'status': self.status,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if self.role == 'doctor' and self.doctor_profile:
            d['doctor_profile'] = self.doctor_profile.to_dict()
        if self.role == 'pharmacy' and self.pharmacy:
            d['pharmacy_profile'] = self.pharmacy.to_dict()
        return d


class DoctorProfile(db.Model):
    __tablename__ = 'doctor_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    specialization = db.Column(db.String(120), default='General Medicine')
    qualification = db.Column(db.String(120), default='MBBS, MD')
    license_number = db.Column(db.String(80), nullable=True, default='MCI-48291')
    hospital_affiliation = db.Column(db.String(150), default='City Healthcare Clinic')
    experience_years = db.Column(db.Integer, default=7)
    consultation_fee = db.Column(db.Float, default=500.0)
    is_verified = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'specialization': self.specialization,
            'qualification': self.qualification,
            'license_number': self.license_number,
            'hospital_affiliation': self.hospital_affiliation,
            'experience_years': self.experience_years,
            'consultation_fee': self.consultation_fee,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class DoctorPatientAccess(db.Model):
    __tablename__ = 'doctor_patient_access'

    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='ACTIVE') # ACTIVE, PENDING, REVOKED
    access_reason = db.Column(db.String(255), default='Clinical Consultation & Prescription Review')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient_user = db.relationship('User', foreign_keys=[patient_id], backref='patient_doctor_access_records')
    doctor_user = db.relationship('User', foreign_keys=[doctor_id], backref='doctor_patient_access_records')

    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor_user.name if self.doctor_user else None,
            'patient_id': self.patient_id,
            'patient_name': self.patient_user.name if self.patient_user else None,
            'patient_email': self.patient_user.email if self.patient_user else None,
            'patient_phone': self.patient_user.phone if self.patient_user else None,
            'status': self.status,
            'access_reason': self.access_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Prescription(db.Model):
    __tablename__ = 'prescriptions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    image_path = db.Column(db.String(255), nullable=False)
    original_extracted_text = db.Column(db.Text, nullable=True)
    structured_medicines = db.Column(db.Text, nullable=True) # JSON array of extracted medicine records
    verified_text = db.Column(db.Text, nullable=True)
    ocr_engine_used = db.Column(db.String(50), default='EasyOCR')
    confidence = db.Column(db.Float, default=0.0)
    is_verified = db.Column(db.Boolean, default=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    schedules = db.relationship('MedicationSchedule', backref='prescription', lazy=True)
    reviewing_doctor = db.relationship('User', foreign_keys=[doctor_id], backref='reviewed_prescriptions')

    def to_dict(self):
        parsed_meds = []
        if self.structured_medicines:
            try:
                parsed_meds = json.loads(self.structured_medicines)
            except Exception:
                parsed_meds = []

        return {
            'id': self.id,
            'user_id': self.user_id,
            'patient_name': self.user.name if self.user else None,
            'doctor_id': self.doctor_id,
            'doctor_name': self.reviewing_doctor.name if self.reviewing_doctor else None,
            'image_path': self.image_path,
            'original_extracted_text': self.original_extracted_text,
            'structured_medicines': parsed_meds,
            'verified_text': self.verified_text,
            'ocr_engine_used': self.ocr_engine_used,
            'confidence': self.confidence,
            'is_verified': self.is_verified,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }


class Medicine(db.Model):
    __tablename__ = 'medicines'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    generic_name = db.Column(db.String(120), nullable=True)
    dosage_form = db.Column(db.String(50), nullable=True) # Tablet, Capsule, Syrup, Injection
    strength = db.Column(db.String(50), nullable=True) # 500 mg, 250 mg
    description = db.Column(db.Text, nullable=True)

    inventory_items = db.relationship('PharmacyInventory', backref='medicine', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'generic_name': self.generic_name,
            'dosage_form': self.dosage_form,
            'strength': self.strength,
            'description': self.description
        }


class MedicationSchedule(db.Model):
    __tablename__ = 'medication_schedules'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    prescription_id = db.Column(db.Integer, db.ForeignKey('prescriptions.id'), nullable=True)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicines.id'), nullable=True)
    medicine_name = db.Column(db.String(120), nullable=False)
    dosage = db.Column(db.String(50), nullable=False, default='1 tablet')
    frequency = db.Column(db.String(50), nullable=False, default='Twice daily')
    timing = db.Column(db.String(100), nullable=False, default='Morning, Night')
    route = db.Column(db.String(50), default='Oral')
    start_date = db.Column(db.String(20), nullable=True)
    end_date = db.Column(db.String(20), nullable=True)
    quantity = db.Column(db.Integer, nullable=False, default=30)
    remaining_quantity = db.Column(db.Integer, nullable=False, default=30)
    status = db.Column(db.String(20), default='ACTIVE') # ACTIVE, COMPLETED, PAUSED

    reminders = db.relationship('MedicationReminder', backref='schedule', lazy=True, cascade='all, delete-orphan')
    logs = db.relationship('MedicationLog', backref='schedule', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        doses_per_day = 1
        if 'twice' in self.frequency.lower():
            doses_per_day = 2
        elif 'thrice' in self.frequency.lower() or '3' in self.frequency:
            doses_per_day = 3
        elif 'four' in self.frequency.lower() or '4' in self.frequency:
            doses_per_day = 4

        days_remaining = max(0, round(self.remaining_quantity / max(1, doses_per_day)))
        running_low = days_remaining <= 3 or self.remaining_quantity <= 5

        return {
            'id': self.id,
            'user_id': self.user_id,
            'prescription_id': self.prescription_id,
            'medicine_id': self.medicine_id,
            'medicine_name': self.medicine_name,
            'dosage': self.dosage,
            'frequency': self.frequency,
            'timing': self.timing,
            'route': self.route,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'quantity': self.quantity,
            'remaining_quantity': self.remaining_quantity,
            'days_remaining': days_remaining,
            'running_low': running_low,
            'status': self.status,
            'reminders': [r.to_dict() for r in self.reminders] if self.reminders else []
        }


class MedicationReminder(db.Model):
    __tablename__ = 'medication_reminders'

    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('medication_schedules.id'), nullable=False)
    reminder_time = db.Column(db.String(10), nullable=False) # e.g. "08:00 AM"
    reminder_type = db.Column(db.String(20), default='IN_APP')
    status = db.Column(db.String(20), default='PENDING') # PENDING, TAKEN, MISSED, SNOOZED
    last_triggered = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'schedule_id': self.schedule_id,
            'reminder_time': self.reminder_time,
            'reminder_type': self.reminder_type,
            'status': self.status,
            'last_triggered': self.last_triggered.isoformat() if self.last_triggered else None
        }


class MedicationLog(db.Model):
    __tablename__ = 'medication_logs'

    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('medication_schedules.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    scheduled_time = db.Column(db.String(20), nullable=True)
    action = db.Column(db.String(20), nullable=False) # TAKEN, MISSED, SNOOZED
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'schedule_id': self.schedule_id,
            'user_id': self.user_id,
            'scheduled_time': self.scheduled_time,
            'action': self.action,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None
        }


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    doctor_name = db.Column(db.String(120), nullable=False)
    hospital_name = db.Column(db.String(120), nullable=False)
    appointment_date = db.Column(db.String(20), nullable=False) # YYYY-MM-DD
    appointment_time = db.Column(db.String(20), nullable=False) # HH:MM AM/PM
    notes = db.Column(db.Text, nullable=True)
    reminder_enabled = db.Column(db.Boolean, default=True)
    status = db.Column(db.String(20), default='CONFIRMED')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    assigned_doctor = db.relationship('User', foreign_keys=[doctor_id], backref='doctor_appointments')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor_name,
            'hospital_name': self.hospital_name,
            'appointment_date': self.appointment_date,
            'appointment_time': self.appointment_time,
            'notes': self.notes,
            'reminder_enabled': self.reminder_enabled,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Pharmacy(db.Model):
    __tablename__ = 'pharmacies'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    opening_hours = db.Column(db.String(100), default='8:00 AM - 10:00 PM')
    license_number = db.Column(db.String(80), default='DL-TN-10294')
    is_verified = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    inventory = db.relationship('PharmacyInventory', backref='pharmacy', lazy=True, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='pharmacy', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'phone': self.phone,
            'email': self.email,
            'opening_hours': self.opening_hours,
            'license_number': self.license_number,
            'is_verified': self.is_verified
        }


class PharmacyInventory(db.Model):
    __tablename__ = 'pharmacy_inventories'

    id = db.Column(db.Integer, primary_key=True)
    pharmacy_id = db.Column(db.Integer, db.ForeignKey('pharmacies.id'), nullable=False)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicines.id'), nullable=False)
    medicine_name = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False, default=50)
    availability = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'pharmacy_id': self.pharmacy_id,
            'medicine_id': self.medicine_id,
            'medicine_name': self.medicine_name,
            'price': self.price,
            'stock_quantity': self.stock_quantity,
            'availability': self.availability and self.stock_quantity > 0
        }


class Cart(db.Model):
    __tablename__ = 'carts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    pharmacy_id = db.Column(db.Integer, db.ForeignKey('pharmacies.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship('CartItem', backref='cart', lazy=True, cascade='all, delete-orphan')
    cart_pharmacy = db.relationship('Pharmacy', foreign_keys=[pharmacy_id])

    def to_dict(self):
        items_dict = [item.to_dict() for item in self.items]
        total_amount = sum(item['price'] * item['quantity'] for item in items_dict)
        return {
            'id': self.id,
            'user_id': self.user_id,
            'pharmacy_id': self.pharmacy_id,
            'items': items_dict,
            'total_amount': round(total_amount, 2),
            'pharmacy_name': self.cart_pharmacy.name if self.cart_pharmacy else None
        }


class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicines.id'), nullable=False)
    medicine_name = db.Column(db.String(120), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'cart_id': self.cart_id,
            'medicine_id': self.medicine_id,
            'medicine_name': self.medicine_name,
            'quantity': self.quantity,
            'price': self.price,
            'subtotal': round(self.price * self.quantity, 2)
        }


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    pharmacy_id = db.Column(db.Integer, db.ForeignKey('pharmacies.id'), nullable=False)
    delivery_person_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    total_amount = db.Column(db.Float, nullable=False)
    delivery_address = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    payment_method = db.Column(db.String(50), default='Cash on Delivery')
    status = db.Column(db.String(40), default='PLACED')
    # PLACED -> ACCEPTED -> PREPARING -> READY FOR PICKUP -> ASSIGNED TO DELIVERY -> OUT FOR DELIVERY -> DELIVERED / REJECTED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    delivery_record = db.relationship('Delivery', backref='order', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'customer_name': self.customer.name if self.customer else 'Patient',
            'customer_phone': self.customer.phone if self.customer else '',
            'pharmacy_id': self.pharmacy_id,
            'pharmacy_name': self.pharmacy.name if self.pharmacy else 'Pharmacy',
            'pharmacy_address': self.pharmacy.address if self.pharmacy else '',
            'delivery_person_id': self.delivery_person_id,
            'delivery_person_name': self.delivery_person.name if self.delivery_person else 'Unassigned',
            'total_amount': self.total_amount,
            'delivery_address': self.delivery_address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'payment_method': self.payment_method,
            'status': self.status,
            'items': [item.to_dict() for item in self.items],
            'delivery': self.delivery_record.to_dict() if self.delivery_record else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicines.id'), nullable=False)
    medicine_name = db.Column(db.String(120), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'medicine_id': self.medicine_id,
            'medicine_name': self.medicine_name,
            'quantity': self.quantity,
            'price': self.price,
            'subtotal': round(self.price * self.quantity, 2)
        }


class Delivery(db.Model):
    __tablename__ = 'deliveries'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    delivery_person_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    status = db.Column(db.String(40), default='PENDING') # PENDING, ASSIGNED, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED
    pickup_time = db.Column(db.DateTime, nullable=True)
    out_for_delivery_time = db.Column(db.DateTime, nullable=True)
    delivered_time = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'delivery_person_id': self.delivery_person_id,
            'status': self.status,
            'pickup_time': self.pickup_time.isoformat() if self.pickup_time else None,
            'out_for_delivery_time': self.out_for_delivery_time.isoformat() if self.out_for_delivery_time else None,
            'delivered_time': self.delivered_time.isoformat() if self.delivered_time else None
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    entity_type = db.Column(db.String(50), nullable=True)
    entity_id = db.Column(db.Integer, nullable=True)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else 'System',
            'user_role': self.user.role if self.user else 'System',
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'details': self.details,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
