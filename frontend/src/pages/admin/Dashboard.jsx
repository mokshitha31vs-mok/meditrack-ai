import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getReports();
        setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <Layout><Loading text="Loading administrator metrics..." /></Layout>;

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-extrabold text-dark mb-1">Platform Administrator Dashboard</h3>
          <p className="text-muted small">System-wide monitoring, user management, and platform financial metrics.</p>
        </div>
        <Link to="/admin/reports" className="btn btn-primary rounded-pill px-4 shadow-sm">
          <i className="bi bi-bar-chart-line me-1"></i> View System Reports
        </Link>
      </div>

      {/* Admin Statistics Cards (Section 3 Requirement) */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Total Users</div>
              <div className="fs-3 fw-bold text-dark">{reports?.total_users || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-primary">
              <i className="bi bi-people"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Total Pharmacies</div>
              <div className="fs-3 fw-bold text-secondary">{reports?.total_pharmacies || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-secondary">
              <i className="bi bi-buildings"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Total Medicines</div>
              <div className="fs-3 fw-bold text-dark">{reports?.total_medicines || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-warning">
              <i className="bi bi-capsule"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Total Orders</div>
              <div className="fs-3 fw-bold text-dark">{reports?.total_orders || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-success">
              <i className="bi bi-bag"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Pending Orders</div>
              <div className="fs-3 fw-bold text-warning">{reports?.pending_orders || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-warning">
              <i className="bi bi-clock-history"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Active Deliveries</div>
              <div className="fs-3 fw-bold text-info">{reports?.active_deliveries || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-primary">
              <i className="bi bi-truck"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Completed Orders</div>
              <div className="fs-3 fw-bold text-success">{reports?.completed_orders || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-success">
              <i className="bi bi-check-circle"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Platform Revenue</div>
              <div className="fs-3 fw-bold text-success">₹{reports?.total_revenue || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-success">
              <i className="bi bi-currency-rupee"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <Link to="/admin/users" className="card border-0 shadow-sm rounded-4 p-4 text-decoration-none text-dark h-100 bg-white hover-shadow">
            <h5 className="fw-bold mb-2"><i className="bi bi-people text-primary me-2"></i>Manage Users</h5>
            <p className="text-muted small mb-0">View registered accounts, verify doctors, and manage 5 system roles.</p>
          </Link>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link to="/admin/pharmacies" className="card border-0 shadow-sm rounded-4 p-4 text-decoration-none text-dark h-100 bg-white hover-shadow">
            <h5 className="fw-bold mb-2"><i className="bi bi-buildings text-secondary me-2"></i>Pharmacies</h5>
            <p className="text-muted small mb-0">Register partner stores, verify credentials, and manage GPS coordinates.</p>
          </Link>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link to="/admin/ocr-health" className="card border-0 shadow-sm rounded-4 p-4 text-decoration-none text-dark h-100 bg-white hover-shadow">
            <h5 className="fw-bold mb-2"><i className="bi bi-cpu text-info me-2"></i>OCR Health Monitor</h5>
            <p className="text-muted small mb-0">Inspect EasyOCR PyTorch engine status, verification rates, and extraction confidence.</p>
          </Link>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link to="/admin/audit-logs" className="card border-0 shadow-sm rounded-4 p-4 text-decoration-none text-dark h-100 bg-white hover-shadow">
            <h5 className="fw-bold mb-2"><i className="bi bi-clock-history text-danger me-2"></i>Security Audit Trail</h5>
            <p className="text-muted small mb-0">Live audit log of logins, prescription verifications, orders, and administrative actions.</p>
          </Link>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link to="/admin/medicines" className="card border-0 shadow-sm rounded-4 p-4 text-decoration-none text-dark h-100 bg-white hover-shadow">
            <h5 className="fw-bold mb-2"><i className="bi bi-capsule text-warning me-2"></i>Medicine Catalog</h5>
            <p className="text-muted small mb-0">Add global pharmaceutical drug names & generic formulas.</p>
          </Link>
        </div>
        <div className="col-md-6 col-lg-4">
          <Link to="/admin/orders" className="card border-0 shadow-sm rounded-4 p-4 text-decoration-none text-dark h-100 bg-white hover-shadow">
            <h5 className="fw-bold mb-2"><i className="bi bi-bag text-success me-2"></i>Orders & Delivery</h5>
            <p className="text-muted small mb-0">Monitor platform transactions & assign delivery personnel.</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
