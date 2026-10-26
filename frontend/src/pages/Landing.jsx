import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 px-4 sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary fs-4 d-flex align-items-center gap-2" to="/">
            <i className="bi bi-heart-pulse-fill"></i>
            <span>MediTrack <span className="text-secondary">AI</span></span>
          </Link>
          <div className="d-flex align-items-center gap-2">
            <Link to="/login" className="btn btn-outline-primary rounded-pill px-3 py-1.5 fw-semibold">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary rounded-pill px-4 py-1.5 fw-semibold shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-5 bg-white border-bottom">
        <div className="container py-4 text-center">
          <div className="d-inline-flex align-items-center gap-2 badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-semibold mb-3">
            <i className="bi bi-shield-check"></i> Connected Healthcare & Medicine Management Platform
          </div>
          <h1 className="display-5 fw-extrabold text-dark mb-3 mx-auto" style={{ maxWidth: '850px', letterSpacing: '-0.5px' }}>
            Smart Prescription OCR, Medication Schedules & Verified Pharmacy Delivery
          </h1>
          <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '720px', fontSize: '1.15rem' }}>
            MediTrack AI empowers patients to digitize medical prescriptions, track individual medication regimens, discover verified nearby pharmacies, and monitor secure door-step deliveries.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/register" className="btn btn-primary btn-lg rounded-pill px-4 py-2.5 fw-semibold shadow-sm">
              <i className="bi bi-person-plus me-2"></i> Register New Account
            </Link>
            <Link to="/login" className="btn btn-outline-secondary btn-lg rounded-pill px-4 py-2.5 fw-semibold">
              <i className="bi bi-box-arrow-in-right me-2"></i> Access Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* 5-Role Ecosystem Section */}
      <section className="py-5 container">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark">Five Unified Healthcare Roles</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
            Role-based dashboards and strict clinical authorization controls for every participant in the care journey.
          </p>
        </div>

        <div className="row g-4">
          {/* 1. Patient */}
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="bg-primary-subtle text-primary rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-person-heart fs-4"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Patients</h5>
              <p className="text-muted small mb-0">
                Upload prescriptions, review multi-medicine extraction, organize verified schedules, receive refill alerts, search pharmacies, and order medicines with delivery tracking.
              </p>
            </div>
          </div>

          {/* 2. Doctor */}
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="bg-info-subtle text-info-emphasis rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-stethoscope fs-4"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Doctors & Clinicians</h5>
              <p className="text-muted small mb-0">
                Review authorized patient histories, inspect OCR-extracted documents, verify treatment regimens, manage clinical consultations, and issue digital prescriptions.
              </p>
            </div>
          </div>

          {/* 3. Pharmacy */}
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="bg-success-subtle text-success rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-shop fs-4"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Licensed Pharmacies</h5>
              <p className="text-muted small mb-0">
                Manage medicine catalogue and live stock quantities, update pricing, accept and prepare incoming orders, and hand over parcels for delivery dispatch.
              </p>
            </div>
          </div>

          {/* 4. Delivery */}
          <div className="col-md-6 col-lg-6">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="bg-warning-subtle text-warning-emphasis rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-truck fs-4"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Delivery Personnel</h5>
              <p className="text-muted small mb-0">
                View assigned orders, confirm pharmacy pickups, advance order delivery stages (Picked Up, Out for Delivery, Delivered), and report field delivery updates.
              </p>
            </div>
          </div>

          {/* 5. Administrator */}
          <div className="col-md-12 col-lg-6">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="bg-secondary-subtle text-dark rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-shield-lock fs-4"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">System Administrators</h5>
              <p className="text-muted small mb-0">
                Oversee platform operations, manage user roles, verify professional credentials for doctors and pharmacies, monitor OCR processing health, and review security audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Safety & Verification Banner */}
      <section className="bg-white py-5 border-top border-bottom">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-3 py-1 mb-2 fw-semibold">
                Clinical Safety Standard
              </span>
              <h3 className="fw-bold text-dark mb-2">Prescription OCR Verification Workflow</h3>
              <p className="text-muted mb-0">
                Every extracted medication is processed independently into distinct records with individual strengths, dosages, routes, and instructions. The platform requires patient confirmation and doctor or pharmacist review before activating medication reminders.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/register" className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold">
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-light border-top py-4 text-muted small">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <span className="fw-semibold text-dark">MediTrack AI</span>
            <span className="ms-2">Connected Healthcare & Prescription Management</span>
          </div>
          <div className="d-flex gap-4">
            <Link to="/privacy-policy" className="text-muted text-decoration-none">Privacy Policy</Link>
            <Link to="/terms" className="text-muted text-decoration-none">Terms and Conditions</Link>
            <Link to="/login" className="text-muted text-decoration-none">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
