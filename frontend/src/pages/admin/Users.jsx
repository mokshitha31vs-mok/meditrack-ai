import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import Toast from '../../components/Toast';
import { adminAPI } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load user accounts', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setToast({ message: `User #${userId} role changed to ${newRole}`, type: 'success' });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to update user role', type: 'error' });
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminAPI.updateUserStatus(userId, nextStatus);
      setToast({ message: `User #${userId} marked as ${nextStatus}`, type: 'success' });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to update account status', type: 'error' });
    }
  };

  const handleDoctorVerify = async (userId, currentVerified) => {
    try {
      await adminAPI.verifyDoctor(userId, !currentVerified);
      setToast({ message: `Doctor credentials ${!currentVerified ? 'verified' : 'unverified'} successfully`, type: 'success' });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to update doctor verification', type: 'error' });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <Layout><Loading text="Loading user accounts..." /></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">User Account Management</h3>
          <p className="text-muted small mb-0">Inspect user accounts, manage 5 system roles, and control account active status.</p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search by name, email, phone..."
            style={{ width: '220px' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select form-select-sm"
            style={{ width: '130px' }}
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="delivery">Delivery</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name / Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Professional Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No user accounts match current search or filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{u.name}</div>
                      <div className="small text-muted">{u.email} | {u.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        u.role === 'admin' ? 'bg-dark' :
                        u.role === 'doctor' ? 'bg-info text-dark' :
                        u.role === 'pharmacy' ? 'bg-success' :
                        u.role === 'delivery' ? 'bg-warning text-dark' :
                        'bg-primary'
                      } rounded-pill px-3 text-capitalize`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'} rounded-pill px-2`}>
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      {u.role === 'doctor' ? (
                        u.doctor_profile?.is_verified ? (
                          <button
                            className="btn btn-outline-success btn-sm rounded-pill py-0 px-2"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => handleDoctorVerify(u.id, true)}
                            title="Click to revoke verification"
                          >
                            <i className="bi bi-patch-check-fill me-1"></i> Verified
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-warning btn-sm rounded-pill py-0 px-2"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => handleDoctorVerify(u.id, false)}
                            title="Click to verify credentials"
                          >
                            <i className="bi bi-clock me-1"></i> Unverified (Click to Verify)
                          </button>
                        )
                      ) : u.role === 'pharmacy' ? (
                        <span className="small text-muted">Managed in Pharmacy Network</span>
                      ) : (
                        <span className="small text-muted">N/A</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2 align-items-center">
                        <select
                          className="form-select form-select-sm rounded-pill text-capitalize"
                          style={{ width: '120px' }}
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="patient">patient</option>
                          <option value="doctor">doctor</option>
                          <option value="pharmacy">pharmacy</option>
                          <option value="delivery">delivery</option>
                          <option value="admin">admin</option>
                        </select>
                        <button
                          className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'} rounded-pill px-2 py-1`}
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => handleStatusToggle(u.id, u.status || 'ACTIVE')}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </div>
                    </td>
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

export default AdminUsers;
