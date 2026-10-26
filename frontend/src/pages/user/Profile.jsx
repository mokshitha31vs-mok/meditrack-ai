import React, { useState } from 'react';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';

const PatientProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateUserProfile(formData);
      if (res.success) {
        setToast({ message: 'Profile updated successfully!', type: 'success' });
      } else {
        setToast({ message: res.error, type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">User Profile & Delivery Preferences</h3>
        <p className="text-muted small">Update your personal account details and default delivery address.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Full Name</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Email Address</label>
                <input 
                  type="email" 
                  className="form-control rounded-3 bg-light" 
                  value={user?.email || ''} 
                  disabled 
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Phone Number</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Default Delivery Address</label>
                <textarea 
                  className="form-control rounded-3" 
                  rows="3" 
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })} 
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientProfile;
