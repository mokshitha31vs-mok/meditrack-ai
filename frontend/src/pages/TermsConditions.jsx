import React from 'react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <Link to="/" className="text-decoration-none text-primary fw-bold fs-4 d-flex align-items-center gap-2">
            <i className="bi bi-heart-pulse-fill"></i>
            <span>MediTrack AI</span>
          </Link>
          <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            Sign In
          </Link>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          <div className="border-bottom pb-3 mb-4">
            <h1 className="fw-bold text-dark mb-2">Terms and Conditions of Use</h1>
            <p className="text-muted small mb-0">Effective Date: October 23, 2026 | Platform Version: 2.0</p>
          </div>

          <div className="alert alert-warning border-0 p-3 mb-4" role="alert">
            <h5 className="alert-heading fw-bold mb-1"><i className="bi bi-exclamation-triangle-fill me-2"></i>Critical Clinical Disclaimer</h5>
            <p className="mb-0 small">
              MediTrack AI provides automated prescription text extraction as an assistive coordination tool.
              It does not practice medicine, prescribe drugs, or substitute for the clinical judgment of licensed
              physicians and pharmacists. Always verify medication details with qualified healthcare professionals.
            </p>
          </div>

          <section className="mb-4">
            <h4 className="fw-bold text-dark">1. Acceptance of Terms</h4>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              By registering an account, uploading documents, or interacting with MediTrack AI, you agree to comply
              with these Terms and Conditions. If you do not agree with any provision, discontinue use of the service immediately.
            </p>
          </section>

          <section className="mb-4">
            <h4 className="fw-bold text-dark">2. Mandatory Manual Verification of OCR Results</h4>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              Prescription images vary in handwriting clarity, print contrast, paper folds, and optical quality.
              Optical character recognition may misidentify characters, dosages, frequencies, or medicine names.
              Users are strictly required to review, verify, and correct all extracted medication records prior to
              confirming their medication schedule or ordering pharmaceuticals. Unconfirmed extraction data must not
              be used as active medical instructions.
            </p>
          </section>

          <section className="mb-4">
            <h4 className="fw-bold text-dark">3. User Roles and Account Responsibilities</h4>
            <ul className="text-secondary" style={{ lineHeight: '1.8' }}>
              <li><strong>Patients:</strong> Responsible for uploading valid, authentic prescriptions issued by licensed practitioners and ensuring that contact details are accurate.</li>
              <li><strong>Doctors:</strong> Must maintain active medical licenses in their jurisdiction and ensure all digital prescription entries comply with medical standards.</li>
              <li><strong>Pharmacies:</strong> Responsible for accurate stock counts, valid batch management, compliance with drug distribution laws, and pricing transparency.</li>
              <li><strong>Delivery Personnel:</strong> Responsible for prompt, secure transportation of sealed medical packages without tampering or unapproved delays.</li>
            </ul>
          </section>

          <section className="mb-4">
            <h4 className="fw-bold text-dark">4. Orders, Stock Validation, and Delivery States</h4>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              Placing an order checks live pharmacy inventory records. If an item becomes unavailable between cart creation
              and final checkout, the system rejects the transaction with an explicit error. Orders progress through validated
              states: PLACED, ACCEPTED, PREPARING, READY FOR PICKUP, ASSIGNED TO DELIVERY, OUT FOR DELIVERY, and DELIVERED.
              Unauthorized status transitions are blocked by backend integrity checks.
            </p>
          </section>

          <section className="mb-4">
            <h4 className="fw-bold text-dark">5. Limitation of Liability</h4>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              To the maximum extent permitted by applicable law, MediTrack AI and its operators shall not be liable for
              adverse health reactions, incorrect dosages consumed due to unverified user input, courier delivery delays,
              or external pharmacy inventory inaccuracies. For medical emergencies, users must dial their local emergency
              services or report to an emergency healthcare facility immediately.
            </p>
          </section>

          <section className="mb-4">
            <h4 className="fw-bold text-dark">6. Account Suspension and Termination</h4>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              Platform administrators reserve the authority to suspend or terminate accounts involved in fraudulent
              prescription uploads, unauthorized role escalation attempts, harassment, or commercial drug diversion.
            </p>
          </section>

          <div className="pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
            <Link to="/privacy-policy" className="text-primary small text-decoration-none">View Privacy Policy</Link>
            <Link to="/" className="btn btn-primary rounded-pill px-4">Return to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
