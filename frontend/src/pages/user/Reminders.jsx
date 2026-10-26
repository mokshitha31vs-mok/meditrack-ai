import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { reminderAPI, medicationAPI } from '../../services/api';

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [remRes, logRes] = await Promise.all([
        reminderAPI.getAll(),
        medicationAPI.getLogs()
      ]);
      setReminders(remRes.data);
      setLogs(logRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Layout><Loading text="Loading reminders and logs..." /></Layout>;

  return (
    <Layout>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Medication Reminders & Action Logs</h3>
        <p className="text-muted small">Track dosage alerts and view historical compliance records.</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Reminders Configured */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-bell-fill text-primary me-2"></i>Active Dosage Reminders</h5>
            {reminders.length > 0 ? (
              <div className="list-group list-group-flush">
                {reminders.map(r => (
                  <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center" key={r.id}>
                    <div>
                      <h6 className="fw-bold text-dark mb-1">{r.medicine_name}</h6>
                      <span className="text-muted small">{r.dosage}</span>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-primary-subtle text-primary fs-6 px-3 py-1 rounded-pill">
                        <i className="bi bi-clock me-1"></i>{r.reminder_time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="bi-bell-slash" title="No active reminders" description="Reminders are generated automatically when you create a schedule." />
            )}
          </div>
        </div>

        {/* Right Column: Historical Logs */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-journal-text text-secondary me-2"></i>Medication Compliance Logs</h5>
            {logs.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Time</th>
                      <th>Action</th>
                      <th>Recorded At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => {
                      const badgeClass = log.action === 'TAKEN' ? 'bg-success' : log.action === 'MISSED' ? 'bg-danger' : 'bg-warning text-dark';
                      return (
                        <tr key={log.id}>
                          <td>{log.scheduled_time || 'Daily'}</td>
                          <td>
                            <span className={`badge ${badgeClass} rounded-pill px-3`}>{log.action}</span>
                          </td>
                          <td className="text-muted small">
                            {log.recorded_at ? new Date(log.recorded_at).toLocaleString() : 'Just now'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon="bi-clock-history" title="No compliance logs recorded" description="Actions like Taken, Missed, or Snoozed will appear here." />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RemindersPage;
