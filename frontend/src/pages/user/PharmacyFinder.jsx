import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import MapComponent from '../../components/Map';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import { pharmacyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PharmacyFinder = () => {
  const { userLocation } = useAuth();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        const res = await pharmacyAPI.getNearby(userLocation.latitude, userLocation.longitude);
        setPharmacies(res.data);
      } catch (err) {
        setToast({ message: 'Failed to fetch nearby pharmacies', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacies();
  }, [userLocation]);

  if (loading) return <Layout><Loading text="Locating nearby pharmacies..." /></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Nearby Pharmacy Finder</h3>
        <p className="text-muted small">Find partner pharmacies around your current geolocation with operating hours & contact info.</p>
      </div>

      <div className="row g-4">
        {/* Map Column */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-map-fill text-primary me-2"></i>Interactive Map</h5>
            <MapComponent 
              pharmacies={pharmacies} 
              center={[userLocation.latitude, userLocation.longitude]} 
              height="450px"
            />
          </div>
        </div>

        {/* Directory List Column */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white" style={{ maxHeight: '520px', overflowY: 'auto' }}>
            <h5 className="fw-bold text-dark mb-3">Partner Pharmacies ({pharmacies.length})</h5>
            <div className="d-grid gap-3">
              {pharmacies.map(p => (
                <div key={p.id} className="p-3 border rounded-3 bg-light">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className="fw-bold text-primary mb-0">{p.name}</h6>
                    <span className="badge bg-secondary-subtle text-secondary">{p.distance_km} km</span>
                  </div>
                  <p className="text-muted small mb-2"><i className="bi bi-geo-alt me-1"></i>{p.address}</p>
                  <div className="d-flex justify-content-between align-items-center small text-dark">
                    <span><i className="bi bi-telephone me-1 text-success"></i>{p.phone}</span>
                    <span className="badge bg-light text-dark border">{p.opening_hours}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PharmacyFinder;
