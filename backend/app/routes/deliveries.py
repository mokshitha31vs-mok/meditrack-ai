from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Order, Delivery, User
from app.utils.auth import role_required

deliveries_bp = Blueprint('deliveries', __name__, url_prefix='/api/delivery')

@deliveries_bp.route('/assign', methods=['POST'])
@jwt_required()
@role_required(['admin', 'pharmacy'])
def assign_delivery():
    data = request.get_json() or {}
    order_id = data.get('order_id')
    delivery_person_id = data.get('delivery_person_id')

    if not order_id or not delivery_person_id:
        return jsonify({'error': 'order_id and delivery_person_id are required'}), 400

    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    delivery_user = User.query.get(delivery_person_id)
    if not delivery_user or delivery_user.role != 'delivery':
        return jsonify({'error': 'Invalid delivery personnel'}), 400

    order.delivery_person_id = delivery_user.id
    order.status = 'ASSIGNED TO DELIVERY'

    delivery = Delivery.query.filter_by(order_id=order.id).first()
    if not delivery:
        delivery = Delivery(
            order_id=order.id,
            delivery_person_id=delivery_user.id,
            status='ASSIGNED'
        )
        db.session.add(delivery)
    else:
        delivery.delivery_person_id = delivery_user.id
        delivery.status = 'ASSIGNED'

    db.session.commit()
    return jsonify({
        'message': f'Order assigned to {delivery_user.name}',
        'order': order.to_dict(),
        'delivery': delivery.to_dict()
    }), 200


@deliveries_bp.route('', methods=['GET'])
@jwt_required()
def get_deliveries():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.role == 'admin':
        deliveries = Delivery.query.all()
    elif user.role == 'delivery':
        deliveries = Delivery.query.filter_by(delivery_person_id=user_id).all()
    else:
        deliveries = []

    res = []
    for d in deliveries:
        d_dict = d.to_dict()
        order = Order.query.get(d.order_id)
        if order:
            d_dict['order'] = order.to_dict()
        res.append(d_dict)

    return jsonify(res), 200


@deliveries_bp.route('/<int:delivery_id>', methods=['GET'])
@jwt_required()
def get_delivery_details(delivery_id):
    delivery = Delivery.query.get(delivery_id)
    if not delivery:
        return jsonify({'error': 'Delivery record not found'}), 404

    d_dict = delivery.to_dict()
    order = Order.query.get(delivery.order_id)
    if order:
        d_dict['order'] = order.to_dict()

    return jsonify(d_dict), 200


@deliveries_bp.route('/<int:delivery_id>/status', methods=['PUT'])
@jwt_required()
def update_delivery_status(delivery_id):
    delivery = Delivery.query.get(delivery_id)
    if not delivery:
        return jsonify({'error': 'Delivery record not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status', '').upper().strip() # ACCEPTED, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED

    order = Order.query.get(delivery.order_id)

    if new_status in ['ACCEPTED', 'ASSIGNED']:
        delivery.status = 'ASSIGNED'
        if order:
            order.status = 'ASSIGNED TO DELIVERY'
    elif new_status == 'PICKED_UP':
        delivery.status = 'PICKED_UP'
        delivery.pickup_time = datetime.utcnow()
        if order:
            order.status = 'READY FOR PICKUP'
    elif new_status in ['OUT_FOR_DELIVERY', 'OUT FOR DELIVERY']:
        delivery.status = 'OUT_FOR_DELIVERY'
        delivery.out_for_delivery_time = datetime.utcnow()
        if order:
            order.status = 'OUT FOR DELIVERY'
    elif new_status in ['DELIVERED']:
        delivery.status = 'DELIVERED'
        delivery.delivered_time = datetime.utcnow()
        if order:
            order.status = 'DELIVERED'

    db.session.commit()
    return jsonify({
        'message': f'Delivery status updated to {delivery.status}',
        'delivery': delivery.to_dict(),
        'order': order.to_dict() if order else None
    }), 200
