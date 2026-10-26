import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { doctorAPI } from '../../services/api';

const DoctorProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    qualification: '',
    license_number: '',
    hospital_affiliation: '',
    experience_years: 0,
    consultation_fee: 0,
    is_verified: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await doctorAPI.getProfile();
      const u = res.data.user || {};
      const p = res.data.doctor_profile || {};
      setFormData({
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        address: u.address || '',
        specialization: p.specialization || '',
        qualification: p.qualification || '',
        license_number: p.license_number || '',
        hospital_affiliation: p.hospital_affiliation || '',
        experience_years: p.experience_years || 0,
        consultation_fee: p.consultation_fee || 0,
        is_verified: !!p.is_verified
      });
    } catch (err) {
      setError('Failed to fetch doctor credentials and profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      setSaving(true);
      await doctorAPI.updateProfile(formData);
      setMessage('Doctor profile and credentials updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="layout-dashboard">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="content-area">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="mb-1 text-dark fw-bold">Doctor Profile & Clinical Credentials</h2>
              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                Manage your medical licensure, hospital affiliation, and consultation practice details.
              </p>
            </div>
            {formData.is_verified ? (
              <span className="badge bg-success py-2 px-3 fs-6">
                <i className="bi bi-patch-check-fill me-1"></i> Verified Practitioner
              </span>
            ) : (
              <span className="badge bg-warning text-dark py-2 px-3 fs-6">
                <i className="bi bi-clock-history me-1"></i> Verification Pending
              </span>
            )}
          </div>

          {message && (
            <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
              <i className="bi bi-check-circle-fill"></i>
              <div>{message}</div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <div>{error}</div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="text-muted mt-2">Loading profile information...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold text-dark mb-3">Professional Credentials</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">Email Address (Account ID)</label>
                      <input
                        type="email"
                        className="form-control bg-light"
                        value={formData.email}
                        disabled
                      />
                      <small className="text-muted">Managed via account security</small>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-secondary">Medical License Number</label>
                      <input
                        type="text"
                        name="license_number"
                        className="form-control"
                        value={formData.license_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-secondary">Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        className="form-control"
                        placeholder="e.g. Cardiology, Internal Medicine"
                        value={formData.specialization}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-secondary">Academic Qualifications</label>
                      <input
                        type="text"
                        name="qualification"
                        className="form-control"
                        placeholder="e.g. MBBS, MD, FRCP"
                        value={formData.qualification}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">Primary Hospital / Clinic Affiliation</label>
                      <input
                        type="text"
                        name="hospital_affiliation"
                        className="form-control"
                        value={formData.hospital_affiliation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold text-secondary">Years of Experience</label>
                      <input
                        type="number"
                        name="experience_years"
                        className="form-control"
                        value={formData.experience_years}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold text-secondary">Consultation Fee (INR)</label>
                      <input
                        type="number"
                        name="consultation_fee"
                        className="form-control"
                        value={formData.consultation_fee}
                        onChange={handleChange}
                        min="0"
                        step="50"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">Contact Phone</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">Clinic Address</label>
                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary px-4 py-2" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save2 me-2"></i> Save Profile Details
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorProfile;
