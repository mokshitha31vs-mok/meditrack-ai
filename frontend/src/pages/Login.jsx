import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      const role = res.user.role;
      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (role === 'pharmacy') {
        navigate('/pharmacy/dashboard');
      } else if (role === 'delivery') {
        navigate('/delivery/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      setError(res.error || 'Authentication failed. Please verify your credentials.');
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
        <Link to="/" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i className="bi bi-arrow-left me-1"></i> Back to Home
        </Link>
      </div>

      <div className="d-flex align-items-center justify-content-center my-4">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white" style={{ maxWidth: '440px', width: '100%' }}>
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="bg-primary-subtle text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px' }}>
                <i className="bi bi-shield-lock-fill fs-3"></i>
              </div>
              <h4 className="fw-bold text-dark mb-1">Account Sign In</h4>
              <p className="text-muted small mb-0">Secure portal for Patients, Doctors, Pharmacists & Logistics</p>
            </div>

            {error && (
              <div className="alert alert-danger rounded-3 small py-2 px-3 mb-3 d-flex align-items-start gap-2">
                <i className="bi bi-exclamation-circle-fill text-danger mt-0.5"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark small mb-1">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 py-2"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark small mb-1">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-key"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0 py-2"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 rounded-pill py-2.5 fw-semibold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </span>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <span className="text-muted small">Need an account? </span>
              <Link to="/register" className="fw-semibold text-primary text-decoration-none small">
                Register here
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

export default Login;
