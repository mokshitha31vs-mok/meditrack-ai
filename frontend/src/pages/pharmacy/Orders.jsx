import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import { orderAPI } from '../../services/api';

const PharmacyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getAll();
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

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      setToast({ message: `Order status updated to ${status}`, type: 'success' });
      fetchOrders();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to update order status', type: 'error' });
    }
  };

  if (loading) return <Layout><Loading text="Loading pharmacy orders..." /></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Incoming Store Orders</h3>
        <p className="text-muted small">Process customer orders, verify prescription items, and mark orders ready for delivery dispatch.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Delivery Address</th>
                <th>Amount</th>
                <th>Current Status</th>
                <th className="text-end">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><strong className="text-primary">#{o.id}</strong></td>
                  <td>
                    <strong className="text-dark d-block">{o.customer_name}</strong>
                    <span className="text-muted extra-small">{o.customer_phone}</span>
                  </td>
                  <td className="small text-muted" style={{ maxWidth: '200px' }}>{o.delivery_address}</td>
                  <td className="fw-bold text-success">₹{o.total_amount}</td>
                  <td>
                    <span className={`badge ${o.status === 'DELIVERED' ? 'bg-success' : o.status === 'REJECTED' ? 'bg-danger' : 'bg-primary'} rounded-pill px-3 py-1`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      {o.status === 'PLACED' && (
                        <>
                          <button className="btn btn-success" onClick={() => handleStatusUpdate(o.id, 'ACCEPTED')}>
                            <i className="bi bi-check-lg me-1"></i> Accept
                          </button>
                          <button className="btn btn-danger" onClick={() => handleStatusUpdate(o.id, 'REJECTED')}>
                            <i className="bi bi-x-lg me-1"></i> Reject
                          </button>
                        </>
                      )}
                      {o.status === 'ACCEPTED' && (
                        <button className="btn btn-primary" onClick={() => handleStatusUpdate(o.id, 'PREPARING')}>
                          Mark Preparing
                        </button>
                      )}
                      {o.status === 'PREPARING' && (
                        <button className="btn btn-info text-white" onClick={() => handleStatusUpdate(o.id, 'READY FOR PICKUP')}>
                          Ready for Pickup
                        </button>
                      )}
                      <Link to={`/pharmacy/orders/${o.id}`} className="btn btn-outline-secondary">
                        Details
                      </Link>
                    </div>
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

export default PharmacyOrdersPage;
