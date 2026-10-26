from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Pharmacy, Medicine, PharmacyInventory, Order, Delivery, Prescription, AuditLog, DoctorProfile
from app.utils.auth import role_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_user_role(user_id):
    current_admin_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    role = data.get('role', '').strip().lower()
    if role not in ['patient', 'doctor', 'pharmacy', 'delivery', 'admin']:
        return jsonify({'error': 'Invalid role'}), 400

    old_role = user.role
    user.role = role

    # If transitioning to doctor and lacks profile, create default
    if role == 'doctor' and not user.doctor_profile:
        doc_prof = DoctorProfile(user_id=user.id, specialization='General Physician', is_verified=True)
        db.session.add(doc_prof)

    audit = AuditLog(
        user_id=current_admin_id,
        action='USER_ROLE_UPDATED',
        entity_type='user',
        entity_id=user.id,
        details=f"Admin changed role of user #{user.id} ({user.name}) from '{old_role}' to '{role}'",
        ip_address=request.remote_addr
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify(user.to_dict()), 200


@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_user_status(user_id):
    current_admin_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    status = data.get('status', '').upper().strip()
    if status not in ['ACTIVE', 'SUSPENDED', 'PENDING']:
        return jsonify({'error': 'Invalid status'}), 400

    old_status = user.status
    user.status = status

    audit = AuditLog(
        user_id=current_admin_id,
        action='USER_STATUS_UPDATED',
        entity_type='user',
        entity_id=user.id,
        details=f"Admin changed status of user #{user.id} ({user.name}) from '{old_status}' to '{status}'",
        ip_address=request.remote_addr
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify(user.to_dict()), 200


@admin_bp.route('/pharmacies', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_admin_pharmacies():
    pharmacies = Pharmacy.query.all()
    return jsonify([p.to_dict() for p in pharmacies]), 200


@admin_bp.route('/pharmacies', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_pharmacy():
    data = request.get_json() or {}
    pharmacy = Pharmacy(
        name=data.get('name'),
        address=data.get('address'),
        latitude=float(data.get('latitude', 13.0827)),
        longitude=float(data.get('longitude', 80.2707)),
        phone=data.get('phone'),
        email=data.get('email'),
        opening_hours=data.get('opening_hours', '8:00 AM - 10:00 PM'),
        license_number=data.get('license_number', 'DL-TN-' + str(Pharmacy.query.count() + 1).zfill(5)),
        is_verified=True
    )
    db.session.add(pharmacy)
    db.session.commit()
    return jsonify(pharmacy.to_dict()), 201


@admin_bp.route('/pharmacies/<int:pharmacy_id>/verify', methods=['PUT'])
@jwt_required()
@role_required('admin')
def toggle_pharmacy_verification(pharmacy_id):
    current_admin_id = int(get_jwt_identity())
    pharmacy = Pharmacy.query.get(pharmacy_id)
    if not pharmacy:
        return jsonify({'error': 'Pharmacy not found'}), 404

    data = request.get_json() or {}
    pharmacy.is_verified = bool(data.get('is_verified', True))

    audit = AuditLog(
        user_id=current_admin_id,
        action='PHARMACY_VERIFICATION_UPDATED',
        entity_type='pharmacy',
        entity_id=pharmacy.id,
        details=f"Admin updated verification for '{pharmacy.name}' to {pharmacy.is_verified}",
        ip_address=request.remote_addr
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify(pharmacy.to_dict()), 200


@admin_bp.route('/doctors/<int:doctor_id>/verify', methods=['PUT'])
@jwt_required()
@role_required('admin')
def toggle_doctor_verification(doctor_id):
    current_admin_id = int(get_jwt_identity())
    doctor = User.query.filter_by(id=doctor_id, role='doctor').first()
    if not doctor or not doctor.doctor_profile:
        return jsonify({'error': 'Doctor profile not found'}), 404

    data = request.get_json() or {}
    doctor.doctor_profile.is_verified = bool(data.get('is_verified', True))

    audit = AuditLog(
        user_id=current_admin_id,
        action='DOCTOR_VERIFICATION_UPDATED',
        entity_type='doctor',
        entity_id=doctor.id,
        details=f"Admin updated verification for Dr. {doctor.name} to {doctor.doctor_profile.is_verified}",
        ip_address=request.remote_addr
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify(doctor.to_dict()), 200


@admin_bp.route('/medicines', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_admin_medicines():
    medicines = Medicine.query.all()
    return jsonify([m.to_dict() for m in medicines]), 200


@admin_bp.route('/medicines', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_medicine():
    data = request.get_json() or {}
    medicine = Medicine(
        name=data.get('name'),
        generic_name=data.get('generic_name'),
        dosage_form=data.get('dosage_form'),
        strength=data.get('strength'),
        description=data.get('description')
    )
    db.session.add(medicine)
    db.session.commit()
    return jsonify(medicine.to_dict()), 201


@admin_bp.route('/inventory', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_admin_inventory():
    inventories = PharmacyInventory.query.all()
    res = []
    for inv in inventories:
        d = inv.to_dict()
        pharmacy = Pharmacy.query.get(inv.pharmacy_id)
        d['pharmacy_name'] = pharmacy.name if pharmacy else ''
        res.append(d)
    return jsonify(res), 200


@admin_bp.route('/orders', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_admin_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200


@admin_bp.route('/delivery-personnel', methods=['GET'])
@jwt_required()
@role_required(['admin', 'pharmacy'])
def get_delivery_personnel():
    personnel = User.query.filter_by(role='delivery').all()
    return jsonify([p.to_dict() for p in personnel]), 200


@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return jsonify([l.to_dict() for l in logs]), 200


@admin_bp.route('/ocr-health', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_ocr_health():
    total_scanned = Prescription.query.count()
    verified_count = Prescription.query.filter_by(is_verified=True).count()
    pending_count = Prescription.query.filter_by(is_verified=False).count()

    avg_conf = db.session.query(db.func.avg(Prescription.confidence)).scalar() or 0.0

    engines_data = db.session.query(
        Prescription.ocr_engine_used, db.func.count(Prescription.id)
    ).group_by(Prescription.ocr_engine_used).all()

    breakdown = [{'engine': e[0] or 'EasyOCR', 'count': e[1]} for e in engines_data]

    return jsonify({
        'total_scanned_prescriptions': total_scanned,
        'verified_prescriptions': verified_count,
        'pending_verification': pending_count,
        'verification_rate_percent': round((verified_count / max(1, total_scanned)) * 100, 1),
        'average_confidence_percent': round(avg_conf, 1),
        'engine_distribution': breakdown,
        'status': 'OPERATIONAL'
    }), 200


@admin_bp.route('/reports', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_admin_reports():
    total_users = User.query.count()
    total_patients = User.query.filter_by(role='patient').count()
    total_doctors = User.query.filter_by(role='doctor').count()
    total_pharmacies = Pharmacy.query.count()
    total_deliveries = User.query.filter_by(role='delivery').count()
    total_medicines = Medicine.query.count()
    total_orders = Order.query.count()
    pending_orders = Order.query.filter(Order.status.in_(['PLACED', 'ACCEPTED', 'PREPARING'])).count()
    active_deliveries = Order.query.filter(Order.status.in_(['READY FOR PICKUP', 'ASSIGNED TO DELIVERY', 'OUT FOR DELIVERY'])).count()
    completed_orders = Order.query.filter_by(status='DELIVERED').count()
    total_prescriptions = Prescription.query.count()

    total_revenue = db.session.query(db.func.sum(Order.total_amount)).filter_by(status='DELIVERED').scalar() or 0.0

    return jsonify({
        'total_users': total_users,
        'total_patients': total_patients,
        'total_doctors': total_doctors,
        'total_pharmacies': total_pharmacies,
        'total_delivery_agents': total_deliveries,
        'total_medicines': total_medicines,
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'active_deliveries': active_deliveries,
        'completed_orders': completed_orders,
        'total_prescriptions': total_prescriptions,
        'total_revenue': round(total_revenue, 2)
    }), 200
