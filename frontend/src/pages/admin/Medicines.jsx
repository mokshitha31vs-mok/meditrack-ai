import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import { adminAPI } from '../../services/api';

const AdminMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const [form, setForm] = useState({
    name: '',
    generic_name: '',
    dosage_form: 'Tablet',
    strength: '500 mg',
    description: ''
  });

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getMedicines();
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createMedicine(form);
      setToast({ message: 'Medicine added to catalog!', type: 'success' });
      setShowModal(false);
      fetchMedicines();
    } catch (err) {
      setToast({ message: 'Failed to add medicine', type: 'error' });
    }
  };

  if (loading) return <Layout><Loading text="Loading medicine catalog..." /></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-extrabold text-dark mb-1">Global Medicine Master Catalog</h3>
          <p className="text-muted small">Manage standardized pharmaceutical drug entries for pharmacy stock mapping.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-1"></i> Add New Medicine Entry
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Trade Name</th>
                <th>Generic Name</th>
                <th>Dosage Form</th>
                <th>Strength</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map(m => (
                <tr key={m.id}>
                  <td>#{m.id}</td>
                  <td><strong className="text-dark">{m.name}</strong></td>
                  <td className="text-muted">{m.generic_name || 'N/A'}</td>
                  <td><span className="badge bg-light text-dark border">{m.dosage_form}</span></td>
                  <td><span className="badge bg-primary-subtle text-primary">{m.strength}</span></td>
                  <td className="small text-muted" style={{ maxWidth: '250px' }}>{m.description}</td>
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
                <h5 className="modal-title fw-bold text-dark">Add New Medicine to Catalog</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Medicine Trade Name</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3" 
                      placeholder="e.g. Paracetamol"
                      value={form.name} 
                      onChange={e => setForm({ ...form, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Generic Name / Active Formula</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3" 
                      placeholder="e.g. Acetaminophen"
                      value={form.generic_name} 
                      onChange={e => setForm({ ...form, generic_name: e.target.value })} 
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Dosage Form</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3" 
                        value={form.dosage_form} 
                        onChange={e => setForm({ ...form, dosage_form: e.target.value })} 
                        required 
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Strength</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3" 
                        value={form.strength} 
                        onChange={e => setForm({ ...form, strength: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Description</label>
                    <textarea 
                      className="form-control rounded-3" 
                      rows="2"
                      value={form.description} 
                      onChange={e => setForm({ ...form, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">Save Medicine</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminMedicines;
