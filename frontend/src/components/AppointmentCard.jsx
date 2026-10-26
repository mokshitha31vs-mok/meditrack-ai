import React from 'react';

const AppointmentCard = ({ appointment, onDelete, onEdit }) => {
  if (!appointment) return null;

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
      <div className="card-body p-3">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary-subtle text-primary rounded-3 p-3 d-flex align-items-center justify-content-center">
              <i className="bi bi-calendar-event fs-3"></i>
            </div>
            <div>
              <h6 className="fw-bold text-dark mb-1">{appointment.doctor_name}</h6>
              <div className="text-muted small">
                <i className="bi bi-hospital me-1 text-primary"></i>{appointment.hospital_name}
              </div>
            </div>
          </div>
          {appointment.reminder_enabled && (
            <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2 py-1 small">
              <i className="bi bi-bell-fill me-1"></i> Reminder Active
            </span>
          )}
        </div>

        <div className="bg-light p-2.5 rounded-3 d-flex justify-content-between align-items-center small my-2">
          <div>
            <i className="bi bi-calendar3 text-secondary me-1"></i>
            <strong>{appointment.appointment_date}</strong>
          </div>
          <div>
            <i className="bi bi-clock text-secondary me-1"></i>
            <strong>{appointment.appointment_time}</strong>
          </div>
        </div>

        {appointment.notes && (
          <p className="text-muted small mb-2 fst-italic">"{appointment.notes}"</p>
        )}

        <div className="d-flex justify-content-end gap-2 mt-2">
          {onEdit && (
            <button className="btn btn-sm btn-light border rounded-pill px-3" onClick={() => onEdit(appointment)}>
              <i className="bi bi-pencil me-1"></i> Edit
            </button>
          )}
          {onDelete && (
            <button className="btn btn-sm btn-light border text-danger rounded-pill px-3" onClick={() => onDelete(appointment.id)}>
              <i className="bi bi-trash me-1"></i> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
