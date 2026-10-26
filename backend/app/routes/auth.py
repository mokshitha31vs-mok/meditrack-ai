from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, DoctorProfile, Pharmacy, AuditLog
from app.utils.validators import validate_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

VALID_PUBLIC_ROLES = {'patient', 'doctor', 'pharmacy', 'delivery'}

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    phone = data.get('phone', '').strip()
    address = data.get('address', '').strip()
    role = data.get('role', 'patient').strip().lower()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if not validate_email(email):
        return jsonify({'error': 'Invalid email address format'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    # Administrative role cannot be self-registered publicly
    if role == 'admin':
        return jsonify({'error': 'Administrator accounts cannot be self-registered. They must be provisioned securely by system management.'}), 403

    if role not in VALID_PUBLIC_ROLES:
        return jsonify({'error': f'Invalid role: {role}. Must be one of: {", ".join(sorted(VALID_PUBLIC_ROLES))}'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'An account with this email address already exists'}), 400

    # Create base user
    user = User(
        name=name,
        email=email,
        phone=phone,
        role=role,
        status='ACTIVE',
        address=address or 'Chennai, Tamil Nadu',
        latitude=float(data.get('latitude', 13.0827)),
        longitude=float(data.get('longitude', 80.2707))
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    # Role-specific profile initialization
    if role == 'doctor':
        specialization = data.get('specialization', 'General Medicine').strip()
        qualification = data.get('qualification', 'MBBS, MD').strip()
        license_number = data.get('license_number', 'MCI-' + str(user.id).zfill(5)).strip()
        hospital_affiliation = data.get('hospital_affiliation', 'City Healthcare Clinic').strip()
        doc_profile = DoctorProfile(
            user_id=user.id,
            specialization=specialization,
            qualification=qualification,
            license_number=license_number,
            hospital_affiliation=hospital_affiliation,
            experience_years=int(data.get('experience_years', 5)),
            consultation_fee=float(data.get('consultation_fee', 500.0)),
            is_verified=True
        )
        db.session.add(doc_profile)

    elif role == 'pharmacy':
        pharmacy_name = data.get('pharmacy_name', name + ' Pharmacy').strip()
        license_number = data.get('license_number', 'DL-TN-' + str(user.id).zfill(5)).strip()
        pharmacy = Pharmacy(
            user_id=user.id,
            name=pharmacy_name,
            address=address or 'Chennai, Tamil Nadu',
            latitude=user.latitude,
            longitude=user.longitude,
            phone=phone or '+91 44 2400 0000',
            email=email,
            opening_hours=data.get('opening_hours', '8:00 AM - 10:00 PM'),
            license_number=license_number,
            is_verified=True
        )
        db.session.add(pharmacy)

    # Log security audit
    audit = AuditLog(
        user_id=user.id,
        action='ACCOUNT_REGISTERED',
        entity_type='user',
        entity_id=user.id,
        details=f"Registered account '{name}' with role '{role}'",
        ip_address=request.remote_addr
    )
    db.session.add(audit)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': f'Registration successful for role: {role}',
        'token': access_token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email address or password'}), 401

    if user.status == 'SUSPENDED':
        return jsonify({'error': 'This account has been suspended by system administration. Please contact support.'}), 403

    access_token = create_access_token(identity=str(user.id))

    # Log security audit
    audit = AuditLog(
        user_id=user.id,
        action='USER_LOGIN',
        entity_type='user',
        entity_id=user.id,
        details=f"Successful login as {user.role}",
        ip_address=request.remote_addr
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': 'Login successful',
        'token': access_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    if 'name' in data and data['name'].strip():
        user.name = data['name'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip()
    if 'address' in data:
        user.address = data['address'].strip()
    if 'latitude' in data and data['latitude'] is not None:
        user.latitude = float(data['latitude'])
    if 'longitude' in data and data['longitude'] is not None:
        user.longitude = float(data['longitude'])

    # Doctor profile updates
    if user.role == 'doctor' and user.doctor_profile:
        if 'specialization' in data:
            user.doctor_profile.specialization = data['specialization'].strip()
        if 'hospital_affiliation' in data:
            user.doctor_profile.hospital_affiliation = data['hospital_affiliation'].strip()
        if 'consultation_fee' in data:
            user.doctor_profile.consultation_fee = float(data['consultation_fee'])

    # Pharmacy profile updates
    if user.role == 'pharmacy' and user.pharmacy:
        if 'pharmacy_name' in data:
            user.pharmacy.name = data['pharmacy_name'].strip()
        if 'opening_hours' in data:
            user.pharmacy.opening_hours = data['opening_hours'].strip()

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()}), 200
