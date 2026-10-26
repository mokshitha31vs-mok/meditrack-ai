import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center" style={{ maxWidth: '500px' }}>
        <div className="text-primary mb-3">
          <i className="bi bi-file-earmark-medical" style={{ fontSize: '4rem' }}></i>
        </div>
        <h2 className="fw-bold text-dark mb-2">404 - Page Not Found</h2>
        <p className="text-muted mb-4">
          The healthcare resource, dashboard page, or record you requested does not exist or may have been relocated.
        </p>
        <div>
          <Link to="/" className="btn btn-primary rounded-pill px-4 py-2">
            <i className="bi bi-house-door me-1"></i> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
