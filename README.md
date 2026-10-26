# MediTrack AI: Full-Stack Healthcare Platform & Prescription OCR System

MediTrack AI is an enterprise-grade digital healthcare platform designed to digitize medical prescriptions through optical character recognition, manage patient medication schedules, coordinate doctor-patient clinical access, discover local pharmacies, manage verified inventory, place pharmaceutical orders, and track doorstep deliveries.

The platform provides dedicated, securely authenticated dashboards for five distinct roles:
1. **Patient**
2. **Doctor**
3. **Pharmacy**
4. **Delivery Agent**
5. **Administrator**

---

## Architecture Overview

### 1. Technology Stack
* **Frontend**: React 18, Vite 5, React Router v6, Bootstrap 5, Bootstrap Icons, Leaflet & OpenStreetMap.
* **Backend**: Python 3.10+, Flask 3.0, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS, Werkzeug.
* **Database**: SQLite (local development and test) / PostgreSQL compatible SQLAlchemy ORM models.
* **Image Processing & OCR**: OpenCV (cv2), Pillow (PIL), EasyOCR 1.7.2 with PyTorch deep learning models (`craft_mlt_25k` text detector and `english_g2` recognition network).

---

## Key Platform Capabilities

### 1. Advanced Prescription Image Preprocessing & Real OCR Pipeline
* **Input Validation**: Rejects corrupted, oversized (>15MB), or unsupported file types. Accepts JPEG, PNG, and WebP.
* **Optical Optimization**: Auto-orients images via EXIF tags, applies cubic upscaling for low-resolution phone captures, utilizes adaptive CLAHE (Contrast Limited Adaptive Histogram Equalization), bilateral edge-preserving filtering, and unsharp masking.
* **Singleton Model Caching**: EasyOCR reader is instantiated as a thread-safe singleton, eliminating 5-10 second model reload latencies across requests.
* **Prescription Layout Reconstruction**: Distinguishes clinic/hospital headers, physician credentials, patient demographics, prescription dates, diagnosis notes, and signature footers to prevent non-medicines from contaminating medication candidate lists.
* **Multi-Medicine Detection & Segmentation**: Ingests multiline and multi-medicine prescriptions, detecting every distinct drug item on the document.
* **Independent Field Extraction**: Parses strength (e.g., 500 mg, 10 mg), dosage form (tablet, capsule, syrup), dose amount (1 tablet), frequency (once daily, twice daily, three times daily, SOS), timing (morning, night, after food), route (oral, topical), duration (5 days), and instructions independently for each medicine without copying dosage details between items.
* **No Hardcoded Mock Results**: Fallbacks that silently returned sample prescriptions have been completely eliminated. Uploading an image invokes actual image decoding and OCR extraction.

### 2. Clinical Safety & Patient Verification Workflow
* **Workflow**: `Uploaded` -> `OCR Processed` -> `Needs Verification` -> `Confirmed by User` -> `Active Medication Record`.
* **Verification Interface**: Displays the original uploaded prescription scan side-by-side with recognized text and editable medicine candidate cards. Patients can correct OCR discrepancies, delete false candidates, add missing medicines, or trigger OCR retry before saving.
* **Medical Disclaimer**: Clear clinical disclaimers remind users that automated extraction is assistive and must be confirmed with attending doctors or licensed pharmacists.

### 3. Five Role-Based Portals & Server-Side Authorization
* **Patient Portal**: Upload prescriptions, verify OCR candidates, view active medication schedules, log dose intake actions (taken, missed, snoozed), schedule doctor appointments, search pharmacies, compare medicine prices, order medications, and track deliveries.
* **Doctor Portal**: View authorized patients who have granted clinical consent, review patient prescription histories, issue digital clinical prescriptions with automated schedule generation, and manage professional medical license credentials.
* **Pharmacy Portal**: Manage live drug inventory, adjust real-time unit pricing and stock levels, accept or prepare incoming orders, and inspect customer delivery addresses.
* **Delivery Portal**: Manage assigned packages, view pickup and delivery coordinates, and execute validated order state transitions from pickup to final doorstep delivery.
* **Administrator Console**: Manage all 5 user roles, toggle account active/suspended statuses, review and verify medical licenses of doctors and partner pharmacies, inspect real-time OCR pipeline telemetry, and review immutable system audit logs.

### 4. Validated Commerce & Order Lifecycle
* **Inventory Stock Check**: Checks current inventory records before order creation; transactions are rejected if required quantities are unavailable.
* **State Machine**: Validates transitions:
  `PLACED` -> `ACCEPTED` -> `PREPARING` -> `READY FOR PICKUP` -> `ASSIGNED TO DELIVERY` -> `OUT FOR DELIVERY` -> `DELIVERED`.
* **Audit Trail**: Every state change records user ID, timestamp, entity ID, action, and remote IP address.

---

## Local Development & Execution

### Prerequisites
* Python 3.10 or higher
* Node.js (v18+) and npm

### 1. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Create and activate virtual environment (Windows PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Download required EasyOCR neural network models (one-time setup)
python download_easyocr_models.py

# Initialize database and seed 5-role accounts with test fixtures
python seed.py

# Start the Flask development server on port 5000
python run.py
```

### 2. Frontend Setup
```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Install dependencies (use cmd on Windows if PowerShell execution policy applies)
npm install

# Start the Vite development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## Automated Verification & Test Commands

Run the comprehensive test suite locally using the backend virtual environment:

```bash
# 1. Verify Database Models, Foreign Keys, 5 Roles, and Commerce Seed Data
python backend/test_backend.py

# 2. Test Multi-Medicine Layout Reconstruction & Independent Field Parsing
python backend/test_medicine_parser.py

# 3. Test Real Image Preprocessing and EasyOCR Deep Learning Pipeline
python backend/test_real_ocr.py

# 4. Compile and Validate Production Frontend Build
cd frontend
npm run build
```

---

## Development Accounts for Local Testing

For local testing, the database seed script provisions test accounts with password: `Demo@123`

| Role | Email | Status |
|---|---|---|
| **Patient** | `user@meditrack.local` | `ACTIVE` |
| **Doctor** | `doctor@meditrack.local` | `ACTIVE` (Verified MD, MCI-48291) |
| **Pharmacy** | `pharmacy@meditrack.local` | `ACTIVE` (Verified Partner) |
| **Delivery Agent** | `delivery@meditrack.local` | `ACTIVE` |
| **Administrator** | `admin@meditrack.local` | `ACTIVE` (System Provisioned) |

---

## Production & Custom Domain Deployment Guide

1. **Environment Configuration**:
   - Copy `backend/.env.example` to `backend/.env` and configure strong random secrets for `SECRET_KEY` and `JWT_SECRET_KEY`.
   - Update `DATABASE_URL` to point to a production PostgreSQL database instance.
   - Configure `CORS_ORIGIN` with your verified production domain (e.g., `https://app.meditrack.ai`).
   - Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` to your production API endpoint.

2. **Reverse Proxy & HTTPS**:
   - Configure Nginx or Caddy to terminate SSL/TLS certificates (Let's Encrypt / Cloudflare).
   - Route `/api/*` to the Gunicorn/Flask upstream on `127.0.0.1:5000`.
   - Serve static assets from `frontend/dist/`.

3. **Launch Gate Checklist**:
   - [x] EasyOCR neural network models cached locally.
   - [x] Multi-medicine parsing verified with zero field copying.
   - [x] All 5 role-based dashboards fully functional with server-side authorization.
   - [x] Custom favicon SVG added.
   - [x] Generator branding and prototype badges removed.
   - [x] Substantive Privacy Policy and Terms and Conditions published.
   - [x] Production build passes with 0 compiler errors.
   - [ ] Connect custom production DNS A/CNAME records (Pending user domain ownership).
   - [ ] Provision production SSL/TLS certificates on host server (Pending host deployment).
