import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { doctorAPI } from '../../services/api';

const IssuePrescription = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [medicines, setMedicines] = useState([
    {
      medicine_name: '',
      strength: '500 mg',
      dosage_form: 'Tablet',
      dose: '1 tablet',
      route: 'Oral',
      frequency: 'Twice daily',
      timing: 'Morning, Night',
      duration: '5 days',
      quantity: 10,
      special_instructions: 'Take after meals'
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await doctorAPI.getPatients();
      setPatients(res.data || []);

      // If patient passed in query or state
      const params = new URLSearchParams(location.search);
      const preselectedId = params.get('patient_id');
      if (preselectedId) {
        setSelectedPatientId(preselectedId);
      } else if (res.data && res.data.length > 0) {
        setSelectedPatientId(res.data[0].id.toString());
      }
    } catch (err) {
      setError('Unable to load authorized patients. Please ensure patient has granted clinical access.');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      {
        medicine_name: '',
        strength: '250 mg',
        dosage_form: 'Tablet',
        dose: '1 tablet',
        route: 'Oral',
        frequency: 'Once daily',
        timing: 'Morning',
        duration: '7 days',
        quantity: 7,
        special_instructions: ''
      }
    ]);
  };

  const removeMedicineRow = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedPatientId) {
      setError('Please select an authorized patient.');
      return;
    }

    const invalidMed = medicines.find(m => !m.medicine_name.trim());
    if (invalidMed) {
      setError('All medicine items must specify a valid medicine name.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        patient_id: parseInt(selectedPatientId),
        notes: clinicalNotes.trim(),
        medicines: medicines.map(m => ({
          ...m,
          medicine_name: m.medicine_name.trim(),
          strength: m.strength.trim(),
          dosage: m.dose.trim(),
          frequency: m.frequency.trim(),
          timing: m.timing.trim(),
          route: m.route.trim(),
          duration: m.duration.trim(),
          quantity: parseInt(m.quantity) || 10,
          special_instructions: m.special_instructions.trim(),
          confidence: 100.0,
          verification_status: 'verified'
        }))
      };

      const res = await doctorAPI.issuePrescription(payload);
      setSuccess('Prescription issued successfully! Medication schedules and patient reminders have been generated.');
      setTimeout(() => {
        navigate(`/doctor/patients/${selectedPatientId}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to issue prescription. Please check clinical authorization.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="layout-dashboard">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="content-area">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="mb-1 text-dark fw-bold">Issue Clinical Prescription</h2>
              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                Create verified digital prescriptions and automatically initialize patient medication schedules.
              </p>
            </div>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/doctor/patients')}>
              <i className="bi bi-arrow-left me-1"></i> Back to Patients
            </button>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
              <i className="bi bi-check-circle-fill"></i>
              <div>{success}</div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="text-muted mt-2">Loading authorized patient registry...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="card border-0 shadow-sm p-5 text-center">
              <i className="bi bi-person-x text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-dark">No Authorized Patients Found</h5>
              <p className="text-muted">
                Patients must grant clinical access to Dr. account before you can write clinical prescriptions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold text-dark mb-3">1. Patient Selection</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">Authorized Patient</label>
                      <select
                        className="form-select"
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        required
                      >
                        <option value="">-- Select Patient --</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.email}) - Access: {p.access_status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">Clinical Notes / Diagnosis</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Acute bacterial upper respiratory infection"
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h5 className="card-title fw-bold text-dark mb-0">2. Prescribed Medications</h5>
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                        Each medicine record is tracked independently with its own distinct dosage and duration.
                      </span>
                    </div>
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={addMedicineRow}>
                      <i className="bi bi-plus-circle me-1"></i> Add Another Medicine
                    </button>
                  </div>

                  {medicines.map((med, idx) => (
                    <div key={idx} className="border rounded p-3 mb-3 bg-light position-relative">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-primary">Item #{idx + 1}</span>
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-link text-danger p-0 text-decoration-none"
                            onClick={() => removeMedicineRow(idx)}
                          >
                            <i className="bi bi-trash me-1"></i> Remove
                          </button>
                        )}
                      </div>

                      <div className="row g-2">
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold text-secondary">Medicine Name</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Amoxicillin"
                            value={med.medicine_name}
                            onChange={(e) => handleMedicineChange(idx, 'medicine_name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small fw-semibold text-secondary">Strength</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. 500 mg"
                            value={med.strength}
                            onChange={(e) => handleMedicineChange(idx, 'strength', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small fw-semibold text-secondary">Dosage Form</label>
                          <select
                            className="form-select form-select-sm"
                            value={med.dosage_form}
                            onChange={(e) => handleMedicineChange(idx, 'dosage_form', e.target.value)}
                          >
                            <option value="Tablet">Tablet</option>
                            <option value="Capsule">Capsule</option>
                            <option value="Syrup">Syrup</option>
                            <option value="Injection">Injection</option>
                            <option value="Ointment">Ointment</option>
                            <option value="Drops">Drops</option>
                          </select>
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small fw-semibold text-secondary">Dose</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. 1 tablet"
                            value={med.dose}
                            onChange={(e) => handleMedicineChange(idx, 'dose', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small fw-semibold text-secondary">Route</label>
                          <select
                            className="form-select form-select-sm"
                            value={med.route}
                            onChange={(e) => handleMedicineChange(idx, 'route', e.target.value)}
                          >
                            <option value="Oral">Oral</option>
                            <option value="Topical">Topical</option>
                            <option value="Intravenous">Intravenous</option>
                            <option value="Inhalation">Inhalation</option>
                            <option value="Ophthalmic">Ophthalmic</option>
                          </select>
                        </div>

                        <div className="col-md-3">
                          <label className="form-label small fw-semibold text-secondary">Frequency</label>
                          <select
                            className="form-select form-select-sm"
                            value={med.frequency}
                            onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          >
                            <option value="Once daily">Once daily (OD)</option>
                            <option value="Twice daily">Twice daily (BD)</option>
                            <option value="Three times daily">Three times daily (TDS)</option>
                            <option value="Four times daily">Four times daily (QID)</option>
                            <option value="As needed (SOS)">As needed (SOS)</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-semibold text-secondary">Timing</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Morning, Night"
                            value={med.timing}
                            onChange={(e) => handleMedicineChange(idx, 'timing', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small fw-semibold text-secondary">Duration</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. 5 days"
                            value={med.duration}
                            onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small fw-semibold text-secondary">Total Quantity</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={med.quantity}
                            onChange={(e) => handleMedicineChange(idx, 'quantity', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label small fw-semibold text-secondary">Instructions</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. After food"
                            value={med.special_instructions}
                            onChange={(e) => handleMedicineChange(idx, 'special_instructions', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate('/doctor/patients')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Issuing Prescription...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-file-earmark-check me-2"></i> Issue & Sign Prescription
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default IssuePrescription;
