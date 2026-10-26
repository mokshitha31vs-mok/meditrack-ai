import React from 'react';

const STEPS = [
  { key: 'PLACED', label: 'Placed', icon: 'bi-bag-check' },
  { key: 'ACCEPTED', label: 'Accepted', icon: 'bi-check-circle' },
  { key: 'PREPARING', label: 'Preparing', icon: 'bi-box-seam' },
  { key: 'READY FOR PICKUP', label: 'Ready', icon: 'bi-shop' },
  { key: 'ASSIGNED TO DELIVERY', label: 'Assigned', icon: 'bi-person-badge' },
  { key: 'OUT FOR DELIVERY', label: 'Out for Delivery', icon: 'bi-truck' },
  { key: 'DELIVERED', label: 'Delivered', icon: 'bi-house-heart' }
];

const OrderTimeline = ({ status = 'PLACED' }) => {
  if (status === 'REJECTED') {
    return (
      <div className="alert alert-danger rounded-4 text-center my-3 fw-bold">
        <i className="bi bi-x-circle-fill me-2 fs-5"></i> Order Rejected by Pharmacy
      </div>
    );
  }

  // Find index of current status
  const currentStepIndex = STEPS.findIndex(s => s.key === status);
  const progressPercent = currentStepIndex >= 0 ? (currentStepIndex / (STEPS.length - 1)) * 90 : 0;

  return (
    <div className="bg-white p-4 rounded-4 border shadow-sm my-3">
      <h6 className="fw-bold text-dark mb-4 text-center">Order Status Timeline</h6>
      <div className="timeline-container">
        <div className="timeline-line"></div>
        <div className="timeline-progress" style={{ width: `${progressPercent}%` }}></div>

        {STEPS.map((step, idx) => {
          const isCompleted = currentStepIndex >= idx;
          const isActive = currentStepIndex === idx;

          return (
            <div 
              key={step.key} 
              className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="timeline-icon">
                {isCompleted ? <i className="bi bi-check-lg"></i> : (idx + 1)}
              </div>
              <div className="timeline-label">{step.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
