import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import { dashboardAPI } from '../../services/api';

const PharmacyProfilePage = () => {
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getPharmacy();
        setPharmacy(res.data.pharmacy);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <Layout><Loading text="Loading pharmacy profile..." /></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Pharmacy Profile & Operational Info</h3>
        <p className="text-muted small">Store location coordinates & customer contact details.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-building text-primary me-2"></i>{pharmacy?.name || 'Pharmacy Store'}</h5>
            <div className="mb-3">
              <label className="fw-semibold text-muted small d-block">Physical Address</label>
              <div className="fw-bold text-dark">{pharmacy?.address}</div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="fw-semibold text-muted small d-block">Phone Contact</label>
                <div className="fw-bold text-dark">{pharmacy?.phone}</div>
              </div>
              <div className="col-6">
                <label className="fw-semibold text-muted small d-block">Email Address</label>
                <div className="fw-bold text-dark">{pharmacy?.email}</div>
              </div>
            </div>
            <div className="mb-3">
              <label className="fw-semibold text-muted small d-block">Opening Hours</label>
              <div className="fw-bold text-dark">{pharmacy?.opening_hours}</div>
            </div>
            <div className="bg-light p-3 rounded-3 small">
              <span className="text-muted me-2">Geolocation Coordinates:</span>
              <strong className="text-dark">{pharmacy?.latitude}, {pharmacy?.longitude}</strong>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PharmacyProfilePage;
