import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import { adminAPI, pharmacyAPI, dashboardAPI } from '../../services/api';

const AddMedicineStock = () => {
  const [medicines, setMedicines] = useState([]);
  const [pharmacyId, setPharmacyId] = useState(1);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [price, setPrice] = useState('150.00');
  const [stockQuantity, setStockQuantity] = useState('50');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const dash = await dashboardAPI.getPharmacy();
        setPharmacyId(dash.data.pharmacy?.id || 1);
        const medRes = await adminAPI.getMedicines();
        setMedicines(medRes.data);
        if (medRes.data.length > 0) setSelectedMedId(medRes.data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await pharmacyAPI.addInventory(pharmacyId, {
        medicine_id: parseInt(selectedMedId),
        price: parseFloat(price),
        stock_quantity: parseInt(stockQuantity)
      });
      setToast({ message: 'Inventory updated successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/pharmacy/inventory');
      }, 1000);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to update stock', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Add / Update Medicine Stock</h3>
        <p className="text-muted small">Select a drug from the catalog and set unit price & available quantity.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Select Medicine</label>
                <select 
                  className="form-select rounded-3" 
                  value={selectedMedId} 
                  onChange={e => setSelectedMedId(e.target.value)}
                  required
                >
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.strength}) - {m.generic_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Unit Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-control rounded-3" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  required 
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Stock Quantity</label>
                <input 
                  type="number" 
                  className="form-control rounded-3" 
                  value={stockQuantity} 
                  onChange={e => setStockQuantity(e.target.value)} 
                  required 
                />
              </div>

              <div className="d-flex justify-content-between">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate('/pharmacy/inventory')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Inventory Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddMedicineStock;
