from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Appointment

appointments_bp = Blueprint('appointments', __name__, url_prefix='/api/appointments')

@appointments_bp.route('', methods=['POST'])
@jwt_required()
def create_appointment():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    doctor_name = data.get('doctor_name', '').strip()
    hospital_name = data.get('hospital_name', '').strip()
    appointment_date = data.get('appointment_date', '').strip()
    appointment_time = data.get('appointment_time', '').strip()

    if not doctor_name or not hospital_name or not appointment_date or not appointment_time:
        return jsonify({'error': 'Doctor name, hospital name, date, and time are required'}), 400

    appointment = Appointment(
        user_id=user_id,
        doctor_name=doctor_name,
        hospital_name=hospital_name,
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        notes=data.get('notes', ''),
        reminder_enabled=data.get('reminder_enabled', True)
    )
    db.session.add(appointment)
    db.session.commit()
    return jsonify({'message': 'Appointment created successfully', 'appointment': appointment.to_dict()}), 201


@appointments_bp.route('', methods=['GET'])
@jwt_required()
def get_appointments():
    user_id = int(get_jwt_identity())
    appointments = Appointment.query.filter_by(user_id=user_id).order_by(Appointment.appointment_date.asc()).all()
    return jsonify([a.to_dict() for a in appointments]), 200


@appointments_bp.route('/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    user_id = int(get_jwt_identity())
    appointment = Appointment.query.filter_by(id=appointment_id, user_id=user_id).first()
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404

    data = request.get_json() or {}
    if 'doctor_name' in data:
        appointment.doctor_name = data['doctor_name'].strip()
    if 'hospital_name' in data:
        appointment.hospital_name = data['hospital_name'].strip()
    if 'appointment_date' in data:
        appointment.appointment_date = data['appointment_date'].strip()
    if 'appointment_time' in data:
        appointment.appointment_time = data['appointment_time'].strip()
    if 'notes' in data:
        appointment.notes = data['notes'].strip()
    if 'reminder_enabled' in data:
        appointment.reminder_enabled = bool(data['reminder_enabled'])

    db.session.commit()
    return jsonify({'message': 'Appointment updated successfully', 'appointment': appointment.to_dict()}), 200


@appointments_bp.route('/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    user_id = int(get_jwt_identity())
    appointment = Appointment.query.filter_by(id=appointment_id, user_id=user_id).first()
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404

    db.session.delete(appointment)
    db.session.commit()
    return jsonify({'message': 'Appointment deleted successfully'}), 200
