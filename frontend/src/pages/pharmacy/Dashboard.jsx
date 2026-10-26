import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import { dashboardAPI } from '../../services/api';

const PharmacyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacyDashboard = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getPharmacy();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacyDashboard();
  }, []);

  if (loading) return <Layout><Loading text="Loading pharmacy management console..." /></Layout>;

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-extrabold text-dark mb-1">Pharmacy Manager Dashboard</h3>
          <p className="text-muted small">Store: <strong className="text-primary">{data?.pharmacy?.name || 'Licensed Partner Pharmacy'}</strong></p>
        </div>
        <Link to="/pharmacy/inventory/add" className="btn btn-primary rounded-pill px-4 shadow-sm">
          <i className="bi bi-plus-circle me-1"></i> Add Stock / Price
        </Link>
      </div>

      {/* Six Metric Cards (Section 3 Requirement) */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-4 col-lg-2">
          <div className="stat-card p-3">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Total Medicines</div>
              <div className="fs-4 fw-bold text-dark">{data?.total_medicines || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-primary" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-boxes fs-5"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-4 col-lg-2">
          <div className="stat-card p-3">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Low Stock</div>
              <div className="fs-4 fw-bold text-danger">{data?.low_stock_medicines || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-danger" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-exclamation-triangle fs-5"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-4 col-lg-2">
          <div className="stat-card p-3">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Incoming</div>
              <div className="fs-4 fw-bold text-warning">{data?.incoming_orders || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-warning" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-inbox fs-5"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-4 col-lg-2">
          <div className="stat-card p-3">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Preparing</div>
              <div className="fs-4 fw-bold text-info">{data?.preparing_orders || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-primary" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-gear-wide-connected fs-5"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-4 col-lg-2">
          <div className="stat-card p-3">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Ready Orders</div>
              <div className="fs-4 fw-bold text-primary">{data?.ready_orders || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-secondary" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-check-circle fs-5"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-4 col-lg-2">
          <div className="stat-card p-3">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Completed</div>
              <div className="fs-4 fw-bold text-success">{data?.completed_orders || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-success" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-bag-check fs-5"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">Incoming Orders for Fulfillment</h5>
          <Link to="/pharmacy/orders" className="btn btn-outline-primary btn-sm rounded-pill">Manage All Orders</Link>
        </div>

        {data?.recent_orders && data.recent_orders.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Placed At</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.map(o => (
                  <tr key={o.id}>
                    <td><strong className="text-primary">#{o.id}</strong></td>
                    <td>{o.customer_name}</td>
                    <td className="fw-bold text-success">₹{o.total_amount}</td>
                    <td><span className="badge bg-primary rounded-pill px-3">{o.status}</span></td>
                    <td className="text-muted small">{o.created_at ? new Date(o.created_at).toLocaleTimeString() : 'Recent'}</td>
                    <td className="text-end">
                      <Link to={`/pharmacy/orders/${o.id}`} className="btn btn-sm btn-light border rounded-pill">
                        Process Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted text-center py-4 mb-0">No active incoming orders right now.</p>
        )}
      </div>
    </Layout>
  );
};

export default PharmacyDashboard;
