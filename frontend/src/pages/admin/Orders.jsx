import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import { adminAPI, orderAPI } from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusOverride = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      setToast({ message: `Order #${orderId} status set to ${newStatus}`, type: 'success' });
      fetchOrders();
    } catch (err) {
      setToast({ message: 'Failed to update order status', type: 'error' });
    }
  };

  if (loading) return <Layout><Loading text="Loading platform orders..." /></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Platform Order Control</h3>
        <p className="text-muted small">Monitor customer purchases, pharmacy fulfillment & delivery status transitions.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Order #</th>
                <th>Patient</th>
                <th>Pharmacy Store</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-end">Admin Status Override</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><strong className="text-primary">#{o.id}</strong></td>
                  <td>{o.customer_name}</td>
                  <td>{o.pharmacy_name}</td>
                  <td className="fw-bold text-success">₹{o.total_amount}</td>
                  <td><span className="badge bg-primary rounded-pill px-3">{o.status}</span></td>
                  <td className="text-end">
                    <select 
                      className="form-select form-select-sm d-inline-block rounded-pill" 
                      style={{ width: '160px' }}
                      value={o.status}
                      onChange={e => handleStatusOverride(o.id, e.target.value)}
                    >
                      <option value="PLACED">PLACED</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="PREPARING">PREPARING</option>
                      <option value="READY FOR PICKUP">READY FOR PICKUP</option>
                      <option value="ASSIGNED TO DELIVERY">ASSIGNED TO DELIVERY</option>
                      <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
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

export default AdminOrders;
