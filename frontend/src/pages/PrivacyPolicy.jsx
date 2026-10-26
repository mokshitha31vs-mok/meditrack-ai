import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
            <h1 className="fw-bold text-dark mb-2">Privacy Policy</h1>
            <p className="text-muted small mb-0">Effective Date: October 23, 2026 | Platform Version: 2.0</p>
          </div>

          <section className="mb-4">
            <h4 className="fw-bold text-dark">1. Overview and Scope</h4>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              MediTrack AI operates a digital healthcare coordination platform connecting patients, licensed medical
              practitioners, partner pharmacies, and delivery personnel. This Privacy Policy outlines our procedures
              regarding the collection, processing, storage, and protection of personal health data and account details.
            </p>
          </section>

          <section className="mb-4">
            <h4 className="fw-bold text-dark">2. Information We Collect</h4>
            <ul className="text-secondary" style={{ lineHeight: '1.8' }}>
              <li><strong>Account Credentials:</strong> Full name, verified email address, contact telephone, and cryptographic password hashes. Plaintext passwords are never retained.</li>
              <li><strong>Prescription Documents:</strong> Original prescription photos or scans uploaded by patients or issued by authorized doctors.</li>
              <li><strong>Extracted Medical Data:</strong> Raw OCR optical outputs, medicine candidate lists, parsed strengths, doses, routes, frequencies, and durations.</li>
              <li><strong>Clinical Schedules and Reminders:</strong> Medication intake schedules, daily dose statuses (taken, skipped, snoozed), and reminder configurations.</li>
              <li><strong>Order and Inventory Data:</strong> Pharmacy catalog entries, cart contents, order status history, and delivery address coordinates.</li>
              <li><strong>Audit Trail:</strong> Immutable security logs capturing user IDs, timestamps, actions, and IP addresses.</li>
            </ul>
          </section>

          <section className="mb-4">
            <h4 className="fw-bold text-dark">3. Prescription OCR and Processing Safeguards</h4>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              Uploaded prescription files are processed through optical character recognition pipelines. Raw OCR text
              is maintained separately from user-verified records to provide an evidence base. Machine extraction
              results are categorized as unconfirmed until explicitly confirmed by the patient or attending doctor.
              Prescription image references are restricted to authenticated accounts and are not exposed via open public URLs.
            </p>
          </section>

          <section className="mb-4">
            <h4 className="fw-bold text-dark">4. Role-Based Access Controls and Data Minimization</h4>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              We enforce strict server-side authorization boundaries across all five platform roles:
            </p>
            <ul className="text-secondary" style={{ lineHeight: '1.8' }}>
              <li><strong>Doctors:</strong> Only access medical records of patients who have granted explicit clinical consent. Doctors cannot access records of unrelated platform patients.</li>
              <li><strong>Pharmacies:</strong> Access only the medicine items, quantities, and delivery instructions necessary to fulfill confirmed orders. Pharmacies do not access patient clinical histories.</li>
              <li><strong>Delivery Personnel:</strong> Access only the pickup location, recipient delivery address, recipient contact phone, and package identifier needed for transit.</li>
              <li><strong>Administrators:</strong> Monitor system performance, verify professional credentials, and manage platform stability. Administrators do not alter medical determinations.</li>
            </ul>
          </section>

          <section className="mb-4">
            <h4 className="fw-bold text-dark">5. Data Retention and Account Control</h4>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              Users maintain the right to review their stored records, download their prescription history, or request
              account suspension and data removal. To request permanent deletion of prescription records or personal
              account data, contact our support team through the official support channel.
            </p>
          </section>

          <section className="mb-4">
            <h4 className="fw-bold text-dark">6. Updates to This Policy</h4>
            <p className="text-secondary" style={{ lineHeight: '1.7' }}>
              We may update this Privacy Policy to reflect technical enhancements or regulatory adjustments. Notice
              of material changes will be published directly within the platform portal.
            </p>
          </section>

          <div className="pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
            <Link to="/terms" className="text-primary small text-decoration-none">View Terms and Conditions</Link>
            <Link to="/" className="btn btn-primary rounded-pill px-4">Return to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
