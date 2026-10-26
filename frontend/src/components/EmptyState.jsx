import React from 'react';

const EmptyState = ({ icon = "bi-inbox", title = "No data found", description, actionButton }) => {
  return (
    <div className="text-center py-5 px-3 bg-white rounded-4 border shadow-sm my-3">
      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
        <i className={`bi ${icon} text-secondary fs-2`}></i>
      </div>
      <h5 className="fw-bold text-dark">{title}</h5>
      {description && <p className="text-muted mx-auto" style={{ maxWidth: '420px', fontSize: '0.9rem' }}>{description}</p>}
      {actionButton && <div className="mt-3">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
