import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { prescriptionAPI } from '../../services/api';

const PrescriptionsHistory = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const res = await prescriptionAPI.getAll();
        setPrescriptions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  if (loading) return <Layout><Loading text="Loading prescription records..." /></Layout>;

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-extrabold text-dark mb-1">Prescription History</h3>
          <p className="text-muted small">Access your uploaded prescription scans, OCR extractions & verification logs.</p>
        </div>
        <Link to="/user/upload" className="btn btn-primary rounded-pill px-4 shadow-sm">
          <i className="bi bi-cloud-arrow-up me-1"></i> Upload New Prescription
        </Link>
      </div>

      {prescriptions.length > 0 ? (
        <div className="row g-3">
          {prescriptions.map(p => (
            <div className="col-md-6 col-lg-4" key={p.id}>
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                <img 
                  src={p.image_path} 
                  alt="Prescription Scan" 
                  className="card-img-top rounded-3 border mb-3"
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className={`badge ${p.is_verified ? 'bg-success' : 'bg-warning text-dark'} rounded-pill px-3`}>
                    {p.is_verified ? 'Verified' : 'Pending Verification'}
                  </span>
                  <span className="text-muted extra-small">{p.ocr_engine_used}</span>
                </div>
                <p className="text-dark small mb-2 fw-semibold text-truncate">{p.verified_text || p.original_extracted_text || 'No text extracted'}</p>
                <div className="text-muted extra-small mt-auto">
                  Uploaded on {p.uploaded_at ? new Date(p.uploaded_at).toLocaleDateString() : 'Today'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon="bi-journal-medical"
          title="No Prescriptions Uploaded"
          description="Upload paper prescriptions to digitize your medical records."
          actionButton={
            <Link to="/user/upload" className="btn btn-primary rounded-pill px-4">
              Upload Prescription
            </Link>
          }
        />
      )}
    </Layout>
  );
};

export default PrescriptionsHistory;
