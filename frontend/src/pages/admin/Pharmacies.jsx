import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import { adminAPI } from '../../services/api';

const AdminPharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: 13.0827,
    longitude: 80.2707,
    phone: '',
    email: '',
    opening_hours: '8:00 AM - 10:00 PM'
  });

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getPharmacies();
      setPharmacies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createPharmacy(form);
      setToast({ message: 'Pharmacy registered successfully!', type: 'success' });
      setShowModal(false);
      fetchPharmacies();
    } catch (err) {
      setToast({ message: 'Failed to create pharmacy', type: 'error' });
    }
  };

  if (loading) return <Layout><Loading text="Loading pharmacy network..." /></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-extrabold text-dark mb-1">Partner Pharmacy Network</h3>
          <p className="text-muted small">Register partner stores and view GPS locations.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-1"></i> Register New Pharmacy
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Pharmacy Name</th>
                <th>Address</th>
                <th>Contact</th>
                <th>Hours</th>
                <th>Coordinates</th>
                <th>Verification</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.map(p => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td><strong className="text-primary">{p.name}</strong></td>
                  <td className="small text-muted">{p.address}</td>
                  <td className="small">{p.phone}<br/>{p.email}</td>
                  <td><span className="badge bg-light text-dark border">{p.opening_hours}</span></td>
                  <td className="extra-small text-muted">{p.latitude}, {p.longitude}</td>
                  <td>
                    {p.is_verified ? (
                      <span className="badge bg-success rounded-pill px-2">
                        <i className="bi bi-patch-check-fill me-1"></i> Verified
                      </span>
                    ) : (
                      <span className="badge bg-warning text-dark rounded-pill px-2">
                        <i className="bi bi-clock me-1"></i> Unverified
                      </span>
                    )}
                  </td>
                  <td className="text-end">
                    <button
                      className={`btn btn-sm ${p.is_verified ? 'btn-outline-danger' : 'btn-outline-success'} rounded-pill px-2 py-1`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={async () => {
                        try {
                          await adminAPI.verifyPharmacy(p.id, !p.is_verified);
                          setToast({ message: `Pharmacy #${p.id} verification updated`, type: 'success' });
                          fetchPharmacies();
                        } catch (err) {
                          setToast({ message: 'Failed to update verification', type: 'error' });
                        }
                      }}
                    >
                      {p.is_verified ? 'Revoke' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Register Partner Pharmacy</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Pharmacy Name</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3" 
                      value={form.name} 
                      onChange={e => setForm({ ...form, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Address</label>
                    <textarea 
                      className="form-control rounded-3" 
                      rows="2" 
                      value={form.address} 
                      onChange={e => setForm({ ...form, address: e.target.value })} 
                      required 
                    ></textarea>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Latitude</label>
                      <input 
                        type="number" 
                        step="any" 
                        className="form-control rounded-3" 
                        value={form.latitude} 
                        onChange={e => setForm({ ...form, latitude: e.target.value })} 
                        required 
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Longitude</label>
                      <input 
                        type="number" 
                        step="any" 
                        className="form-control rounded-3" 
                        value={form.longitude} 
                        onChange={e => setForm({ ...form, longitude: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Phone</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3" 
                        value={form.phone} 
                        onChange={e => setForm({ ...form, phone: e.target.value })} 
                        required 
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Email</label>
                      <input 
                        type="email" 
                        className="form-control rounded-3" 
                        value={form.email} 
                        onChange={e => setForm({ ...form, email: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">Register Pharmacy</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminPharmacies;
