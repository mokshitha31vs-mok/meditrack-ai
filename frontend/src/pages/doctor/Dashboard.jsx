import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { doctorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await doctorAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading message="Loading doctor clinical portal..." />
      </Layout>
    );
  }

  const doctorProfile = user?.doctor_profile || data?.doctor?.doctor_profile;

  return (
    <Layout>
      {/* Welcome Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            Doctor Portal: {user?.name || 'Dr. Physician'}
          </h3>
          <p className="text-muted small mb-0">
            {doctorProfile?.specialization || 'Clinical Specialist'} • {doctorProfile?.hospital_affiliation || 'City Healthcare Clinic'}
            {doctorProfile?.license_number && (
              <span className="badge bg-secondary-subtle text-secondary ms-2">
                Lic: {doctorProfile.license_number}
              </span>
            )}
            {doctorProfile?.is_verified && (
              <span className="badge bg-success-subtle text-success ms-2">
                <i className="bi bi-patch-check-fill me-1"></i> Verified Clinician
              </span>
            )}
          </p>
        </div>

        <Link to="/doctor/prescriptions/new" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm">
          <i className="bi bi-pencil-square me-2"></i> Issue Prescription
        </Link>
      </div>

      {/* KPI Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Authorized Patients</div>
              <h3 className="fw-bold text-dark mb-0 mt-1">{data?.total_authorized_patients || 0}</h3>
              <span className="text-muted extra-small">With verified consent</span>
            </div>
            <div className="stat-icon-wrapper stat-icon-primary">
              <i className="bi bi-people-fill"></i>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Prescriptions Reviewed</div>
              <h3 className="fw-bold text-dark mb-0 mt-1">{data?.total_prescriptions || 0}</h3>
              <span className="text-muted extra-small">Accessible clinical records</span>
            </div>
            <div className="stat-icon-wrapper stat-icon-secondary">
              <i className="bi bi-file-earmark-medical-fill"></i>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold">Upcoming Consultations</div>
              <h3 className="fw-bold text-dark mb-0 mt-1">{data?.upcoming_appointments_count || 0}</h3>
              <span className="text-muted extra-small">Scheduled visits</span>
            </div>
            <div className="stat-icon-wrapper stat-icon-warning">
              <i className="bi bi-calendar-check-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Authorized Patients List */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Authorized Patients</h5>
              <Link to="/doctor/patients" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                View All
              </Link>
            </div>

            {data?.patients && data.patients.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted small">
                    <tr>
                      <th>Patient</th>
                      <th>Contact</th>
                      <th>Active Meds</th>
                      <th>Prescriptions</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.patients.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="fw-semibold text-dark">{p.name}</div>
                          <span className="text-muted extra-small">ID #{p.id}</span>
                        </td>
                        <td className="small text-muted">{p.phone || p.email}</td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary">
                            {p.active_medications} Meds
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-secondary">
                            {p.prescriptions_count} Rx
                          </span>
                        </td>
                        <td className="text-end">
                          <Link
                            to={`/doctor/patients/${p.id}`}
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1"
                          >
                            Clinical History
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon="bi-people"
                title="No authorized patients yet"
                description="Patients who grant clinical consent to your account will appear here for review."
              />
            )}
          </div>
        </div>

        {/* Appointments Sidebar */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">Upcoming Appointments</h5>

            {data?.appointments && data.appointments.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {data.appointments.map((a) => (
                  <div key={a.id} className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-dark small">{a.hospital_name}</strong>
                      <span className="badge bg-success-subtle text-success">{a.status}</span>
                    </div>
                    <div className="text-muted small">
                      <i className="bi bi-calendar-event me-1"></i> {a.appointment_date} at {a.appointment_time}
                    </div>
                    {a.notes && (
                      <p className="text-muted extra-small mb-0 mt-2 text-truncate">
                        Note: {a.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="bi-calendar-x"
                title="No upcoming visits"
                description="No consultation bookings found for your schedule."
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
