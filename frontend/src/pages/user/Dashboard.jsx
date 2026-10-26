import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import MedicationCard from '../../components/MedicationCard';
import AppointmentCard from '../../components/AppointmentCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';
import { dashboardAPI, medicationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getUser();
      setData(res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load dashboard data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMedicationAction = async (scheduleId, action) => {
    try {
      let res;
      if (action === 'taken') res = await medicationAPI.markTaken(scheduleId);
      else if (action === 'missed') res = await medicationAPI.markMissed(scheduleId);
      else if (action === 'snooze') res = await medicationAPI.markSnooze(scheduleId);

      setToast({ message: res.data.message, type: 'success' });
      fetchDashboardData();
    } catch (err) {
      setToast({ message: 'Failed to record medication action', type: 'error' });
    }
  };

  // Greeting based on time of day
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) return <Layout><Loading text="Loading your health dashboard..." /></Layout>;

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      {/* Header Greeting */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-extrabold text-dark mb-1">
            {timeGreeting}, {user?.name || 'Patient'} 👋
          </h2>
          <p className="text-muted small">Here is your daily medication overview and health reminders.</p>
        </div>
        <Link to="/user/upload" className="btn btn-primary rounded-pill px-4 shadow-sm">
          <i className="bi bi-file-earmark-medical me-2"></i> Upload Prescription
        </Link>
      </div>

      {/* Overview Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Today's Meds</div>
              <div className="fs-3 fw-bold text-dark">{data?.todays_medications?.length || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-primary">
              <i className="bi bi-capsule"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Running Low</div>
              <div className="fs-3 fw-bold text-danger">{data?.running_low_medications?.length || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-danger">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Pharmacies Nearby</div>
              <div className="fs-3 fw-bold text-secondary">{data?.nearby_pharmacies_count || 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-secondary">
              <i className="bi bi-geo-alt"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Active Orders</div>
              <div className="fs-3 fw-bold text-success">{data?.active_order ? 1 : 0}</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-success">
              <i className="bi bi-truck"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Running Low Refill Alert Banner */}
      {data?.running_low_medications && data.running_low_medications.length > 0 && (
        <div className="alert bg-danger-subtle border-danger text-danger-emphasis rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-lightning-charge-fill fs-2 text-danger"></i>
            <div>
              <strong className="d-block">Refill Needed Soon!</strong>
              <span className="small">You have {data.running_low_medications.length} medication(s) running low on quantity.</span>
            </div>
          </div>
          <Link to="/user/pharmacy-comparison" className="btn btn-danger btn-sm rounded-pill px-4 fw-bold">
            Refill Now
          </Link>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="row g-4">
        {/* Left Column: Today's Medication Cards */}
        <div className="col-lg-7">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">Today's Medication Schedule</h5>
            <Link to="/user/medication-schedule" className="small text-primary fw-bold text-decoration-none">
              View All <i className="bi bi-arrow-right me-1"></i>
            </Link>
          </div>

          {data?.todays_medications && data.todays_medications.length > 0 ? (
            data.todays_medications.map(med => (
              <MedicationCard 
                key={med.id} 
                medication={med} 
                onAction={handleMedicationAction} 
              />
            ))
          ) : (
            <EmptyState 
              icon="bi-check-circle-fill text-success" 
              title="No medications scheduled for today" 
              description="Upload a prescription or add a medication schedule to get started."
              actionButton={
                <Link to="/user/upload" className="btn btn-primary rounded-pill px-4 btn-sm">
                  Upload Prescription
                </Link>
              }
            />
          )}
        </div>

        {/* Right Column: Next Reminder, Doctor Appointment, Active Order */}
        <div className="col-lg-5">
          {/* Active Order Tracker Widget */}
          {data?.active_order && (
            <div className="card border-primary border-2 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-primary text-white py-2.5 px-3 fw-bold small d-flex justify-content-between align-items-center">
                <span><i className="bi bi-bag-check-fill me-1"></i> Active Order #{data.active_order.id}</span>
                <span className="badge bg-white text-primary">{data.active_order.status}</span>
              </div>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Pharmacy:</span>
                  <strong className="text-dark">{data.active_order.pharmacy_name}</strong>
                </div>
                <div className="d-flex justify-content-between mb-3 small">
                  <span className="text-muted">Total Amount:</span>
                  <strong className="text-success">₹{data.active_order.total_amount}</strong>
                </div>
                <Link to={`/user/orders/${data.active_order.id}`} className="btn btn-outline-primary btn-sm w-100 rounded-pill">
                  Track Delivery Progress <i className="bi bi-geo-alt-fill ms-1"></i>
                </Link>
              </div>
            </div>
          )}

          {/* Upcoming Appointment */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">Upcoming Appointment</h5>
            <Link to="/user/appointments" className="small text-primary fw-bold text-decoration-none">Manage</Link>
          </div>
          {data?.upcoming_appointment ? (
            <AppointmentCard appointment={data.upcoming_appointment} />
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 text-center">
              <p className="text-muted small mb-2">No upcoming doctor appointments scheduled.</p>
              <Link to="/user/appointments" className="btn btn-outline-primary btn-sm rounded-pill align-self-center">
                + Add Appointment
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PatientDashboard;
