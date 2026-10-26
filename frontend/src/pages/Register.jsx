import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    // Doctor fields
    specialization: 'General Medicine',
    qualification: 'MBBS, MD',
    license_number: '',
    hospital_affiliation: 'City Healthcare Clinic',
    experience_years: 5,
    consultation_fee: 500,
    // Pharmacy fields
    pharmacy_name: '',
    opening_hours: '8:00 AM - 10:00 PM'
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please provide your name, email address, and a secure password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const payload = {
      ...formData,
      role: role
    };

    const res = await register(payload);
    if (res.success) {
      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (role === 'pharmacy') {
        navigate('/pharmacy/dashboard');
      } else if (role === 'delivery') {
        navigate('/delivery/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      setError(res.error || 'Registration failed. Please review your details.');
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column justify-content-between p-3">
      {/* Top Navbar */}
      <div className="container py-2 d-flex justify-content-between align-items-center">
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2 fw-bold text-primary fs-5">
          <i className="bi bi-heart-pulse-fill"></i>
          <span>MediTrack <span className="text-secondary">AI</span></span>
        </Link>
        <Link to="/login" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
          Sign In
        </Link>
      </div>

      <div className="d-flex align-items-center justify-content-center my-4">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white" style={{ maxWidth: '580px', width: '100%' }}>
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-4">
              <h4 className="fw-bold text-dark mb-1">Create Your Account</h4>
              <p className="text-muted small mb-0">Select your role in the MediTrack healthcare network</p>
            </div>

            {/* Role Selection Tabs */}
            <div className="d-flex p-1 bg-light rounded-pill mb-4 border">
              <button
                type="button"
                className={`btn btn-sm rounded-pill flex-fill py-2 fw-semibold ${role === 'patient' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                onClick={() => setRole('patient')}
              >
                <i className="bi bi-person me-1"></i> Patient
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill flex-fill py-2 fw-semibold ${role === 'doctor' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                onClick={() => setRole('doctor')}
              >
                <i className="bi bi-stethoscope me-1"></i> Doctor
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill flex-fill py-2 fw-semibold ${role === 'pharmacy' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                onClick={() => setRole('pharmacy')}
              >
                <i className="bi bi-shop me-1"></i> Pharmacy
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill flex-fill py-2 fw-semibold ${role === 'delivery' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                onClick={() => setRole('delivery')}
              >
                <i className="bi bi-truck me-1"></i> Delivery
              </button>
            </div>

            {error && (
              <div className="alert alert-danger rounded-3 small py-2 px-3 mb-3 d-flex align-items-start gap-2">
                <i className="bi bi-exclamation-circle-fill text-danger mt-0.5"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-3">
                {/* Standard Account Fields */}
                <div className="col-12">
                  <label className="form-label fw-semibold text-dark small mb-1">
                    {role === 'doctor' ? 'Doctor Full Name' : (role === 'pharmacy' ? 'Pharmacist / In-charge Name' : 'Full Name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control rounded-3 py-2"
                    placeholder={role === 'doctor' ? 'Dr. Aris Thorne' : 'Rahul Sharma'}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark small mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control rounded-3 py-2"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark small mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control rounded-3 py-2"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold text-dark small mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control rounded-3 py-2"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold text-dark small mb-1">
                    {role === 'pharmacy' ? 'Pharmacy Physical Address' : 'Address / City'}
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="form-control rounded-3 py-2"
                    placeholder="e.g. No. 42, Mount Road, Chennai"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                {/* Role-Specific Fields for Doctor */}
                {role === 'doctor' && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small mb-1">Medical License Number *</label>
                      <input
                        type="text"
                        name="license_number"
                        className="form-control rounded-3 py-2"
                        placeholder="e.g. MCI-48291"
                        value={formData.license_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small mb-1">Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        className="form-control rounded-3 py-2"
                        placeholder="e.g. Cardiology, Internal Medicine"
                        value={formData.specialization}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small mb-1">Qualification</label>
                      <input
                        type="text"
                        name="qualification"
                        className="form-control rounded-3 py-2"
                        placeholder="e.g. MBBS, MD"
                        value={formData.qualification}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small mb-1">Clinic / Hospital Affiliation</label>
                      <input
                        type="text"
                        name="hospital_affiliation"
                        className="form-control rounded-3 py-2"
                        placeholder="e.g. City Healthcare Clinic"
                        value={formData.hospital_affiliation}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                {/* Role-Specific Fields for Pharmacy */}
                {role === 'pharmacy' && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small mb-1">Pharmacy Store Name *</label>
                      <input
                        type="text"
                        name="pharmacy_name"
                        className="form-control rounded-3 py-2"
                        placeholder="e.g. Apollo Pharmacy"
                        value={formData.pharmacy_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small mb-1">Drug License Number *</label>
                      <input
                        type="text"
                        name="license_number"
                        className="form-control rounded-3 py-2"
                        placeholder="e.g. DL-TN-00101"
                        value={formData.license_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  className="btn btn-primary w-100 rounded-pill py-2.5 fw-semibold shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registering Account...
                    </span>
                  ) : (
                    `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <span className="text-muted small">Already registered? </span>
              <Link to="/login" className="fw-semibold text-primary text-decoration-none small">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-muted small py-2">
        <Link to="/privacy-policy" className="text-muted text-decoration-none me-3">Privacy Policy</Link>
        <span>•</span>
        <Link to="/terms" className="text-muted text-decoration-none ms-3">Terms & Conditions</Link>
      </div>
    </div>
  );
};

export default Register;
