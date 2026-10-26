import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import AppointmentCard from '../../components/AppointmentCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';
import { appointmentAPI } from '../../services/api';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const [form, setForm] = useState({
    id: null,
    doctor_name: '',
    hospital_name: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
    reminder_enabled: true
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentAPI.getAll();
      setAppointments(res.data);
    } catch (err) {
      setToast({ message: 'Failed to fetch appointments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await appointmentAPI.delete(id);
      setToast({ message: 'Appointment deleted', type: 'success' });
      fetchAppointments();
    } catch (err) {
      setToast({ message: 'Failed to delete appointment', type: 'error' });
    }
  };

  const handleEdit = (app) => {
    setForm({
      id: app.id,
      doctor_name: app.doctor_name,
      hospital_name: app.hospital_name,
      appointment_date: app.appointment_date,
      appointment_time: app.appointment_time,
      notes: app.notes || '',
      reminder_enabled: app.reminder_enabled
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await appointmentAPI.update(form.id, form);
        setToast({ message: 'Appointment updated', type: 'success' });
      } else {
        await appointmentAPI.create(form);
        setToast({ message: 'Appointment scheduled', type: 'success' });
      }
      setShowModal(false);
      fetchAppointments();
    } catch (err) {
      setToast({ message: 'Failed to save appointment', type: 'error' });
    }
  };

  if (loading) return <Layout><Loading text="Loading doctor appointments..." /></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-extrabold text-dark mb-1">Doctor Appointments</h3>
          <p className="text-muted small">Schedule clinic visits and receive automated consultation alerts.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => {
          setForm({ id: null, doctor_name: '', hospital_name: '', appointment_date: '', appointment_time: '', notes: '', reminder_enabled: true });
          setShowModal(true);
        }}>
          <i className="bi bi-plus-lg me-1"></i> Add Appointment
        </button>
      </div>

      {appointments.length > 0 ? (
        <div className="row g-3">
          {appointments.map(app => (
            <div className="col-lg-6" key={app.id}>
              <AppointmentCard 
                appointment={app} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="bi-calendar-event"
          title="No Doctor Appointments Scheduled"
          description="Keep track of your clinical checkups and hospital consultations."
          actionButton={
            <button className="btn btn-primary rounded-pill px-4" onClick={() => setShowModal(true)}>
              + Schedule Appointment
            </button>
          }
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">{form.id ? 'Edit Appointment' : 'Schedule Doctor Appointment'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Doctor Name</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3" 
                      placeholder="Dr. Aris Thorne"
                      value={form.doctor_name} 
                      onChange={e => setForm({ ...form, doctor_name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Hospital / Clinic Name</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3" 
                      placeholder="Apollo Hospital"
                      value={form.hospital_name} 
                      onChange={e => setForm({ ...form, hospital_name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Date</label>
                      <input 
                        type="date" 
                        className="form-control rounded-3" 
                        value={form.appointment_date} 
                        onChange={e => setForm({ ...form, appointment_date: e.target.value })} 
                        required 
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Time</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3" 
                        placeholder="05:00 PM"
                        value={form.appointment_time} 
                        onChange={e => setForm({ ...form, appointment_time: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Notes / Consultation Purpose</label>
                    <textarea 
                      className="form-control rounded-3" 
                      rows="2" 
                      value={form.notes} 
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">Save Appointment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AppointmentsPage;
