import os
import json
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Prescription, MedicationSchedule, MedicationReminder, User, AuditLog, DoctorPatientAccess
from app.utils.validators import allowed_file, generate_safe_filename
from app.services.ocr_service import perform_ocr
from app.services.medicine_parser import parse_prescription_text

prescriptions_bp = Blueprint('prescriptions', __name__, url_prefix='/api/prescriptions')

@prescriptions_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_prescription():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User account not found.'}), 404

    file = request.files.get('file') or request.files.get('image')
    if not file or file.filename == '':
        return jsonify({'error': 'No prescription image file uploaded. Please select an image.'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Supported formats are PNG, JPG, JPEG, and WebP.'}), 400

    filename = generate_safe_filename(file.filename, user_id=user_id)
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    relative_image_path = f"/api/uploads/{filename}"

    try:
        # Perform REAL Image-Dependent OCR
        extracted_text, ocr_engine, confidence, line_items = perform_ocr(file_path)

        # Parse extracted text with layout reconstruction & multi-medicine detection
        parsed_fields = parse_prescription_text(extracted_text)

        # Save prescription record with structured candidates
        prescription = Prescription(
            user_id=user_id,
            image_path=relative_image_path,
            original_extracted_text=extracted_text,
            structured_medicines=json.dumps(parsed_fields.get('medicines', [])),
            confidence=confidence,
            verified_text=None,
            ocr_engine_used=ocr_engine,
            is_verified=False
        )
        db.session.add(prescription)
        db.session.flush()

        # Record Audit Log
        audit = AuditLog(
            user_id=user_id,
            action='PRESCRIPTION_UPLOADED',
            entity_type='prescription',
            entity_id=prescription.id,
            details=f"Uploaded image '{filename}'. OCR Engine: {ocr_engine}, Confidence: {confidence}%, Medicines Detected: {parsed_fields.get('total_medicines_detected', 0)}",
            ip_address=request.remote_addr
        )
        db.session.add(audit)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Prescription OCR processing error: {str(e)}", exc_info=True)
        return jsonify({'error': f'Prescription OCR processing error: {str(e)}'}), 500

    return jsonify({
        'message': 'Prescription image uploaded and scanned successfully.',
        'prescription': prescription.to_dict(),
        'extracted_text': extracted_text,
        'parsed_fields': parsed_fields,
        'ocr_engine_used': ocr_engine,
        'confidence': confidence,
        'line_items': line_items
    }), 201


@prescriptions_bp.route('', methods=['GET'])
@jwt_required()
def get_prescriptions():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    patient_id_param = request.args.get('patient_id')

    if user.role == 'admin':
        if patient_id_param:
            prescriptions = Prescription.query.filter_by(user_id=int(patient_id_param)).order_by(Prescription.uploaded_at.desc()).all()
        else:
            prescriptions = Prescription.query.order_by(Prescription.uploaded_at.desc()).all()
    elif user.role == 'doctor':
        if patient_id_param:
            # Verify doctor has access grant for this patient
            access = DoctorPatientAccess.query.filter_by(doctor_id=user_id, patient_id=int(patient_id_param), status='ACTIVE').first()
            if not access:
                return jsonify({'error': 'You do not have authorized clinical access to this patient\'s records.'}), 403
            prescriptions = Prescription.query.filter_by(user_id=int(patient_id_param)).order_by(Prescription.uploaded_at.desc()).all()
        else:
            # Prescriptions from all authorized patients
            granted = DoctorPatientAccess.query.filter_by(doctor_id=user_id, status='ACTIVE').all()
            pt_ids = [g.patient_id for g in granted]
            prescriptions = Prescription.query.filter(Prescription.user_id.in_(pt_ids)).order_by(Prescription.uploaded_at.desc()).all() if pt_ids else []
    else:
        # Patient sees ONLY their own records
        prescriptions = Prescription.query.filter_by(user_id=user_id).order_by(Prescription.uploaded_at.desc()).all()

    return jsonify([p.to_dict() for p in prescriptions]), 200


@prescriptions_bp.route('/<int:prescription_id>', methods=['GET'])
@jwt_required()
def get_prescription(prescription_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    prescription = Prescription.query.get(prescription_id)
    if not prescription:
        return jsonify({'error': 'Prescription not found'}), 404

    # Access control check
    if user.role == 'patient' and prescription.user_id != user_id:
        return jsonify({'error': 'Unauthorized: You do not own this prescription.'}), 403
    elif user.role == 'doctor' and prescription.user_id != user_id:
        access = DoctorPatientAccess.query.filter_by(doctor_id=user_id, patient_id=prescription.user_id, status='ACTIVE').first()
        if not access:
            return jsonify({'error': 'Unauthorized: No active clinical access grant for this patient.'}), 403

    return jsonify(prescription.to_dict()), 200


@prescriptions_bp.route('/<int:prescription_id>/retry', methods=['POST'])
@jwt_required()
def retry_ocr(prescription_id):
    user_id = int(get_jwt_identity())
    prescription = Prescription.query.filter_by(id=prescription_id, user_id=user_id).first()
    if not prescription:
        return jsonify({'error': 'Prescription not found'}), 404

    upload_folder = current_app.config['UPLOAD_FOLDER']
    filename = os.path.basename(prescription.image_path)
    file_path = os.path.join(upload_folder, filename)

    if not os.path.exists(file_path):
        return jsonify({'error': 'Original image file no longer found on server.'}), 404

    extracted_text, ocr_engine, confidence, line_items = perform_ocr(file_path)
    parsed_fields = parse_prescription_text(extracted_text)

    prescription.original_extracted_text = extracted_text
    prescription.structured_medicines = json.dumps(parsed_fields.get('medicines', []))
    prescription.confidence = confidence
    prescription.ocr_engine_used = ocr_engine
    db.session.commit()

    return jsonify({
        'message': 'OCR scan re-executed successfully.',
        'prescription': prescription.to_dict(),
        'extracted_text': extracted_text,
        'parsed_fields': parsed_fields,
        'confidence': confidence
    }), 200


@prescriptions_bp.route('/<int:prescription_id>/verify', methods=['PUT'])
@jwt_required()
def verify_prescription(prescription_id):
    """
    Verify prescription and create independent medication schedules for EACH confirmed medicine.
    NEVER overwrites with sample medicines or copies details between medicines.
    """
    user_id = int(get_jwt_identity())
    prescription = Prescription.query.filter_by(id=prescription_id, user_id=user_id).first()
    if not prescription:
        return jsonify({'error': 'Prescription not found'}), 404

    data = request.get_json() or {}

    # Support either list of medicines in 'verified_medicines' or single dict in 'verified_fields'
    verified_medicines = data.get('verified_medicines')
    if not verified_medicines:
        single = data.get('verified_fields', {})
        if single and single.get('medicine_name'):
            verified_medicines = [single]
        else:
            return jsonify({'error': 'At least one verified medicine entry is required.'}), 400

    created_schedules = []
    verification_summaries = []

    for item in verified_medicines:
        name = str(item.get('medicine_name', '')).strip()
        if not name or name.lower() in ['not detected', 'unclear in prescription', 'needs verification']:
            continue

        units = item.get('units_per_dose')
        units_str = f"{units} unit(s)/dose" if units is not None else "1 unit/dose"

        admin_times = item.get('administration_times') or []
        if isinstance(admin_times, str):
            admin_times = [t.strip().lower() for t in admin_times.split(',') if t.strip()]

        timing_str = ", ".join(t.capitalize() for t in admin_times) if admin_times else "As directed"
        freq_str = f"{len(admin_times)} time(s) daily" if admin_times else "As prescribed"

        duration = item.get('duration_days')
        duration_str = f"{duration} days" if duration is not None else "As prescribed"

        qty_calc = max(len(admin_times), 1) * (int(units) if units else 1) * (int(duration) if duration else 5)

        schedule = MedicationSchedule(
            user_id=user_id,
            prescription_id=prescription.id,
            medicine_name=name,
            dosage=units_str,
            frequency=freq_str,
            timing=timing_str,
            route="Oral",
            quantity=qty_calc,
            remaining_quantity=qty_calc,
            status='ACTIVE'
        )
        db.session.add(schedule)
        db.session.flush()

        # Generate intelligent reminders for each specified time of day
        time_slot_map = {
            'morning': '08:00 AM',
            'afternoon': '02:00 PM',
            'evening': '06:00 PM',
            'night': '08:00 PM'
        }
        for t_slot in admin_times:
            slot_clean = t_slot.lower().strip()
            rem_time = time_slot_map.get(slot_clean, '08:00 AM')
            reminder = MedicationReminder(
                schedule_id=schedule.id,
                reminder_time=rem_time,
                reminder_type='IN_APP',
                status='PENDING'
            )
            db.session.add(reminder)

        created_schedules.append(schedule)
        verification_summaries.append(f"{name} ({units_str}, {timing_str}, {duration_str})")

    if not created_schedules:
        return jsonify({'error': 'No valid medicines were confirmed.'}), 400

    prescription.structured_medicines = json.dumps(verified_medicines)
    prescription.verified_text = "Confirmed Medications: " + "; ".join(verification_summaries)
    prescription.is_verified = True

    # Audit log
    audit = AuditLog(
        user_id=user_id,
        action='PRESCRIPTION_VERIFIED',
        entity_type='prescription',
        entity_id=prescription.id,
        details=f"User verified {len(created_schedules)} medications: {', '.join(verification_summaries)}",
        ip_address=request.remote_addr
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': f'Prescription verified successfully. {len(created_schedules)} active medication schedule(s) created.',
        'prescription': prescription.to_dict(),
        'schedules': [s.to_dict() for s in created_schedules]
    }), 200
