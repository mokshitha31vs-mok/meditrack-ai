import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import { adminAPI } from '../../services/api';

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
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
    fetchReports();
  }, []);

  if (loading) return <Layout><Loading text="Generating system reports..." /></Layout>;

  return (
    <Layout>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">System Reports & Statistics</h3>
        <p className="text-muted small">Aggregated metrics, user activity & transaction performance report.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-people text-primary me-2"></i>User & Role Distribution</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Total Registered Users <span className="badge bg-primary rounded-pill fs-6">{reports?.total_users}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Patient Accounts <span className="badge bg-secondary rounded-pill fs-6">{reports?.total_patients}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Partner Pharmacies <span className="badge bg-success rounded-pill fs-6">{reports?.total_pharmacies}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Prescriptions Processed <span className="badge bg-info rounded-pill fs-6">{reports?.total_prescriptions}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-cart-check text-success me-2"></i>Order & Financial Summary</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Total Orders Placed <span className="badge bg-dark rounded-pill fs-6">{reports?.total_orders}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Pending Store Orders <span className="badge bg-warning text-dark rounded-pill fs-6">{reports?.pending_orders}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Active Deliveries on Route <span className="badge bg-info rounded-pill fs-6">{reports?.active_deliveries}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Completed Deliveries <span className="badge bg-success rounded-pill fs-6">{reports?.completed_orders}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center fw-bold bg-light">
                Total Fulfilled Revenue <span className="fs-5 text-success">₹{reports?.total_revenue}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminReports;
