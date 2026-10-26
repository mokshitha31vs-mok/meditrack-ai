from datetime import datetime
from app.models import MedicationSchedule, MedicationReminder, MedicationLog, db

def trigger_reminder_action(schedule_id, user_id, action, scheduled_time=None):
    """
    Handle medication reminder action: TAKEN, MISSED, or SNOOZED.
    When TAKEN: decrement remaining_quantity by 1.
    Log action in MedicationLog.
    """
    schedule = MedicationSchedule.query.filter_by(id=schedule_id, user_id=user_id).first()
    if not schedule:
        return None, "Schedule not found"

    action = action.upper()
    if action not in ['TAKEN', 'MISSED', 'SNOOZED']:
        return None, "Invalid action"

    if action == 'TAKEN' and schedule.remaining_quantity > 0:
        schedule.remaining_quantity -= 1

    # Record log
    log = MedicationLog(
        schedule_id=schedule.id,
        user_id=user_id,
        scheduled_time=scheduled_time or datetime.now().strftime("%I:%M %p"),
        action=action
    )
    db.session.add(log)
    db.session.commit()

    return schedule.to_dict(), None
