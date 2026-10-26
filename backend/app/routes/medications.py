from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import MedicationSchedule, MedicationReminder, MedicationLog
from app.services.reminder_service import trigger_reminder_action

medications_bp = Blueprint('medications', __name__, url_prefix='/api/medications')

@medications_bp.route('', methods=['POST'])
@jwt_required()
def create_medication():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    medicine_name = data.get('medicine_name', '').strip()
    if not medicine_name:
        return jsonify({'error': 'Medicine name is required'}), 400

    dosage = data.get('dosage', '1 tablet').strip()
    frequency = data.get('frequency', 'Twice daily').strip()
    timing = data.get('timing', 'Morning, Night').strip()
    quantity = int(data.get('quantity', 30))
    start_date = data.get('start_date', '')
    end_date = data.get('end_date', '')

    schedule = MedicationSchedule(
        user_id=user_id,
        medicine_name=medicine_name,
        dosage=dosage,
        frequency=frequency,
        timing=timing,
        start_date=start_date,
        end_date=end_date,
        quantity=quantity,
        remaining_quantity=quantity,
        status='ACTIVE'
    )
    db.session.add(schedule)
    db.session.flush()

    # Create reminders
    reminder_times = data.get('reminder_times', ['08:00 AM', '08:00 PM'])
    for r_time in reminder_times:
        reminder = MedicationReminder(
            schedule_id=schedule.id,
            reminder_time=r_time,
            reminder_type='IN_APP',
            status='PENDING'
        )
        db.session.add(reminder)

    db.session.commit()
    return jsonify({'message': 'Medication added successfully', 'schedule': schedule.to_dict()}), 201


@medications_bp.route('', methods=['GET'])
@jwt_required()
def get_medications():
    user_id = int(get_jwt_identity())
    schedules = MedicationSchedule.query.filter_by(user_id=user_id).all()
    return jsonify([s.to_dict() for s in schedules]), 200


@medications_bp.route('/<int:schedule_id>', methods=['PUT'])
@jwt_required()
def update_medication(schedule_id):
    user_id = int(get_jwt_identity())
    schedule = MedicationSchedule.query.filter_by(id=schedule_id, user_id=user_id).first()
    if not schedule:
        return jsonify({'error': 'Medication schedule not found'}), 404

    data = request.get_json() or {}
    if 'medicine_name' in data:
        schedule.medicine_name = data['medicine_name'].strip()
    if 'dosage' in data:
        schedule.dosage = data['dosage'].strip()
    if 'frequency' in data:
        schedule.frequency = data['frequency'].strip()
    if 'timing' in data:
        schedule.timing = data['timing'].strip()
    if 'quantity' in data:
        schedule.quantity = int(data['quantity'])
    if 'remaining_quantity' in data:
        schedule.remaining_quantity = int(data['remaining_quantity'])
    if 'status' in data:
        schedule.status = data['status']

    db.session.commit()
    return jsonify({'message': 'Medication updated successfully', 'schedule': schedule.to_dict()}), 200


@medications_bp.route('/<int:schedule_id>', methods=['DELETE'])
@jwt_required()
def delete_medication(schedule_id):
    user_id = int(get_jwt_identity())
    schedule = MedicationSchedule.query.filter_by(id=schedule_id, user_id=user_id).first()
    if not schedule:
        return jsonify({'error': 'Medication schedule not found'}), 404

    db.session.delete(schedule)
    db.session.commit()
    return jsonify({'message': 'Medication schedule deleted successfully'}), 200


@medications_bp.route('/<int:schedule_id>/taken', methods=['POST'])
@jwt_required()
def mark_taken(schedule_id):
    user_id = int(get_jwt_identity())
    result, error = trigger_reminder_action(schedule_id, user_id, 'TAKEN')
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'message': 'Medication marked as TAKEN', 'schedule': result}), 200


@medications_bp.route('/<int:schedule_id>/missed', methods=['POST'])
@jwt_required()
def mark_missed(schedule_id):
    user_id = int(get_jwt_identity())
    result, error = trigger_reminder_action(schedule_id, user_id, 'MISSED')
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'message': 'Medication marked as MISSED', 'schedule': result}), 200


@medications_bp.route('/<int:schedule_id>/snooze', methods=['POST'])
@jwt_required()
def mark_snooze(schedule_id):
    user_id = int(get_jwt_identity())
    result, error = trigger_reminder_action(schedule_id, user_id, 'SNOOZED')
    if error:
        return jsonify({'error': error}), 400
    return jsonify({'message': 'Reminder SNOOZED for 15 minutes', 'schedule': result}), 200


@medications_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_medication_logs():
    user_id = int(get_jwt_identity())
    logs = MedicationLog.query.filter_by(user_id=user_id).order_by(MedicationLog.recorded_at.desc()).all()
    return jsonify([l.to_dict() for l in logs]), 200
