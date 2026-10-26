from flask import Blueprint, request, jsonify
from app.models import Medicine, PharmacyInventory, Pharmacy
from app.services.recommendation_service import calculate_pharmacy_recommendation

medicines_bp = Blueprint('medicines', __name__, url_prefix='/api/medicines')

@medicines_bp.route('/search', methods=['GET'])
def search_medicines():
    query = request.args.get('q', '').strip()
    if not query:
        medicines = Medicine.query.all()
    else:
        medicines = Medicine.query.filter(
            (Medicine.name.ilike(f'%{query}%')) | 
            (Medicine.generic_name.ilike(f'%{query}%'))
        ).all()
    return jsonify([m.to_dict() for m in medicines]), 200


@medicines_bp.route('/<int:medicine_id>', methods=['GET'])
def get_medicine_details(medicine_id):
    medicine = Medicine.query.get(medicine_id)
    if not medicine:
        return jsonify({'error': 'Medicine not found'}), 404

    lat = request.args.get('lat', 13.0827, type=float)
    lon = request.args.get('lon', 80.2707, type=float)

    # Get inventory records across all pharmacies for this medicine
    inventories = PharmacyInventory.query.filter_by(medicine_id=medicine_id).all()
    items = []
    for inv in inventories:
        pharmacy = Pharmacy.query.get(inv.pharmacy_id)
        if pharmacy:
            items.append({'pharmacy': pharmacy, 'inventory': inv})

    recommendations = calculate_pharmacy_recommendation(items, user_lat=lat, user_lon=lon)

    res = medicine.to_dict()
    res['pharmacy_options'] = recommendations
    return jsonify(res), 200
