from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Order, OrderItem, Cart, CartItem, User, Pharmacy, PharmacyInventory, Delivery, AuditLog

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')

VALID_TRANSITIONS = {
    'PLACED': ['ACCEPTED', 'REJECTED'],
    'ACCEPTED': ['PREPARING', 'REJECTED'],
    'PREPARING': ['READY FOR PICKUP'],
    'READY FOR PICKUP': ['ASSIGNED TO DELIVERY'],
    'ASSIGNED TO DELIVERY': ['OUT FOR DELIVERY'],
    'OUT FOR DELIVERY': ['DELIVERED']
}

@orders_bp.route('', methods=['POST'])
@jwt_required()
def place_order():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    delivery_address = data.get('delivery_address') or user.address or 'Chennai, Tamil Nadu'
    payment_method = data.get('payment_method', 'Cash on Delivery')

    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart or not cart.items:
        return jsonify({'error': 'Cart is empty. Please add items before checking out.'}), 400

    pharmacy_id = cart.pharmacy_id
    pharmacy = Pharmacy.query.get(pharmacy_id)
    if not pharmacy:
        return jsonify({'error': 'Pharmacy not found'}), 400

    # Strict Stock Validation for ALL cart items BEFORE placing order
    for item in cart.items:
        inv = PharmacyInventory.query.filter_by(pharmacy_id=pharmacy_id, medicine_id=item.medicine_id).first()
        if not inv or inv.stock_quantity < item.quantity:
            avail = inv.stock_quantity if inv else 0
            return jsonify({
                'error': f"The requested quantity for '{item.medicine_name}' is no longer available. Available in stock: {avail}, requested: {item.quantity}."
            }), 400

    total_amount = sum(item.price * item.quantity for item in cart.items)

    order = Order(
        user_id=user_id,
        pharmacy_id=pharmacy_id,
        total_amount=round(total_amount, 2),
        delivery_address=delivery_address,
        latitude=user.latitude or pharmacy.latitude,
        longitude=user.longitude or pharmacy.longitude,
        payment_method=payment_method,
        status='PLACED'
    )
    db.session.add(order)
    db.session.flush()

    # Deduct stock and create order items
    for item in cart.items:
        order_item = OrderItem(
            order_id=order.id,
            medicine_id=item.medicine_id,
            medicine_name=item.medicine_name,
            quantity=item.quantity,
            price=item.price
        )
        db.session.add(order_item)

        inv = PharmacyInventory.query.filter_by(pharmacy_id=pharmacy_id, medicine_id=item.medicine_id).first()
        if inv:
            inv.stock_quantity -= item.quantity
            if inv.stock_quantity <= 0:
                inv.stock_quantity = 0
                inv.availability = False

    # Create initial delivery tracking record
    delivery = Delivery(
        order_id=order.id,
        delivery_person_id=None,
        status='PENDING'
    )
    db.session.add(delivery)

    # Clear user's cart
    CartItem.query.filter_by(cart_id=cart.id).delete()

    # Audit log
    audit = AuditLog(
        user_id=user_id,
        action='ORDER_PLACED',
        entity_type='order',
        entity_id=order.id,
        details=f"Order #{order.id} placed at '{pharmacy.name}' for Rs. {order.total_amount}",
        ip_address=request.remote_addr
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': 'Order placed successfully.',
        'order': order.to_dict()
    }), 201


@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.role == 'admin':
        orders = Order.query.order_by(Order.created_at.desc()).all()
    elif user.role == 'pharmacy':
        pharmacy = Pharmacy.query.filter_by(user_id=user_id).first()
        if not pharmacy:
            orders = Order.query.order_by(Order.created_at.desc()).all()
        else:
            orders = Order.query.filter_by(pharmacy_id=pharmacy.id).order_by(Order.created_at.desc()).all()
    elif user.role == 'delivery':
        orders = Order.query.filter_by(delivery_person_id=user_id).order_by(Order.created_at.desc()).all()
    else:  # patient
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()

    return jsonify([o.to_dict() for o in orders]), 200


@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order_details(order_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    # Access control
    if user.role == 'patient' and order.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    elif user.role == 'pharmacy':
        pharmacy = Pharmacy.query.filter_by(user_id=user_id).first()
        if pharmacy and order.pharmacy_id != pharmacy.id:
            return jsonify({'error': 'Unauthorized'}), 403
    elif user.role == 'delivery' and order.delivery_person_id != user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify(order.to_dict()), 200


@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status', '').upper().strip()

    if not new_status:
        return jsonify({'error': 'New status is required'}), 400

    current_status = order.status
    allowed_next = VALID_TRANSITIONS.get(current_status, [])

    # Role-based authorization and state machine transition validation
    if user.role != 'admin' and new_status not in allowed_next:
        return jsonify({
            'error': f'Invalid status transition from {current_status} to {new_status}.',
            'allowed_transitions': allowed_next
        }), 400

    old_status = order.status
    order.status = new_status

    # Synchronize delivery status
    if order.delivery_record:
        from datetime import datetime
        if new_status == 'ASSIGNED TO DELIVERY':
            order.delivery_record.status = 'ASSIGNED'
        elif new_status == 'OUT FOR DELIVERY':
            order.delivery_record.status = 'OUT_FOR_DELIVERY'
            order.delivery_record.out_for_delivery_time = datetime.utcnow()
        elif new_status == 'DELIVERED':
            order.delivery_record.status = 'DELIVERED'
            order.delivery_record.delivered_time = datetime.utcnow()

    audit = AuditLog(
        user_id=user_id,
        action='ORDER_STATUS_UPDATED',
        entity_type='order',
        entity_id=order.id,
        details=f"Order #{order.id} status changed from '{old_status}' to '{new_status}' by {user.role} ({user.name})",
        ip_address=request.remote_addr
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({'message': f'Order status updated to {new_status}', 'order': order.to_dict()}), 200
