import React from 'react';

const PharmacyCard = ({ pharmacy, onSelect, onAddToCart }) => {
  if (!pharmacy) return null;

  const isAvailable = pharmacy.available;

  return (
    <div className={`card border-0 shadow-sm rounded-4 mb-3 overflow-hidden ${pharmacy.is_top_recommendation ? 'border-primary border-2' : ''}`}>
      {pharmacy.is_top_recommendation && (
        <div className="bg-primary text-white text-center py-1 small fw-bold text-uppercase tracking-wider">
          <i className="bi bi-star-fill me-1"></i> Top Recommendation (Score: {pharmacy.overall_score})
        </div>
      )}

      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="fw-bold text-dark mb-1">{pharmacy.pharmacy_name}</h6>
            <div className="text-muted small">
              <i className="bi bi-geo-alt me-1 text-primary"></i>{pharmacy.address}
            </div>
          </div>
          <span className={`badge ${isAvailable ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'} rounded-pill px-3 py-1`}>
            {isAvailable ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <div className="row g-2 my-2 align-items-center bg-light rounded-3 p-2 text-center">
          <div className="col-4 border-end">
            <div className="text-muted extra-small">Price</div>
            <div className="fw-bold text-success fs-5">₹{pharmacy.price}</div>
          </div>
          <div className="col-4 border-end">
            <div className="text-muted extra-small">Distance</div>
            <div className="fw-bold text-dark">{pharmacy.distance_km} km</div>
          </div>
          <div className="col-4">
            <div className="text-muted extra-small">Score</div>
            <div className="fw-bold text-primary">{pharmacy.overall_score}</div>
          </div>
        </div>

        {pharmacy.recommendation_tag && (
          <div className="mb-3">
            <span className="recommendation-badge">
              <i className="bi bi-lightbulb-fill"></i> {pharmacy.recommendation_tag}
            </span>
          </div>
        )}

        <div className="d-flex gap-2 mt-2">
          {onAddToCart && (
            <button 
              className="btn btn-primary btn-sm flex-fill rounded-pill fw-semibold"
              disabled={!isAvailable}
              onClick={() => onAddToCart(pharmacy)}
            >
              <i className="bi bi-cart-plus me-1"></i> Add to Cart
            </button>
          )}
          {onSelect && (
            <button 
              className="btn btn-outline-secondary btn-sm rounded-pill"
              onClick={() => onSelect(pharmacy)}
            >
              View Store
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyCard;
