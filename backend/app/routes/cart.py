from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Cart, CartItem, Pharmacy

cart_bp = Blueprint('cart', __name__, url_prefix='/api/cart')

def get_or_create_cart(user_id, pharmacy_id=None):
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id, pharmacy_id=pharmacy_id)
        db.session.add(cart)
        db.session.commit()
    elif pharmacy_id and cart.pharmacy_id != pharmacy_id:
        # If user chooses items from a different pharmacy, clear old cart items or switch pharmacy
        CartItem.query.filter_by(cart_id=cart.id).delete()
        cart.pharmacy_id = pharmacy_id
        db.session.commit()
    return cart

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = int(get_jwt_identity())
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({
            'id': None,
            'user_id': user_id,
            'pharmacy_id': None,
            'items': [],
            'total_amount': 0.0,
            'pharmacy_name': None
        }), 200

    pharmacy = Pharmacy.query.get(cart.pharmacy_id) if cart.pharmacy_id else None
    cart_dict = cart.to_dict()
    cart_dict['pharmacy_name'] = pharmacy.name if pharmacy else None
    cart_dict['pharmacy_address'] = pharmacy.address if pharmacy else None
    return jsonify(cart_dict), 200


@cart_bp.route('', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    pharmacy_id = data.get('pharmacy_id')
    medicine_id = data.get('medicine_id')
    medicine_name = data.get('medicine_name')
    quantity = int(data.get('quantity', 1))
    price = float(data.get('price', 0.0))

    if not pharmacy_id or not medicine_id or not medicine_name:
        return jsonify({'error': 'pharmacy_id, medicine_id, and medicine_name are required'}), 400

    cart = get_or_create_cart(user_id, pharmacy_id=pharmacy_id)

    # Check if item already in cart
    existing_item = CartItem.query.filter_by(cart_id=cart.id, medicine_id=medicine_id).first()
    if existing_item:
        existing_item.quantity += quantity
        existing_item.price = price
    else:
        new_item = CartItem(
            cart_id=cart.id,
            medicine_id=medicine_id,
            medicine_name=medicine_name,
            quantity=quantity,
            price=price
        )
        db.session.add(new_item)

    db.session.commit()
    return jsonify({'message': 'Item added to cart', 'cart': cart.to_dict()}), 200


@cart_bp.route('/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    user_id = int(get_jwt_identity())
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
    if not item:
        return jsonify({'error': 'Cart item not found'}), 404

    data = request.get_json() or {}
    quantity = int(data.get('quantity', 1))
    if quantity <= 0:
        db.session.delete(item)
    else:
        item.quantity = quantity

    db.session.commit()
    return jsonify({'message': 'Cart updated', 'cart': cart.to_dict()}), 200


@cart_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_cart_item(item_id):
    user_id = int(get_jwt_identity())
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
    if not item:
        return jsonify({'error': 'Cart item not found'}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item removed from cart', 'cart': cart.to_dict()}), 200


@cart_bp.route('', methods=['DELETE'])
@jwt_required()
def clear_cart():
    user_id = int(get_jwt_identity())
    cart = Cart.query.filter_by(user_id=user_id).first()
    if cart:
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()
    return jsonify({'message': 'Cart cleared'}), 200
