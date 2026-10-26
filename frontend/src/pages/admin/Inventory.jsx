import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import { adminAPI } from '../../services/api';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllInventory = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getInventory();
        setInventory(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllInventory();
  }, []);

  if (loading) return <Layout><Loading text="Loading platform inventories..." /></Layout>;

  return (
    <Layout>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Platform Multi-Pharmacy Inventories</h3>
        <p className="text-muted small">Global view of medicine stock levels & pricing across all registered stores.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Pharmacy Store</th>
                <th>Medicine Name</th>
                <th>Price (₹)</th>
                <th>Stock Level</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td><strong className="text-primary">{item.pharmacy_name}</strong></td>
                  <td>{item.medicine_name}</td>
                  <td className="fw-bold text-success">₹{item.price}</td>
                  <td>{item.stock_quantity} units</td>
                  <td>
                    <span className={`badge ${item.availability ? 'bg-success' : 'bg-danger'} rounded-pill px-3`}>
                      {item.availability ? 'Available' : 'Unavailable'}
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

export default AdminInventory;
