from datetime import datetime
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, MedicationSchedule, MedicationReminder, Appointment, Pharmacy, PharmacyInventory, Order, Delivery

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_dashboard():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    schedules = MedicationSchedule.query.filter_by(user_id=user_id, status='ACTIVE').all()
    schedules_data = [s.to_dict() for s in schedules]
    running_low_list = [s for s in schedules_data if s['running_low']]

    # Reminders
    schedule_ids = [s.id for s in schedules]
    reminders = MedicationReminder.query.filter(MedicationReminder.schedule_id.in_(schedule_ids)).all() if schedule_ids else []
    reminders_data = []
    for r in reminders:
        rd = r.to_dict()
        sch = next((s for s in schedules if s.id == r.schedule_id), None)
        if sch:
            rd['medicine_name'] = sch.medicine_name
            rd['dosage'] = sch.dosage
        reminders_data.append(rd)

    # Next upcoming appointment
    appointment = Appointment.query.filter_by(user_id=user_id).order_by(Appointment.appointment_date.asc()).first()

    # Active order
    active_order = Order.query.filter(
        Order.user_id == user_id,
        Order.status != 'DELIVERED',
        Order.status != 'REJECTED'
    ).order_by(Order.created_at.desc()).first()

    nearby_pharmacies_count = Pharmacy.query.count()

    return jsonify({
        'user': user.to_dict() if user else None,
        'todays_medications': schedules_data,
        'reminders': reminders_data,
        'next_reminder': reminders_data[0] if reminders_data else None,
        'running_low_medications': running_low_list,
        'upcoming_appointment': appointment.to_dict() if appointment else None,
        'active_order': active_order.to_dict() if active_order else None,
        'nearby_pharmacies_count': nearby_pharmacies_count
    }), 200


@dashboard_bp.route('/pharmacy', methods=['GET'])
@jwt_required()
def get_pharmacy_dashboard():
    user_id = int(get_jwt_identity())
    pharmacy = Pharmacy.query.filter_by(user_id=user_id).first()
    if not pharmacy:
        # Fallback to first pharmacy
        pharmacy = Pharmacy.query.first()

    pharmacy_id = pharmacy.id if pharmacy else None
    
    total_medicines = PharmacyInventory.query.filter_by(pharmacy_id=pharmacy_id).count() if pharmacy_id else 0
    low_stock_medicines = PharmacyInventory.query.filter(
        PharmacyInventory.pharmacy_id == pharmacy_id,
        PharmacyInventory.stock_quantity <= 10
    ).count() if pharmacy_id else 0

    incoming_orders = Order.query.filter_by(pharmacy_id=pharmacy_id, status='PLACED').count() if pharmacy_id else 0
    preparing_orders = Order.query.filter_by(pharmacy_id=pharmacy_id, status='PREPARING').count() if pharmacy_id else 0
    ready_orders = Order.query.filter_by(pharmacy_id=pharmacy_id, status='READY FOR PICKUP').count() if pharmacy_id else 0
    completed_orders = Order.query.filter_by(pharmacy_id=pharmacy_id, status='DELIVERED').count() if pharmacy_id else 0

    recent_orders = Order.query.filter_by(pharmacy_id=pharmacy_id).order_by(Order.created_at.desc()).limit(5).all() if pharmacy_id else []

    return jsonify({
        'pharmacy': pharmacy.to_dict() if pharmacy else None,
        'total_medicines': total_medicines,
        'low_stock_medicines': low_stock_medicines,
        'incoming_orders': incoming_orders,
        'preparing_orders': preparing_orders,
        'ready_orders': ready_orders,
        'completed_orders': completed_orders,
        'recent_orders': [o.to_dict() for o in recent_orders]
    }), 200


@dashboard_bp.route('/delivery', methods=['GET'])
@jwt_required()
def get_delivery_dashboard():
    user_id = int(get_jwt_identity())
    
    assigned_deliveries = Delivery.query.filter_by(delivery_person_id=user_id).count()
    pending_deliveries = Delivery.query.filter_by(delivery_person_id=user_id, status='ASSIGNED').count()
    active_deliveries = Delivery.query.filter(
        Delivery.delivery_person_id == user_id,
        Delivery.status.in_(['PICKED_UP', 'OUT_FOR_DELIVERY'])
    ).count()
    completed_deliveries = Delivery.query.filter_by(delivery_person_id=user_id, status='DELIVERED').count()

    recent_deliveries = Delivery.query.filter_by(delivery_person_id=user_id).order_by(Delivery.id.desc()).limit(5).all()
    recent_list = []
    for d in recent_deliveries:
        dd = d.to_dict()
        order = Order.query.get(d.order_id)
        if order:
            dd['order'] = order.to_dict()
        recent_list.append(dd)

    return jsonify({
        'assigned_deliveries': assigned_deliveries,
        'pending_deliveries': pending_deliveries,
        'active_deliveries': active_deliveries,
        'completed_deliveries': completed_deliveries,
        'recent_deliveries': recent_list
    }), 200


@dashboard_bp.route('/admin', methods=['GET'])
@jwt_required()
def get_admin_dashboard():
    from app.routes.admin import get_admin_reports
    return get_admin_reports()


@dashboard_bp.route('/doctor', methods=['GET'])
@jwt_required()
def get_doctor_dashboard_route():
    from app.routes.doctor import get_doctor_dashboard
    return get_doctor_dashboard()

