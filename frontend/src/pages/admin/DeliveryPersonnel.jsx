import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import { adminAPI } from '../../services/api';

const AdminDeliveryPersonnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getDeliveryPersonnel();
        setPersonnel(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPersonnel();
  }, []);

  if (loading) return <Layout><Loading text="Loading delivery personnel roster..." /></Layout>;

  return (
    <Layout>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Delivery Personnel Roster</h3>
        <p className="text-muted small">Registered couriers available for pharmacy order dispatch assignments.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Courier Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Base City</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {personnel.map(p => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td><strong className="text-dark">{p.name}</strong></td>
                  <td>{p.email}</td>
                  <td>{p.phone || 'N/A'}</td>
                  <td className="small text-muted">{p.address}</td>
                  <td><span className="badge bg-success-subtle text-success rounded-pill px-3">Active Courier</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDeliveryPersonnel;
