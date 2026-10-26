import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import { adminAPI } from '../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAuditLogs();
      setLogs(res.data || []);
    } catch (err) {
      setError('Unable to load security audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.ip_address?.includes(searchTerm);
    const matchesAction = actionFilter === 'all' || log.action?.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  if (loading) return <Layout><Loading text="Loading immutable audit logs..." /></Layout>;

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">Security & Clinical Audit Trail</h3>
          <p className="text-muted small mb-0">Immutable records of authentication, prescription changes, orders, and role actions.</p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search action, details, IP..."
            style={{ width: '220px' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select form-select-sm"
            style={{ width: '160px' }}
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="AUTH">Authentication</option>
            <option value="OCR">OCR & Parsing</option>
            <option value="PRESCRIPTION">Prescriptions</option>
            <option value="ORDER">Orders & Delivery</option>
            <option value="DOCTOR">Doctor Actions</option>
          </select>
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchLogs}>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Timestamp</th>
                <th>User ID</th>
                <th>Action</th>
                <th>Target Entity</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No audit records match the current criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(item => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td className="small text-muted">{item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}</td>
                    <td><span className="badge bg-light text-dark border">User #{item.user_id || 'System'}</span></td>
                    <td>
                      <span className={`badge ${
                        item.action?.includes('VERIF') ? 'bg-success' :
                        item.action?.includes('AUTH') ? 'bg-primary' :
                        item.action?.includes('ERROR') ? 'bg-danger' :
                        'bg-secondary'
                      } text-uppercase font-monospace`} style={{ fontSize: '0.7rem' }}>
                        {item.action}
                      </span>
                    </td>
                    <td className="small font-monospace text-secondary">
                      {item.entity_type} {item.entity_id ? `(#${item.entity_id})` : ''}
                    </td>
                    <td className="small text-dark" style={{ maxWidth: '300px' }}>
                      {item.details}
                    </td>
                    <td className="extra-small text-muted font-monospace">{item.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AuditLogs;
