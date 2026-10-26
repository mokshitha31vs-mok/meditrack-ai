import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { doctorAPI } from '../../services/api';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await doctorAPI.getPatients();
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to load authorized patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  return (
    <Layout>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Authorized Patients</h3>
          <p className="text-muted small mb-0">Patients who have granted clinical consultation access to your account</p>
        </div>

        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control rounded-pill px-3 py-1.5"
            placeholder="Search by name, email, phone..."
            style={{ maxWidth: '280px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        {loading ? (
          <Loading message="Loading patient list..." />
        ) : filtered.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small">
                <tr>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Registered Address</th>
                  <th>Clinical Access</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="fw-semibold text-dark">{p.name}</div>
                      <span className="text-muted extra-small">Patient #{p.id}</span>
                    </td>
                    <td className="small text-muted">{p.email}</td>
                    <td className="small text-muted">{p.phone || 'N/A'}</td>
                    <td className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                      {p.address || 'Chennai, Tamil Nadu'}
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success">
                        <i className="bi bi-shield-check me-1"></i> Active Consent
                      </span>
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/doctor/patients/${p.id}`}
                        className="btn btn-primary btn-sm rounded-pill px-3 py-1"
                      >
                        <i className="bi bi-folder2-open me-1"></i> View Record
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="bi-people"
            title="No patients found"
            description={searchTerm ? "No patient matches your search term." : "No patients have granted access yet."}
          />
        )}
      </div>
    </Layout>
  );
};

export default DoctorPatients;
