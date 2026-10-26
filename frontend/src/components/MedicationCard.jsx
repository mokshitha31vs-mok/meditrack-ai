import React from 'react';

const MedicationCard = ({ medication, onAction, onDelete, onEdit }) => {
  if (!medication) return null;

  return (
    <div className="med-card position-relative">
      <div className="d-flex align-items-start justify-content-between mb-2">
        <div>
          <h5 className="fw-bold text-dark mb-1">{medication.medicine_name}</h5>
          <div className="text-muted small">
            <span className="me-2"><i className="bi bi-capsule me-1 text-primary"></i>{medication.dosage}</span>
            <span><i className="bi bi-clock-history me-1 text-secondary"></i>{medication.frequency}</span>
          </div>
        </div>
        {medication.running_low && (
          <span className="running-low-badge ms-2">
            <i className="bi bi-exclamation-triangle-fill"></i> Running Low ({medication.remaining_quantity} left)
          </span>
        )}
      </div>

      <div className="bg-light p-2 rounded-3 mb-3 d-flex justify-content-between align-items-center small">
        <div>
          <span className="text-muted me-1">Timing:</span>
          <strong className="text-dark">{medication.timing}</strong>
        </div>
        <div>
          <span className="text-muted me-1">Remaining Supply:</span>
          <span className={`fw-bold ${medication.running_low ? 'text-danger' : 'text-success'}`}>
            {medication.remaining_quantity} / {medication.quantity} units (~{medication.days_remaining} days)
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex gap-2">
          {onAction && (
            <>
              <button 
                className="btn btn-sm btn-success rounded-pill px-3 fw-semibold"
                onClick={() => onAction(medication.id, 'taken')}
              >
                <i className="bi bi-check-lg me-1"></i> Taken
              </button>
              <button 
                className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold"
                onClick={() => onAction(medication.id, 'missed')}
              >
                <i className="bi bi-x-lg me-1"></i> Missed
              </button>
              <button 
                className="btn btn-sm btn-outline-warning text-dark rounded-pill px-3 fw-semibold"
                onClick={() => onAction(medication.id, 'snooze')}
              >
                <i className="bi bi-alarm me-1"></i> Snooze
              </button>
            </>
          )}
        </div>

        <div className="d-flex gap-2">
          {onEdit && (
            <button className="btn btn-sm btn-light border rounded-circle" onClick={() => onEdit(medication)} title="Edit">
              <i className="bi bi-pencil"></i>
            </button>
          )}
          {onDelete && (
            <button className="btn btn-sm btn-light border text-danger rounded-circle" onClick={() => onDelete(medication.id)} title="Delete">
              <i className="bi bi-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicationCard;
