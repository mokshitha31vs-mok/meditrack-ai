import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, DoctorProfile, DoctorPatientAccess, Prescription, MedicationSchedule, MedicationReminder, Appointment, AuditLog
from app.utils.auth import role_required

doctor_bp = Blueprint('doctor', __name__, url_prefix='/api/doctor')

@doctor_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('doctor')
def get_doctor_dashboard():
    doctor_id = int(get_jwt_identity())
    doctor_user = User.query.get(doctor_id)
    if not doctor_user:
        return jsonify({'error': 'Doctor account not found'}), 404

    # Authorized patients
    access_grants = DoctorPatientAccess.query.filter_by(doctor_id=doctor_id, status='ACTIVE').all()
    patient_ids = [g.patient_id for g in access_grants]

    total_patients = len(patient_ids)

    # Reviewed / accessible prescriptions
    total_prescriptions = Prescription.query.filter(Prescription.user_id.in_(patient_ids)).count() if patient_ids else 0

    # Upcoming appointments for this doctor
    appointments = Appointment.query.filter(
        (Appointment.doctor_id == doctor_id) | (Appointment.doctor_name.ilike(f"%{doctor_user.name}%"))
    ).order_by(Appointment.appointment_date.asc()).all()

    # Patients list with summary
    patients_data = []
    for g in access_grants:
        p_user = User.query.get(g.patient_id)
        if p_user:
            med_count = MedicationSchedule.query.filter_by(user_id=p_user.id, status='ACTIVE').count()
            rx_count = Prescription.query.filter_by(user_id=p_user.id).count()
            patients_data.append({
                'id': p_user.id,
                'name': p_user.name,
                'email': p_user.email,
                'phone': p_user.phone,
                'active_medications': med_count,
                'prescriptions_count': rx_count,
                'access_granted_at': g.created_at.isoformat() if g.created_at else None
            })

    return jsonify({
        'doctor': doctor_user.to_dict(),
        'total_authorized_patients': total_patients,
        'total_prescriptions': total_prescriptions,
        'upcoming_appointments_count': len(appointments),
        'patients': patients_data,
        'appointments': [a.to_dict() for a in appointments[:5]]
    }), 200


@doctor_bp.route('/patients', methods=['GET'])
@jwt_required()
@role_required('doctor')
def get_authorized_patients():
    doctor_id = int(get_jwt_identity())
    access_grants = DoctorPatientAccess.query.filter_by(doctor_id=doctor_id, status='ACTIVE').all()
    patients = []
    for g in access_grants:
        p_user = User.query.get(g.patient_id)
        if p_user:
            p_dict = p_user.to_dict()
            p_dict['access_status'] = g.status
            p_dict['access_granted_at'] = g.created_at.isoformat() if g.created_at else None
            patients.append(p_dict)
    return jsonify(patients), 200


@doctor_bp.route('/patients/<int:patient_id>', methods=['GET'])
@jwt_required()
@role_required('doctor')
def get_patient_clinical_record(patient_id):
    doctor_id = int(get_jwt_identity())

    # Server-side clinical authorization check
    access = DoctorPatientAccess.query.filter_by(doctor_id=doctor_id, patient_id=patient_id, status='ACTIVE').first()
    if not access:
        return jsonify({'error': 'Unauthorized: Patient has not granted clinical record access to this doctor.'}), 403

    patient = User.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient record not found'}), 404

    prescriptions = Prescription.query.filter_by(user_id=patient_id).order_by(Prescription.uploaded_at.desc()).all()
    schedules = MedicationSchedule.query.filter_by(user_id=patient_id).order_by(MedicationSchedule.id.desc()).all()

    return jsonify({
        'patient': patient.to_dict(),
        'prescriptions': [p.to_dict() for p in prescriptions],
        'medication_schedules': [s.to_dict() for s in schedules]
    }), 200


@doctor_bp.route('/prescriptions', methods=['POST'])
@jwt_required()
@role_required('doctor')
def doctor_issue_prescription():
    """
    Authorized workflow: Doctor issues or creates a verified prescription for an authorized patient.
    """
    doctor_id = int(get_jwt_identity())
    doctor = User.query.get(doctor_id)
    data = request.get_json() or {}

    patient_id = data.get('patient_id')
    if not patient_id:
        return jsonify({'error': 'patient_id is required'}), 400

    access = DoctorPatientAccess.query.filter_by(doctor_id=doctor_id, patient_id=patient_id, status='ACTIVE').first()
    if not access:
        return jsonify({'error': 'Unauthorized: Patient has not granted clinical record access.'}), 403

    medicines = data.get('medicines', [])
    if not medicines:
        return jsonify({'error': 'At least one medicine is required'}), 400

    clinical_notes = data.get('notes', 'Prescribed by attending physician.')

    # Create prescription record
    summary_parts = []
    for m in medicines:
        m_name = m.get('medicine_name', '').strip()
        m_str = m.get('strength', '').strip()
        m_freq = m.get('frequency', 'Twice daily').strip()
        summary_parts.append(f"{m_name} {m_str} ({m_freq})")

    rx = Prescription(
        user_id=patient_id,
        doctor_id=doctor_id,
        image_path='/api/uploads/digital_rx.png',
        original_extracted_text=f"Digital Clinical Prescription by Dr. {doctor.name}\nNotes: {clinical_notes}",
        structured_medicines=json.dumps(medicines),
        verified_text=f"Doctor Verified: {'; '.join(summary_parts)}",
        ocr_engine_used="Doctor Clinical Entry",
        confidence=100.0,
        is_verified=True
    )
    db.session.add(rx)
    db.session.flush()

    # Create medication schedules for patient
    created_schedules = []
    for m in medicines:
        name = m.get('medicine_name', '').strip()
        if not name:
            continue
        sch = MedicationSchedule(
            user_id=patient_id,
            prescription_id=rx.id,
            medicine_name=name,
            dosage=m.get('dosage', '1 tablet'),
            frequency=m.get('frequency', 'Twice daily'),
            timing=m.get('timing', 'Morning, Night'),
            route=m.get('route', 'Oral'),
            quantity=int(m.get('quantity', 30)),
            remaining_quantity=int(m.get('quantity', 30)),
            status='ACTIVE'
        )
        db.session.add(sch)
        db.session.flush()

        # Add reminders
        if 'sos' not in sch.frequency.lower():
            for t_item in [t.strip() for t in sch.timing.split(',') if t.strip()]:
                rem_time = "08:00 AM" if "morning" in t_item.lower() else ("02:00 PM" if "afternoon" in t_item.lower() else "08:00 PM")
                r = MedicationReminder(schedule_id=sch.id, reminder_time=rem_time, status='PENDING')
                db.session.add(r)

        created_schedules.append(sch)

    # Audit log
    audit = AuditLog(
        user_id=doctor_id,
        action='DOCTOR_ISSUED_PRESCRIPTION',
        entity_type='prescription',
        entity_id=rx.id,
        details=f"Dr. {doctor.name} issued prescription with {len(created_schedules)} medications to patient #{patient_id}",
        ip_address=request.remote_addr
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': 'Prescription issued successfully.',
        'prescription': rx.to_dict(),
        'schedules': [s.to_dict() for s in created_schedules]
    }), 201


@doctor_bp.route('/access/grant', methods=['POST'])
@jwt_required()
def grant_doctor_access():
    """
    Patient grants access to doctor or administrator connects doctor-patient.
    """
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    data = request.get_json() or {}

    doctor_id = data.get('doctor_id')
    patient_id = data.get('patient_id') or (current_user_id if current_user.role == 'patient' else None)

    if not doctor_id or not patient_id:
        return jsonify({'error': 'doctor_id and patient_id are required'}), 400

    doctor = User.query.filter_by(id=doctor_id, role='doctor').first()
    if not doctor:
        return jsonify({'error': 'Invalid doctor ID'}), 404

    patient = User.query.filter_by(id=patient_id, role='patient').first()
    if not patient:
        return jsonify({'error': 'Invalid patient ID'}), 404

    existing = DoctorPatientAccess.query.filter_by(doctor_id=doctor_id, patient_id=patient_id).first()
    if existing:
        existing.status = 'ACTIVE'
    else:
        existing = DoctorPatientAccess(
            doctor_id=doctor_id,
            patient_id=patient_id,
            status='ACTIVE',
            access_reason=data.get('access_reason', 'Patient clinical consent')
        )
        db.session.add(existing)

    audit = AuditLog(
        user_id=current_user_id,
        action='DOCTOR_ACCESS_GRANTED',
        entity_type='doctor_patient_access',
        entity_id=doctor_id,
        details=f"Access granted between Doctor #{doctor_id} and Patient #{patient_id}",
        ip_address=request.remote_addr
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({'message': f'Access successfully granted to Dr. {doctor.name}', 'access': existing.to_dict()}), 200


@doctor_bp.route('/profile', methods=['GET'])
@jwt_required()
@role_required('doctor')
def get_doctor_profile():
    doctor_id = int(get_jwt_identity())
    user = User.query.get(doctor_id)
    if not user:
        return jsonify({'error': 'Doctor account not found'}), 404

    profile = DoctorProfile.query.filter_by(user_id=doctor_id).first()
    if not profile:
        profile = DoctorProfile(user_id=doctor_id)
        db.session.add(profile)
        db.session.commit()

    return jsonify({
        'user': user.to_dict(),
        'doctor_profile': profile.to_dict()
    }), 200


@doctor_bp.route('/profile', methods=['PUT'])
@jwt_required()
@role_required('doctor')
def update_doctor_profile():
    doctor_id = int(get_jwt_identity())
    user = User.query.get(doctor_id)
    if not user:
        return jsonify({'error': 'Doctor account not found'}), 404

    data = request.get_json() or {}

    # Update User basic fields
    if 'name' in data and data['name'].strip():
        user.name = data['name'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip()
    if 'address' in data:
        user.address = data['address'].strip()

    profile = DoctorProfile.query.filter_by(user_id=doctor_id).first()
    if not profile:
        profile = DoctorProfile(user_id=doctor_id)
        db.session.add(profile)

    if 'specialization' in data:
        profile.specialization = data['specialization'].strip()
    if 'qualification' in data:
        profile.qualification = data['qualification'].strip()
    if 'license_number' in data:
        profile.license_number = data['license_number'].strip()
    if 'hospital_affiliation' in data:
        profile.hospital_affiliation = data['hospital_affiliation'].strip()
    if 'experience_years' in data:
        try:
            profile.experience_years = int(data['experience_years'])
        except (ValueError, TypeError):
            pass
    if 'consultation_fee' in data:
        try:
            profile.consultation_fee = float(data['consultation_fee'])
        except (ValueError, TypeError):
            pass

    audit = AuditLog(
        user_id=doctor_id,
        action='DOCTOR_PROFILE_UPDATED',
        entity_type='doctor_profile',
        entity_id=profile.id,
        details=f"Dr. {user.name} updated credentials and profile details",
        ip_address=request.remote_addr
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully.',
        'user': user.to_dict(),
        'doctor_profile': profile.to_dict()
    }), 200
