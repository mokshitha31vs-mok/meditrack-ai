import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';
import { deliveryAPI } from '../../services/api';

const AssignedOrdersPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await deliveryAPI.getAll();
      setDeliveries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleStatusChange = async (deliveryId, status) => {
    try {
      await deliveryAPI.updateStatus(deliveryId, status);
      setToast({ message: `Delivery status updated to ${status}`, type: 'success' });
      fetchDeliveries();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to update delivery status', type: 'error' });
    }
  };

  if (loading) return <Layout><Loading text="Loading assigned deliveries..." /></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Assigned Delivery Jobs</h3>
        <p className="text-muted small">Update delivery progress steps from store pickup to doorstep dropoff.</p>
      </div>

      {deliveries.length > 0 ? (
        <div className="d-grid gap-3">
          {deliveries.map(d => (
            <div key={d.id} className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="fw-bold text-dark mb-1">Order #{d.order_id}</h6>
                  <span className="badge bg-primary rounded-pill px-3 py-1">Status: {d.status}</span>
                </div>
                <span className="fw-bold text-success fs-5">₹{d.order?.total_amount}</span>
              </div>

              <div className="row g-3 mb-3 bg-light p-3 rounded-3">
                <div className="col-md-6 border-end">
                  <span className="text-muted extra-small font-weight-bold text-uppercase d-block">1. Pickup Pharmacy</span>
                  <strong className="text-dark d-block">{d.order?.pharmacy_name}</strong>
                  <span className="small text-muted">{d.order?.pharmacy_address}</span>
                </div>
                <div className="col-md-6">
                  <span className="text-muted extra-small font-weight-bold text-uppercase d-block">2. Customer Address</span>
                  <strong className="text-dark d-block">{d.order?.customer_name} ({d.order?.customer_phone})</strong>
                  <span className="small text-muted">{d.order?.delivery_address}</span>
                </div>
              </div>

              {/* Action Buttons (Section 25) */}
              <div className="d-flex gap-2 justify-content-end flex-wrap">
                {d.status === 'ASSIGNED' && (
                  <button className="btn btn-primary btn-sm rounded-pill px-4 fw-bold" onClick={() => handleStatusChange(d.id, 'ACCEPTED')}>
                    <i className="bi bi-check-circle me-1"></i> Accept Delivery
                  </button>
                )}
                {(d.status === 'ASSIGNED' || d.status === 'ACCEPTED') && (
                  <button className="btn btn-warning btn-sm text-dark rounded-pill px-4 fw-bold" onClick={() => handleStatusChange(d.id, 'PICKED_UP')}>
                    <i className="bi bi-box-seam me-1"></i> Mark Picked Up
                  </button>
                )}
                {d.status === 'PICKED_UP' && (
                  <button className="btn btn-info btn-sm text-white rounded-pill px-4 fw-bold" onClick={() => handleStatusChange(d.id, 'OUT_FOR_DELIVERY')}>
                    <i className="bi bi-truck me-1"></i> Mark Out for Delivery
                  </button>
                )}
                {d.status === 'OUT_FOR_DELIVERY' && (
                  <button className="btn btn-success btn-sm rounded-pill px-4 fw-bold" onClick={() => handleStatusChange(d.id, 'DELIVERED')}>
                    <i className="bi bi-house-heart me-1"></i> Mark Delivered
                  </button>
                )}
                {d.status === 'DELIVERED' && (
                  <span className="badge bg-success-subtle text-success p-2 rounded-pill fw-bold">
                    <i className="bi bi-check-all me-1"></i> Completed & Delivered
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="bi-truck" title="No Assigned Deliveries" description="New orders assigned to you will appear here." />
      )}
    </Layout>
  );
};

export default AssignedOrdersPage;
