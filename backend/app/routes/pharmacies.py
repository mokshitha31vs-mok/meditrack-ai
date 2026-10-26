from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Pharmacy, PharmacyInventory, Medicine, User
from app.utils.distance import calculate_haversine_distance
from app.services.recommendation_service import calculate_pharmacy_recommendation
from app.utils.auth import role_required

pharmacies_bp = Blueprint('pharmacies', __name__, url_prefix='/api/pharmacies')

@pharmacies_bp.route('/nearby', methods=['GET'])
def get_nearby_pharmacies():
    lat = request.args.get('lat', 13.0827, type=float)
    lon = request.args.get('lon', 80.2707, type=float)

    pharmacies = Pharmacy.query.all()
    result = []
    for p in pharmacies:
        p_dict = p.to_dict()
        dist = calculate_haversine_distance(lat, lon, p.latitude, p.longitude)
        p_dict['distance_km'] = dist
        result.append(p_dict)

    result.sort(key=lambda x: x['distance_km'])
    return jsonify(result), 200


@pharmacies_bp.route('/compare', methods=['GET'])
def compare_pharmacies():
    med_query = request.args.get('medicine', '').strip()
    lat = request.args.get('lat', 13.0827, type=float)
    lon = request.args.get('lon', 80.2707, type=float)

    if not med_query:
        # Default to first medicine if empty
        first_med = Medicine.query.first()
        med_query = first_med.name if first_med else 'Paracetamol'

    inventories = PharmacyInventory.query.filter(
        PharmacyInventory.medicine_name.ilike(f'%{med_query}%')
    ).all()

    items = []
    for inv in inventories:
        pharmacy = Pharmacy.query.get(inv.pharmacy_id)
        if pharmacy:
            items.append({'pharmacy': pharmacy, 'inventory': inv})

    recommendations = calculate_pharmacy_recommendation(items, user_lat=lat, user_lon=lon)
    return jsonify({
        'query': med_query,
        'user_location': {'latitude': lat, 'longitude': lon},
        'results': recommendations
    }), 200


@pharmacies_bp.route('/<int:pharmacy_id>', methods=['GET'])
def get_pharmacy_details(pharmacy_id):
    pharmacy = Pharmacy.query.get(pharmacy_id)
    if not pharmacy:
        return jsonify({'error': 'Pharmacy not found'}), 404

    lat = request.args.get('lat', 13.0827, type=float)
    lon = request.args.get('lon', 80.2707, type=float)

    p_dict = pharmacy.to_dict()
    p_dict['distance_km'] = calculate_haversine_distance(lat, lon, pharmacy.latitude, pharmacy.longitude)
    p_dict['inventory'] = [inv.to_dict() for inv in pharmacy.inventory]

    return jsonify(p_dict), 200


@pharmacies_bp.route('/<int:pharmacy_id>/inventory', methods=['GET'])
def get_pharmacy_inventory(pharmacy_id):
    pharmacy = Pharmacy.query.get(pharmacy_id)
    if not pharmacy:
        return jsonify({'error': 'Pharmacy not found'}), 404

    return jsonify([inv.to_dict() for inv in pharmacy.inventory]), 200


@pharmacies_bp.route('/<int:pharmacy_id>/inventory', methods=['POST'])
@jwt_required()
@role_required(['pharmacy', 'admin'])
def add_pharmacy_inventory(pharmacy_id):
    pharmacy = Pharmacy.query.get(pharmacy_id)
    if not pharmacy:
        return jsonify({'error': 'Pharmacy not found'}), 404

    data = request.get_json() or {}
    medicine_id = data.get('medicine_id')
    price = data.get('price')
    stock_quantity = data.get('stock_quantity', 50)

    if not medicine_id or price is None:
        return jsonify({'error': 'medicine_id and price are required'}), 400

    medicine = Medicine.query.get(medicine_id)
    if not medicine:
        return jsonify({'error': 'Medicine not found'}), 404

    # Check existing
    inv = PharmacyInventory.query.filter_by(pharmacy_id=pharmacy.id, medicine_id=medicine.id).first()
    if inv:
        inv.price = float(price)
        inv.stock_quantity = int(stock_quantity)
        inv.availability = inv.stock_quantity > 0
    else:
        inv = PharmacyInventory(
            pharmacy_id=pharmacy.id,
            medicine_id=medicine.id,
            medicine_name=medicine.name,
            price=float(price),
            stock_quantity=int(stock_quantity),
            availability=int(stock_quantity) > 0
        )
        db.session.add(inv)

    db.session.commit()
    return jsonify(inv.to_dict()), 201


@pharmacies_bp.route('/inventory/<int:inventory_id>', methods=['PUT'])
@jwt_required()
@role_required(['pharmacy', 'admin'])
def update_inventory_item(inventory_id):
    inv = PharmacyInventory.query.get(inventory_id)
    if not inv:
        return jsonify({'error': 'Inventory item not found'}), 404

    data = request.get_json() or {}
    if 'price' in data:
        inv.price = float(data['price'])
    if 'stock_quantity' in data:
        inv.stock_quantity = int(data['stock_quantity'])
        inv.availability = inv.stock_quantity > 0
    if 'availability' in data:
        inv.availability = bool(data['availability'])

    db.session.commit()
    return jsonify(inv.to_dict()), 200
