from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import MedicationReminder, MedicationSchedule

reminders_bp = Blueprint('reminders', __name__, url_prefix='/api/reminders')

@reminders_bp.route('', methods=['GET'])
@jwt_required()
def get_reminders():
    user_id = int(get_jwt_identity())
    user_schedules = MedicationSchedule.query.filter_by(user_id=user_id).all()
    schedule_ids = [s.id for s in user_schedules]

    reminders = MedicationReminder.query.filter(MedicationReminder.schedule_id.in_(schedule_ids)).all() if schedule_ids else []
    
    # Format with medication details
    result = []
    for r in reminders:
        r_dict = r.to_dict()
        schedule = MedicationSchedule.query.get(r.schedule_id)
        if schedule:
            r_dict['medicine_name'] = schedule.medicine_name
            r_dict['dosage'] = schedule.dosage
            r_dict['frequency'] = schedule.frequency
        result.append(r_dict)

    return jsonify(result), 200


@reminders_bp.route('', methods=['POST'])
@jwt_required()
def create_reminder():
    data = request.get_json() or {}
    schedule_id = data.get('schedule_id')
    reminder_time = data.get('reminder_time', '08:00 AM')

    if not schedule_id:
        return jsonify({'error': 'schedule_id is required'}), 400

    reminder = MedicationReminder(
        schedule_id=schedule_id,
        reminder_time=reminder_time,
        reminder_type=data.get('reminder_type', 'IN_APP'),
        status='PENDING'
    )
    db.session.add(reminder)
    db.session.commit()
    return jsonify(reminder.to_dict()), 201


@reminders_bp.route('/<int:reminder_id>', methods=['PUT'])
@jwt_required()
def update_reminder(reminder_id):
    reminder = MedicationReminder.query.get(reminder_id)
    if not reminder:
        return jsonify({'error': 'Reminder not found'}), 404

    data = request.get_json() or {}
    if 'reminder_time' in data:
        reminder.reminder_time = data['reminder_time']
    if 'status' in data:
        reminder.status = data['status']

    db.session.commit()
    return jsonify(reminder.to_dict()), 200
