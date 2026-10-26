import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import MedicationCard from '../../components/MedicationCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';
import { medicationAPI } from '../../services/api';

const MedicationSchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const [form, setForm] = useState({
    id: null,
    medicine_name: '',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    timing: 'Morning, Night',
    quantity: 30
  });

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await medicationAPI.getAll();
      setSchedules(res.data);
    } catch (err) {
      setToast({ message: 'Failed to fetch medication schedules', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleAction = async (id, action) => {
    try {
      let res;
      if (action === 'taken') res = await medicationAPI.markTaken(id);
      else if (action === 'missed') res = await medicationAPI.markMissed(id);
      else if (action === 'snooze') res = await medicationAPI.markSnooze(id);

      setToast({ message: res.data.message, type: 'success' });
      fetchSchedules();
    } catch (err) {
      setToast({ message: 'Failed to record action', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medication schedule?")) return;
    try {
      await medicationAPI.delete(id);
      setToast({ message: 'Medication schedule deleted', type: 'success' });
      fetchSchedules();
    } catch (err) {
      setToast({ message: 'Failed to delete schedule', type: 'error' });
    }
  };

  const handleEdit = (med) => {
    setForm({
      id: med.id,
      medicine_name: med.medicine_name,
      dosage: med.dosage,
      frequency: med.frequency,
      timing: med.timing,
      quantity: med.quantity
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await medicationAPI.update(form.id, form);
        setToast({ message: 'Schedule updated', type: 'success' });
      } else {
        await medicationAPI.create(form);
        setToast({ message: 'Medication schedule added', type: 'success' });
      }
      setShowModal(false);
      setForm({ id: null, medicine_name: '', dosage: '1 tablet', frequency: 'Twice daily', timing: 'Morning, Night', quantity: 30 });
      fetchSchedules();
    } catch (err) {
      setToast({ message: 'Failed to save medication schedule', type: 'error' });
    }
  };

  if (loading) return <Layout><Loading text="Loading medication schedules..." /></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-extrabold text-dark mb-1">Medication Schedules</h3>
          <p className="text-muted small">Manage your active dosages, frequency, and remaining pill counts.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => {
          setForm({ id: null, medicine_name: '', dosage: '1 tablet', frequency: 'Twice daily', timing: 'Morning, Night', quantity: 30 });
          setShowModal(true);
        }}>
          <i className="bi bi-plus-lg me-1"></i> Add Medication
        </button>
      </div>

      {schedules.length > 0 ? (
        <div className="row g-3">
          {schedules.map(med => (
            <div className="col-lg-6" key={med.id}>
              <MedicationCard 
                medication={med} 
                onAction={handleAction} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="bi-capsule"
          title="No Active Medication Schedules"
          description="You haven't created any medication schedule yet."
          actionButton={
            <button className="btn btn-primary rounded-pill px-4" onClick={() => setShowModal(true)}>
              + Add First Schedule
            </button>
          }
        />
      )}

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">{form.id ? 'Edit Schedule' : 'Add Medication Schedule'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Medicine Name</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3" 
                      value={form.medicine_name} 
                      onChange={e => setForm({ ...form, medicine_name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Dosage</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3" 
                        value={form.dosage} 
                        onChange={e => setForm({ ...form, dosage: e.target.value })} 
                        required 
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Frequency</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3" 
                        value={form.frequency} 
                        onChange={e => setForm({ ...form, frequency: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Timing</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3" 
                        value={form.timing} 
                        onChange={e => setForm({ ...form, timing: e.target.value })} 
                        required 
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Total Quantity</label>
                      <input 
                        type="number" 
                        className="form-control rounded-3" 
                        value={form.quantity} 
                        onChange={e => setForm({ ...form, quantity: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">Save Schedule</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MedicationSchedulePage;
