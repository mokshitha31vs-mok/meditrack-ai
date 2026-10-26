import React from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const bgClasses = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-dark',
    info: 'bg-primary text-white'
  };

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
      <div className={`toast show align-items-center ${bgClasses[type] || 'bg-primary text-white'} border-0 shadow-lg`} role="alert" aria-live="assertive" aria-atomic="true">
        <div className="d-flex">
          <div className="toast-body font-weight-bold">
            {message}
          </div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={onClose} aria-label="Close"></button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
