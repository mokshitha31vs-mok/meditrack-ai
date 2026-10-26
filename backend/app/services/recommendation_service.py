from app.utils.distance import calculate_haversine_distance

def calculate_pharmacy_recommendation(pharmacies_with_items, user_lat=13.0827, user_lon=80.2707):
    """
    Rule-based recommendation score algorithm:
    0.55 * price_score + 0.35 * distance_score + 0.10 * availability_score
    Clearly labelled: Rule-based recommendation algorithm.
    """
    if not pharmacies_with_items:
        return []

    # Calculate distance for all candidates
    candidates = []
    for item in pharmacies_with_items:
        pharmacy = item['pharmacy']
        inv = item['inventory']
        dist = calculate_haversine_distance(user_lat, user_lon, pharmacy.latitude, pharmacy.longitude)
        candidates.append({
            'pharmacy': pharmacy,
            'inventory': inv,
            'distance_km': dist,
            'price': inv.price,
            'available': inv.availability and inv.stock_quantity > 0
        })

    prices = [c['price'] for c in candidates]
    distances = [c['distance_km'] for c in candidates]

    min_price, max_price = min(prices), max(prices)
    min_dist, max_dist = min(distances), max(distances)

    results = []
    for c in candidates:
        # Price score (lower price = higher score 0..1)
        if max_price == min_price:
            price_score = 1.0
        else:
            price_score = (max_price - c['price']) / (max_price - min_price)

        # Distance score (lower distance = higher score 0..1)
        if max_dist == min_dist:
            distance_score = 1.0
        else:
            distance_score = (max_dist - c['distance_km']) / (max_dist - min_dist)

        # Availability score (1 if available else 0)
        avail_score = 1.0 if c['available'] else 0.0

        # Overall composite score formula
        overall_score = round(
            (0.55 * price_score) + (0.35 * distance_score) + (0.10 * avail_score),
            2
        )

        # Explanation tag
        explanation = "Standard Option"
        if c['price'] == min_price and c['distance_km'] == min_dist:
            explanation = "Best Price & Nearest Location"
        elif c['price'] == min_price:
            explanation = "Cheapest Option"
        elif c['distance_km'] == min_dist:
            explanation = "Nearest Pharmacy"
        elif overall_score >= 0.7:
            explanation = "Best Balance of Price and Distance"

        res_dict = {
            'pharmacy_id': c['pharmacy'].id,
            'pharmacy_name': c['pharmacy'].name,
            'address': c['pharmacy'].address,
            'phone': c['pharmacy'].phone,
            'latitude': c['pharmacy'].latitude,
            'longitude': c['pharmacy'].longitude,
            'opening_hours': c['pharmacy'].opening_hours,
            'medicine_name': c['inventory'].medicine_name,
            'price': c['price'],
            'stock_quantity': c['inventory'].stock_quantity,
            'available': c['available'],
            'distance_km': c['distance_km'],
            'overall_score': overall_score,
            'recommendation_tag': explanation
        }
        results.append(res_dict)

    # Sort descending by overall_score
    results.sort(key=lambda x: x['overall_score'], reverse=True)
    if results:
        results[0]['is_top_recommendation'] = True

    return results
