import React from 'react';

const Loading = ({ text = "Loading data..." }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-3">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted mt-3 fw-medium" style={{ fontSize: '0.95rem' }}>{text}</p>
    </div>
  );
};

export default Loading;
