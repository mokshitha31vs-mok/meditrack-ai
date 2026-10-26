import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import { dashboardAPI } from '../../services/api';

const DeliveryDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveryDash = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getDelivery();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveryDash();
  }, []);

  if (loading) return <Layout><Loading text="Loading delivery dashboard..." /></Layout>;

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-extrabold text-dark mb-1">Delivery Agent Console</h3>
          <p className="text-muted small">Manage assigned doorstep deliveries, store pickups & status confirmations.</p>
        </div>
        <Link to="/delivery/orders" className="btn btn-primary rounded-pill px-4 shadow-sm">
          <i className="bi bi-list-check me-1"></i> View Assigned Deliveries
        </Link>
      </div>

      {/* Metric Cards (Section 3 Requirement) */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Assigned</div>
              <div className="fs-3 fw-bold text-dark">{data?.assigned_deliveries || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-primary">
              <i className="bi bi-clipboard-check"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Pending Pickups</div>
              <div className="fs-3 fw-bold text-warning">{data?.pending_deliveries || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-warning">
              <i className="bi bi-shop"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Active On-Route</div>
              <div className="fs-3 fw-bold text-info">{data?.active_deliveries || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-secondary">
              <i className="bi bi-truck"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Completed</div>
              <div className="fs-3 fw-bold text-success">{data?.completed_deliveries || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-success">
              <i className="bi bi-house-heart"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deliveries List */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h5 className="fw-bold text-dark mb-3">Recent Delivery Assignments</h5>
        {data?.recent_deliveries && data.recent_deliveries.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order #</th>
                  <th>Pickup Pharmacy</th>
                  <th>Delivery Address</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_deliveries.map(d => (
                  <tr key={d.id}>
                    <td><strong className="text-primary">#{d.order_id}</strong></td>
                    <td>{d.order?.pharmacy_name}</td>
                    <td className="small text-muted">{d.order?.delivery_address}</td>
                    <td><span className="badge bg-primary rounded-pill px-3">{d.status}</span></td>
                    <td className="text-end">
                      <Link to={`/delivery/orders`} className="btn btn-sm btn-light border rounded-pill">
                        Update Status
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted text-center py-4 mb-0">No active delivery assignments found.</p>
        )}
      </div>
    </Layout>
  );
};

export default DeliveryDashboard;
