import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import { pharmacyAPI, dashboardAPI } from '../../services/api';

const PharmacyInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const dash = await dashboardAPI.getPharmacy();
      const pId = dash.data.pharmacy?.id || 1;
      const res = await pharmacyAPI.getInventory(pId);
      setInventory(res.data);
    } catch (err) {
      setToast({ message: 'Failed to fetch inventory', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = async (id, newStock) => {
    try {
      await pharmacyAPI.updateInventory(id, { stock_quantity: parseInt(newStock) });
      setToast({ message: 'Stock updated', type: 'success' });
      fetchInventory();
    } catch (err) {
      setToast({ message: 'Failed to update stock', type: 'error' });
    }
  };

  const handlePriceChange = async (id, newPrice) => {
    try {
      await pharmacyAPI.updateInventory(id, { price: parseFloat(newPrice) });
      setToast({ message: 'Price updated', type: 'success' });
      fetchInventory();
    } catch (err) {
      setToast({ message: 'Failed to update price', type: 'error' });
    }
  };

  if (loading) return <Layout><Loading text="Loading pharmacy inventory..." /></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-extrabold text-dark mb-1">Pharmacy Medicine Inventory</h3>
          <p className="text-muted small">Update stock quantities, unit prices, and toggle in-stock availability.</p>
        </div>
        <Link to="/pharmacy/inventory/add" className="btn btn-primary rounded-pill px-4 shadow-sm">
          <i className="bi bi-plus-circle me-1"></i> Add New Medicine Stock
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Medicine Name</th>
                <th>Price (₹)</th>
                <th>Stock Quantity</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td>
                    <strong className="text-dark d-block">{item.medicine_name}</strong>
                  </td>
                  <td>
                    <div className="input-group input-group-sm" style={{ maxWidth: '120px' }}>
                      <span className="input-group-text">₹</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        defaultValue={item.price} 
                        onBlur={e => handlePriceChange(item.id, e.target.value)} 
                      />
                    </div>
                  </td>
                  <td>
                    <div className="input-group input-group-sm" style={{ maxWidth: '120px' }}>
                      <input 
                        type="number" 
                        className="form-control" 
                        defaultValue={item.stock_quantity} 
                        onBlur={e => handleStockChange(item.id, e.target.value)} 
                      />
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.availability ? 'bg-success' : 'bg-danger'} rounded-pill px-3`}>
                      {item.availability ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default PharmacyInventoryPage;
