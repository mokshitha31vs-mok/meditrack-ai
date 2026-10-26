import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import Loading from '../../components/Loading';
import { prescriptionAPI } from '../../services/api';

const TIME_OPTIONS = [
  { key: 'morning', label: 'Morning', icon: 'bi-sun' },
  { key: 'afternoon', label: 'Afternoon', icon: 'bi-brightness-high' },
  { key: 'evening', label: 'Evening', icon: 'bi-sunset' },
  { key: 'night', label: 'Night', icon: 'bi-moon-stars' }
];

const PrescriptionVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const state = location.state || {};

  const [prescription, setPrescription] = useState(state.prescription || null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [currentExtractedText, setCurrentExtractedText] = useState(state.extractedText || '');
  const [currentConfidence, setCurrentConfidence] = useState(state.confidence || 0);
  const [ocrEngineUsed, setOcrEngineUsed] = useState(state.ocrEngineUsed || 'EasyOCR');
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Helper to normalize medicine records into exactly the 4 required fields
  const normalizeMedicine = (m) => {
    let name = m.medicine_name || '';
    if (name === 'Not detected' || name === 'Unclear in prescription' || name === 'Needs verification') {
      name = '';
    }

    let units = null;
    if (m.units_per_dose !== undefined && m.units_per_dose !== null) {
      units = Number(m.units_per_dose);
    } else if (m.dosage) {
      const match = String(m.dosage).match(/(\d+(?:\.\d+)?)/);
      if (match) units = Number(match[1]);
    }

    let times = [];
    if (Array.isArray(m.administration_times)) {
      times = m.administration_times.map((t) => String(t).toLowerCase().trim()).filter(Boolean);
    } else if (typeof m.timing === 'string' && m.timing !== 'Not specified' && m.timing !== 'Requires review') {
      const lower = m.timing.toLowerCase();
      if (lower.includes('morning')) times.push('morning');
      if (lower.includes('afternoon')) times.push('afternoon');
      if (lower.includes('evening')) times.push('evening');
      if (lower.includes('night')) times.push('night');
    }

    let duration = null;
    if (m.duration_days !== undefined && m.duration_days !== null) {
      duration = Number(m.duration_days);
    } else if (m.duration) {
      const match = String(m.duration).match(/(\d+)/);
      if (match) duration = Number(match[1]);
    }

    return {
      medicine_name: name,
      units_per_dose: units,
      administration_times: times,
      duration_days: duration,
      raw_text: m.raw_text || ''
    };
  };

  // Initialize or restore on refresh
  useEffect(() => {
    if (state.parsedFields?.medicines && state.parsedFields.medicines.length > 0) {
      setMedicines(state.parsedFields.medicines.map(normalizeMedicine));
    } else if (state.prescription?.structured_medicines?.length > 0) {
      setMedicines(state.prescription.structured_medicines.map(normalizeMedicine));
    } else {
      // Handle page refresh or direct URL access: fetch latest prescription or by ?id=
      const targetId = searchParams.get('id');
      setLoading(true);
      const fetchCall = targetId ? prescriptionAPI.getById(targetId) : prescriptionAPI.getAll();

      fetchCall
        .then((res) => {
          let p = null;
          if (Array.isArray(res.data) && res.data.length > 0) {
            p = res.data[0];
          } else if (res.data && res.data.id) {
            p = res.data;
          }

          if (p) {
            setPrescription(p);
            setCurrentExtractedText(p.original_extracted_text || '');
            setCurrentConfidence(p.confidence || 0);
            setOcrEngineUsed(p.ocr_engine_used || 'EasyOCR');

            const structured = p.structured_medicines || [];
            if (structured.length > 0) {
              setMedicines(structured.map(normalizeMedicine));
            } else {
              setMedicines([
                { medicine_name: '', units_per_dose: 1, administration_times: ['morning'], duration_days: 5 }
              ]);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load prescription on refresh:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [state, searchParams]);

  if (loading) {
    return (
      <Layout>
        <Loading text="Loading prescription verification details..." />
      </Layout>
    );
  }

  if (!prescription) {
    return (
      <Layout>
        <div className="alert alert-warning text-center p-5 rounded-4 shadow-sm border-0 bg-white">
          <i className="bi bi-file-earmark-medical fs-1 text-warning mb-3 d-block"></i>
          <h4 className="fw-bold text-dark">No Prescription Selected</h4>
          <p className="text-muted">Please upload a prescription image to start OCR extraction and verification.</p>
          <button className="btn btn-primary rounded-pill mt-3 px-4 py-2" onClick={() => navigate('/user/upload')}>
            <i className="bi bi-cloud-arrow-up me-1"></i> Go to Prescription Upload
          </button>
        </div>
      </Layout>
    );
  }

  const handleFieldChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const toggleAdminTime = (medIndex, timeKey) => {
    const updated = [...medicines];
    const currentTimes = [...(updated[medIndex].administration_times || [])];
    const idx = currentTimes.indexOf(timeKey);
    if (idx > -1) {
      currentTimes.splice(idx, 1);
    } else {
      currentTimes.push(timeKey);
    }
    updated[medIndex].administration_times = currentTimes;
    setMedicines(updated);
  };

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        medicine_name: '',
        units_per_dose: 1,
        administration_times: [],
        duration_days: null,
        raw_text: ''
      }
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) {
      setToast({
        message: 'At least one medicine is required. You can edit this entry instead of deleting it.',
        type: 'warning'
      });
      return;
    }
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleRetryOCR = async () => {
    try {
      setRetrying(true);
      const res = await prescriptionAPI.retry(prescription.id);
      const data = res.data;
      setCurrentExtractedText(data.extracted_text || '');
      setCurrentConfidence(data.confidence || 0);

      if (data.parsed_fields?.medicines?.length > 0) {
        setMedicines(data.parsed_fields.medicines.map(normalizeMedicine));
      }
      setToast({ message: 'OCR scan re-executed successfully.', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Retry OCR failed.', type: 'error' });
    } finally {
      setRetrying(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();

    const validMedicines = medicines
      .map((m) => ({
        medicine_name: m.medicine_name.trim(),
        units_per_dose: m.units_per_dose !== null && m.units_per_dose !== '' ? Number(m.units_per_dose) : null,
        administration_times: m.administration_times || [],
        duration_days: m.duration_days !== null && m.duration_days !== '' ? Number(m.duration_days) : null
      }))
      .filter((m) => m.medicine_name.length > 0);

    if (validMedicines.length === 0) {
      setToast({ message: 'Please provide at least one valid medicine name.', type: 'warning' });
      return;
    }

    try {
      setSaving(true);
      await prescriptionAPI.verify(prescription.id, validMedicines);
      setToast({
        message: `Successfully verified and saved ${validMedicines.length} medication schedule(s).`,
        type: 'success'
      });
      setTimeout(() => {
        navigate('/user/medication-schedule');
      }, 1000);
    } catch (err) {
      console.error('Prescription verification error:', err);
      setToast({
        message: err.response?.data?.error || 'Verification failed. Please review medication fields.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      {/* Header bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-extrabold text-dark mb-1">Prescription OCR Verification</h3>
          <p className="text-muted small mb-0">
            Review the extracted medications below. Edit any uncertain values and confirm your schedule.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-secondary-subtle text-secondary border px-3 py-2">
            <i className="bi bi-cpu me-1"></i> {ocrEngineUsed}
          </span>
          {currentConfidence > 0 && (
            <span className={`badge ${currentConfidence >= 65 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'} px-3 py-2`}>
              <i className="bi bi-speedometer2 me-1"></i> Confidence: {currentConfidence}%
            </span>
          )}
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill btn-sm px-3 py-1.5"
            onClick={handleRetryOCR}
            disabled={retrying}
          >
            {retrying ? (
              <span><span className="spinner-border spinner-border-sm me-1"></span> Rescanning...</span>
            ) : (
              <span><i className="bi bi-arrow-repeat me-1"></i> Rescan Image</span>
            )}
          </button>
        </div>
      </div>

      {/* Mandatory Verification Warning Banner */}
      <div className="alert alert-warning border-warning rounded-4 mb-4 p-3 shadow-sm d-flex align-items-start gap-3">
        <i className="bi bi-shield-exclamation fs-3 text-warning mt-0.5"></i>
        <div>
          <strong className="d-block text-dark fw-bold mb-1">Prescription Verification Warning:</strong>
          <span className="text-dark small">
            Please carefully review the extracted medicine names, units per dose, administration times, and durations against your doctor's written prescription. Any field marked as <em>"Requires review"</em> could not be definitively determined by OCR and must be confirmed before saving.
          </span>
        </div>
      </div>

      {/* Main 4-Column Table Form */}
      <form onSubmit={handleConfirm}>
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
          <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-dark mb-0">
              <i className="bi bi-capsule-pill text-primary me-2"></i>
              Extracted Medicines ({medicines.length})
            </h5>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
              onClick={handleAddMedicine}
            >
              <i className="bi bi-plus-circle me-1"></i> Add Medicine
            </button>
          </div>

          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr className="text-uppercase small text-muted">
                  <th style={{ width: '40px' }} className="text-center">#</th>
                  <th style={{ width: '28%' }}>Medicine Name</th>
                  <th style={{ width: '18%' }}>Units Per Dose</th>
                  <th style={{ width: '32%' }}>Time of Day</th>
                  <th style={{ width: '16%' }}>Duration</th>
                  <th style={{ width: '6%' }} className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((med, idx) => {
                  const hasTimes = med.administration_times && med.administration_times.length > 0;
                  return (
                    <tr key={idx}>
                      {/* Index */}
                      <td className="text-center text-muted fw-bold">{idx + 1}</td>

                      {/* 1. Medicine Name */}
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm rounded-3 py-2 fw-semibold"
                          placeholder="e.g. Amoxicillin"
                          value={med.medicine_name}
                          onChange={(e) => handleFieldChange(idx, 'medicine_name', e.target.value)}
                          required
                        />
                        {!med.medicine_name && (
                          <span className="badge bg-danger-subtle text-danger extra-small mt-1">
                            <i className="bi bi-exclamation-circle me-1"></i> Name required
                          </span>
                        )}
                      </td>

                      {/* 2. Units Per Dose */}
                      <td>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          className="form-control form-control-sm rounded-3 py-2 text-center"
                          placeholder="Units per dose (e.g. 1)"
                          value={med.units_per_dose !== null && med.units_per_dose !== undefined ? med.units_per_dose : ''}
                          onChange={(e) => handleFieldChange(idx, 'units_per_dose', e.target.value ? Number(e.target.value) : null)}
                        />
                        <span className="extra-small text-muted d-block text-center mt-1">
                          {med.units_per_dose ? `${med.units_per_dose} unit(s) / dose` : 'Not specified'}
                        </span>
                      </td>

                      {/* 3. Time of Day */}
                      <td>
                        {!hasTimes && (
                          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-1 px-2 mb-1.5 d-inline-flex align-items-center gap-1 extra-small">
                            <i className="bi bi-exclamation-triangle-fill text-warning"></i> Requires review if exact times cannot be established
                          </span>
                        )}

                        <div className="d-flex flex-wrap gap-1">
                          {TIME_OPTIONS.map((slot) => {
                            const isSelected = med.administration_times?.includes(slot.key);
                            return (
                              <button
                                key={slot.key}
                                type="button"
                                className={`btn btn-sm rounded-pill py-0.5 px-2.5 extra-small fw-semibold d-inline-flex align-items-center gap-1 ${
                                  isSelected
                                    ? 'btn-primary text-white shadow-sm'
                                    : 'btn-outline-secondary'
                                }`}
                                onClick={() => toggleAdminTime(idx, slot.key)}
                              >
                                <i className={`bi ${slot.icon}`}></i> {slot.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* 4. Duration */}
                      <td>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            min="1"
                            className="form-control rounded-start-3 py-2 text-center"
                            placeholder="e.g. 5"
                            value={med.duration_days !== null && med.duration_days !== undefined ? med.duration_days : ''}
                            onChange={(e) => handleFieldChange(idx, 'duration_days', e.target.value ? Number(e.target.value) : null)}
                          />
                          <span className="input-group-text rounded-end-3 bg-light text-muted">days</span>
                        </div>
                        <span className="extra-small text-muted d-block text-center mt-1">
                          {med.duration_days ? `${med.duration_days} days total` : 'Not specified'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm rounded-circle p-1"
                          title="Remove this medicine"
                          onClick={() => handleRemoveMedicine(idx)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-light py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <span className="text-muted small">
              <i className="bi bi-info-circle me-1"></i> Only confirmed medicines will be scheduled in your active reminders.
            </span>
            <button
              type="submit"
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
              disabled={saving}
            >
              {saving ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving Schedule...
                </span>
              ) : (
                <span>
                  <i className="bi bi-check2-circle me-1"></i> Confirm & Save {medicines.filter((m) => m.medicine_name.trim()).length} Medication(s)
                </span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Accordion: Image Reference & Raw Recognized OCR Text */}
      <div className="accordion rounded-4 shadow-sm border-0 mb-4" id="referenceAccordion">
        <div className="accordion-item border-0 rounded-4 overflow-hidden bg-white">
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed fw-bold text-dark py-3"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#refCollapse"
            >
              <i className="bi bi-image text-primary me-2"></i>
              View Uploaded Prescription & Recognized Raw Text
            </button>
          </h2>
          <div id="refCollapse" className="accordion-collapse collapse" data-bs-parent="#referenceAccordion">
            <div className="accordion-body border-top p-4">
              <div className="row g-4">
                <div className="col-md-6 text-center">
                  <h6 className="fw-bold text-dark mb-2 text-start">Prescription Document</h6>
                  <div className="border rounded-3 p-2 bg-light">
                    <img
                      src={prescription.image_path}
                      alt="Uploaded Prescription"
                      className="img-fluid rounded"
                      style={{ maxHeight: '420px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold text-dark mb-2">Original OCR Text Recognized</h6>
                  <pre
                    className="bg-light p-3 rounded-3 small font-monospace text-wrap border mb-0 text-dark"
                    style={{ maxHeight: '420px', overflowY: 'auto', fontSize: '0.8rem' }}
                  >
                    {currentExtractedText || 'No text recognized.'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrescriptionVerification;
