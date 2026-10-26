import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import { adminAPI } from '../../services/api';

const OcrHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getOcrHealth();
      setHealthData(res.data);
    } catch (err) {
      setError('Unable to load OCR operational telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) return <Layout><Loading text="Loading OCR health telemetry..." /></Layout>;

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1">OCR Processing Pipeline Health</h3>
          <p className="text-muted small mb-0">Live engine status, model singleton telemetry, and extraction confidence metrics.</p>
        </div>
        <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={fetchHealth}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Telemetry
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Engine Status</div>
              <div className="fs-4 fw-bold text-success">{healthData?.engine_status || 'Operational'}</div>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>{healthData?.active_engine || 'EasyOCR (PyTorch Singleton)'}</small>
            </div>
            <div className="stat-icon-wrapper stat-icon-success">
              <i className="bi bi-cpu"></i>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Total Processed</div>
              <div className="fs-3 fw-bold text-dark">{healthData?.total_prescriptions || 0}</div>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>Prescriptions ingested</small>
            </div>
            <div className="stat-icon-wrapper stat-icon-primary">
              <i className="bi bi-file-earmark-medical"></i>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Verified Rate</div>
              <div className="fs-3 fw-bold text-info">
                {healthData?.verification_rate ? `${healthData.verification_rate}%` : '0%'}
              </div>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>{healthData?.verified_prescriptions || 0} verified by users</small>
            </div>
            <div className="stat-icon-wrapper stat-icon-secondary">
              <i className="bi bi-patch-check"></i>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card">
            <div>
              <div className="text-muted extra-small font-weight-bold text-uppercase">Avg OCR Confidence</div>
              <div className="fs-3 fw-bold text-dark">
                {healthData?.average_confidence ? `${Number(healthData.average_confidence).toFixed(1)}%` : 'N/A'}
              </div>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>Calibrated text accuracy</small>
            </div>
            <div className="stat-icon-wrapper stat-icon-warning">
              <i className="bi bi-bar-chart"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Technical Specifications */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <h5 className="fw-bold text-dark mb-3">Image Preprocessing & Layout Reconstruction Pipeline</h5>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="p-3 bg-light rounded-3 border">
              <div className="fw-bold text-dark mb-1"><i className="bi bi-image text-primary me-2"></i>1. Ingestion & Validation</div>
              <p className="small text-muted mb-0">
                MIME validation (JPEG, PNG, WebP), max size 15MB, EXIF auto-rotation, dynamic upscaling for low-res captures.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 bg-light rounded-3 border">
              <div className="fw-bold text-dark mb-1"><i className="bi bi-sliders text-secondary me-2"></i>2. Optical Enhancements</div>
              <p className="small text-muted mb-0">
                Adaptive CLAHE contrast optimization, edge-preserving bilateral denoising, deskew correction, and unsharp masking.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 bg-light rounded-3 border">
              <div className="fw-bold text-dark mb-1"><i className="bi bi-diagram-3 text-success me-2"></i>3. Medical Layout Segmentation</div>
              <p className="small text-muted mb-0">
                Clinic header & doctor isolation, section exclusion, multiline medicine candidate parsing without dosage bleed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Prescriptions Processed */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h5 className="fw-bold text-dark mb-3">Recent OCR Extraction Batches</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Rx ID</th>
                <th>Patient ID</th>
                <th>Engine Used</th>
                <th>Extraction Confidence</th>
                <th>Verification Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {!healthData?.recent_extractions || healthData.recent_extractions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No recent prescription batches recorded in database.
                  </td>
                </tr>
              ) : (
                healthData.recent_extractions.map(rx => (
                  <tr key={rx.id}>
                    <td>#{rx.id}</td>
                    <td>Patient #{rx.user_id}</td>
                    <td><span className="badge bg-light text-dark border">{rx.ocr_engine_used || 'EasyOCR'}</span></td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: '6px' }}>
                          <div
                            className={`progress-bar ${rx.confidence >= 70 ? 'bg-success' : 'bg-warning'}`}
                            style={{ width: `${Math.min(rx.confidence || 0, 100)}%` }}
                          ></div>
                        </div>
                        <span className="small fw-semibold">{Number(rx.confidence || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${rx.is_verified ? 'bg-success' : 'bg-warning text-dark'} rounded-pill px-2`}>
                        {rx.is_verified ? 'Confirmed' : 'Needs Verification'}
                      </span>
                    </td>
                    <td className="small text-muted">{rx.uploaded_at ? new Date(rx.uploaded_at).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default OcrHealth;
