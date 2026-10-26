import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { doctorAPI } from '../../services/api';

const PatientDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientRecord();
  }, [id]);

  const fetchPatientRecord = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await doctorAPI.getPatientClinicalRecord(id);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load patient clinical records.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading message="Fetching patient clinical files..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="alert alert-danger rounded-4 p-4 text-center">
          <i className="bi bi-shield-lock-fill fs-2 d-block mb-2 text-danger"></i>
          <h5>Access Restricted</h5>
          <p className="mb-3 small">{error}</p>
          <Link to="/doctor/patients" className="btn btn-outline-danger btn-sm rounded-pill px-4">
            Back to Authorized Patients
          </Link>
        </div>
      </Layout>
    );
  }

  const { patient, prescriptions, medication_schedules } = data || {};

  return (
    <Layout>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to="/doctor/patients" className="btn btn-outline-secondary btn-sm rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
              <i className="bi bi-arrow-left"></i>
            </Link>
            <h3 className="fw-bold text-dark mb-0">Clinical Record: {patient?.name}</h3>
          </div>
          <p className="text-muted small mb-0 ms-4 ps-2">
            Patient #{patient?.id} • {patient?.phone || 'No phone'} • {patient?.email}
          </p>
        </div>

        <Link to={`/doctor/prescriptions/new?patient_id=${patient?.id}`} className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm">
          <i className="bi bi-pencil-square me-2"></i> Prescribe New Medication
        </Link>
      </div>

      <div className="row g-4">
        {/* Left Column: Active Medication Regimen */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center justify-content-between">
              <span>Active Medication Schedules</span>
              <span className="badge bg-primary-subtle text-primary">{medication_schedules?.length || 0} Regimens</span>
            </h5>

            {medication_schedules && medication_schedules.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {medication_schedules.map((s) => (
                  <div key={s.id} className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong className="text-dark fs-6">{s.medicine_name}</strong>
                        <div className="text-muted small">
                          {s.dosage} • {s.frequency} ({s.timing})
                        </div>
                      </div>
                      <span className={`badge ${s.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                        {s.status}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between text-muted extra-small mt-2 pt-2 border-top">
                      <span>Remaining Supply: <strong>{s.remaining_quantity} doses</strong></span>
                      <span>Route: <strong>{s.route || 'Oral'}</strong></span>
                      {s.days_remaining !== undefined && (
                        <span>Days Left: <strong>~{s.days_remaining} days</strong></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="bi-capsule"
                title="No active medications"
                description="This patient currently has no active medication schedules on record."
              />
            )}
          </div>
        </div>

        {/* Right Column: Prescriptions History & OCR Output */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center justify-content-between">
              <span>Prescription Records & Scans</span>
              <span className="badge bg-secondary-subtle text-secondary">{prescriptions?.length || 0} Records</span>
            </h5>

            {prescriptions && prescriptions.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong className="text-dark small">Rx #{rx.id}</strong>
                        <span className="text-muted extra-small ms-2">
                          Uploaded: {rx.uploaded_at ? new Date(rx.uploaded_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <span className={`badge ${rx.is_verified ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                        {rx.is_verified ? 'Verified & Active' : 'Unconfirmed'}
                      </span>
                    </div>

                    {rx.verified_text && (
                      <p className="text-dark small mb-2 bg-white p-2 rounded-2 border">
                        <i className="bi bi-check-circle text-success me-1"></i>
                        {rx.verified_text}
                      </p>
                    )}

                    {rx.structured_medicines && rx.structured_medicines.length > 0 && (
                      <div className="mb-2">
                        <span className="text-muted extra-small fw-semibold text-uppercase">Extracted Medicines:</span>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {rx.structured_medicines.map((m, mIdx) => (
                            <span key={mIdx} className="badge bg-white border text-dark extra-small">
                              {m.medicine_name} {m.strength !== 'Not specified' ? m.strength : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                      <span className="text-muted extra-small">
                        Engine: {rx.ocr_engine_used} {rx.confidence > 0 ? `(${rx.confidence}%)` : ''}
                      </span>
                      {rx.image_path && (
                        <a
                          href={rx.image_path}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-secondary btn-sm py-0.5 px-2 rounded-pill extra-small"
                        >
                          <i className="bi bi-eye me-1"></i> View Scan
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="bi-file-earmark-medical"
                title="No prescriptions uploaded"
                description="No prescription scans have been filed under this patient record."
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientDetail;
