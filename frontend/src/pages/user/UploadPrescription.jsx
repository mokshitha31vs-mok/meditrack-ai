import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import { prescriptionAPI } from '../../services/api';

const UploadPrescription = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setToast({ message: 'File size exceeds maximum limit of 8 MB.', type: 'error' });
      return;
    }

    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')).toLowerCase() : '';
    if (!validExtensions.includes(ext) && !['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setToast({ message: 'Invalid file format. Please upload JPG, JPEG, PNG, or WebP.', type: 'error' });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setToast({ message: 'Please select a prescription image to upload.', type: 'warning' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await prescriptionAPI.upload(formData);
      const { prescription, parsed_fields, extracted_text, ocr_engine_used, confidence } = res.data;

      // Navigate to mandatory Verification screen with state
      navigate('/user/verify-prescription', {
        state: {
          prescription,
          parsedFields: parsed_fields,
          extractedText: extracted_text,
          ocrEngineUsed: ocr_engine_used,
          confidence: confidence
        }
      });
    } catch (err) {
      console.error('Prescription upload error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to upload prescription image.';
      setToast({ message: errMsg, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1">Upload Prescription Image</h3>
        <p className="text-muted small">Upload your doctor's prescription to extract medicines, dosage & timing automatically.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <form onSubmit={handleUpload}>
              <div 
                className="border-2 border-dashed border-primary-subtle rounded-4 p-5 text-center bg-light cursor-pointer mb-4"
                onClick={() => document.getElementById('fileInput').click()}
              >
                <input 
                  type="file" 
                  id="fileInput" 
                  className="d-none" 
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                />
                
                {previewUrl ? (
                  <div>
                    <img 
                      src={previewUrl} 
                      alt="Prescription Preview" 
                      className="img-fluid rounded-3 mb-3 shadow-sm" 
                      style={{ maxHeight: '300px' }}
                    />
                    <div className="small text-success fw-bold">
                      <i className="bi bi-file-earmark-check me-1"></i> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  </div>
                ) : (
                  <div>
                    <i className="bi bi-cloud-arrow-up-fill display-3 text-primary mb-3"></i>
                    <h5 className="fw-bold text-dark">Click or Drag & Drop Prescription Image</h5>
                    <p className="text-muted small">Supports PNG, JPG, JPEG (Max 8 MB)</p>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                  disabled={!selectedFile || uploading}
                >
                  Clear Selection
                </button>

                <button 
                  type="submit" 
                  className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm"
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Running OCR Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cpu me-2"></i> Scan & Extract Prescription
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadPrescription;
