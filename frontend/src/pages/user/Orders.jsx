import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { orderAPI } from '../../services/api';

const PatientOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchOrders();
  }, []);

  if (loading) return <Layout><Loading text="Loading order history..." /></Layout>;

  return (
    <Layout>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">My Orders & Delivery Status</h3>
        <p className="text-muted small">View your active and past medicine orders.</p>
      </div>

      {orders.length > 0 ? (
        <div className="d-grid gap-3">
          {orders.map(o => (
            <div key={o.id} className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="fw-bold text-dark mb-1">Order #{o.id}</h6>
                  <span className="text-muted small"><i className="bi bi-shop me-1 text-primary"></i>{o.pharmacy_name}</span>
                </div>
                <span className="badge bg-primary rounded-pill px-3 py-1">{o.status}</span>
              </div>

              <div className="bg-light p-2.5 rounded-3 d-flex justify-content-between align-items-center small my-2">
                <div>
                  <span className="text-muted me-1">Items:</span>
                  <strong>{o.items?.length || 0} medicine(s)</strong>
                </div>
                <div>
                  <span className="text-muted me-1">Total:</span>
                  <strong className="text-success">₹{o.total_amount}</strong>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-2">
                <span className="text-muted extra-small">
                  Placed on {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Today'}
                </span>
                <Link to={`/user/orders/${o.id}`} className="btn btn-outline-primary btn-sm rounded-pill px-4">
                  Track Delivery <i className="bi bi-geo-alt-fill ms-1"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="bi-bag-x"
          title="No Orders Found"
          description="You haven't placed any medicine orders yet."
          actionButton={
            <Link to="/user/pharmacy-comparison" className="btn btn-primary rounded-pill px-4">
              Browse Medicines
            </Link>
          }
        />
      )}
    </Layout>
  );
};

export default PatientOrdersPage;
