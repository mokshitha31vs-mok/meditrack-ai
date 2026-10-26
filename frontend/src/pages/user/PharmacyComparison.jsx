import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import PharmacyCard from '../../components/PharmacyCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';
import { pharmacyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const PharmacyComparison = () => {
  const { userLocation } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [searchMedicine, setSearchMedicine] = useState('Paracetamol');
  const [results, setResults] = useState([]);
  const [filterSort, setFilterSort] = useState('BEST'); // BEST, CHEAPEST, NEAREST
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const runComparison = async (medQuery = searchMedicine) => {
    try {
      setLoading(true);
      const res = await pharmacyAPI.compare(medQuery, userLocation.latitude, userLocation.longitude);
      setResults(res.data.results || []);
    } catch (err) {
      setToast({ message: 'Failed to run pharmacy price comparison', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison('Paracetamol');
  }, [userLocation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    runComparison(searchMedicine);
  };

  const handleAddToCart = async (pharmacyItem) => {
    const res = await addToCart({
      pharmacy_id: pharmacyItem.pharmacy_id,
      medicine_id: 1, // sample id mapping
      medicine_name: pharmacyItem.medicine_name,
      quantity: 1,
      price: pharmacyItem.price
    });
    if (res.success) {
      setToast({ message: `${pharmacyItem.medicine_name} added to cart from ${pharmacyItem.pharmacy_name}!`, type: 'success' });
    } else {
      setToast({ message: res.error, type: 'error' });
    }
  };

  // Apply frontend sorting
  const getSortedResults = () => {
    const list = [...results];
    if (filterSort === 'CHEAPEST') {
      return list.sort((a, b) => a.price - b.price);
    } else if (filterSort === 'NEAREST') {
      return list.sort((a, b) => a.distance_km - b.distance_km);
    }
    return list.sort((a, b) => b.overall_score - a.overall_score);
  };

  const sortedList = getSortedResults();

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Medicine Price & Distance Comparison</h3>
        <p className="text-muted small">Compare prices across verified local pharmacies using our transparent recommendation formula.</p>
      </div>

      {/* Transparent Scoring Formula Banner (Section 21) */}
      <div className="alert bg-primary-subtle border-primary text-primary-emphasis rounded-4 mb-4 p-3 d-flex align-items-center gap-3">
        <i className="bi bi-info-circle-fill fs-3 text-primary"></i>
        <div className="small">
          <strong className="d-block">Rule-Based Score Formula:</strong>
          <span>Score = 0.55 × Price Score + 0.35 × Distance Score + 0.10 × Stock Availability. Higher composite score indicates optimal balance of price and location.</span>
        </div>
      </div>

      {/* Search Bar & Filter Buttons */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
              <input 
                type="text" 
                className="form-control bg-light border-start-0 py-2" 
                placeholder="Search medicine (e.g. Paracetamol, Amoxicillin, Cetirizine)..."
                value={searchMedicine}
                onChange={e => setSearchMedicine(e.target.value)}
              />
              <button type="submit" className="btn btn-primary px-4 fw-semibold">Compare</button>
            </div>
          </div>

          <div className="col-md-6 text-md-end">
            <div className="btn-group rounded-pill p-1 bg-light border" role="group">
              <button 
                type="button" 
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filterSort === 'BEST' ? 'btn-primary' : 'btn-light text-muted'}`}
                onClick={() => setFilterSort('BEST')}
              >
                Best Overall
              </button>
              <button 
                type="button" 
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filterSort === 'CHEAPEST' ? 'btn-primary' : 'btn-light text-muted'}`}
                onClick={() => setFilterSort('CHEAPEST')}
              >
                Cheapest
              </button>
              <button 
                type="button" 
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filterSort === 'NEAREST' ? 'btn-primary' : 'btn-light text-muted'}`}
                onClick={() => setFilterSort('NEAREST')}
              >
                Nearest
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Comparison Results */}
      {loading ? (
        <Loading text="Comparing pharmacy prices..." />
      ) : sortedList.length > 0 ? (
        <div className="row g-3">
          {sortedList.map(item => (
            <div className="col-md-6 col-lg-4" key={item.pharmacy_id}>
              <PharmacyCard 
                pharmacy={item} 
                onAddToCart={handleAddToCart}
                onSelect={() => navigate(`/user/cart`)}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="bi-sliders"
          title="No Pharmacy Results Found"
          description={`No pharmacies in our network currently list stock for "${searchMedicine}".`}
        />
      )}
    </Layout>
  );
};

export default PharmacyComparison;
