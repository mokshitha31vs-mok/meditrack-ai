import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'patient';

  const renderPatientLinks = () => (
    <>
      <div className="nav-section-title">Overview</div>
      <li className="sidebar-nav-item">
        <NavLink to="/user/dashboard" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-grid-fill"></i> Patient Dashboard
        </NavLink>
      </li>

      <div className="nav-section-title">Prescriptions & Meds</div>
      <li className="sidebar-nav-item">
        <NavLink to="/user/upload" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-file-earmark-medical-fill"></i> Upload Prescription
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/user/prescriptions" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-journal-check"></i> Prescription History
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/user/medication-schedule" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-calendar-week-fill"></i> Medication Schedule
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/user/reminders" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-bell-fill"></i> Reminders & Logs
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/user/appointments" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-person-workspace"></i> Doctor Appointments
        </NavLink>
      </li>

      <div className="nav-section-title">Pharmacy & Orders</div>
      <li className="sidebar-nav-item">
        <NavLink to="/user/pharmacies" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-geo-alt-fill"></i> Pharmacy Finder
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/user/pharmacy-comparison" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-sliders"></i> Price Comparison
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/user/cart" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-cart-fill"></i> Medicine Cart
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/user/orders" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-bag-check-fill"></i> My Orders & Tracking
        </NavLink>
      </li>
    </>
  );

  const renderPharmacyLinks = () => (
    <>
      <div className="nav-section-title">Pharmacy Operations</div>
      <li className="sidebar-nav-item">
        <NavLink to="/pharmacy/dashboard" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-speedometer2"></i> Pharmacy Dashboard
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/pharmacy/inventory" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-boxes"></i> Medicine Inventory
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/pharmacy/inventory/add" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-plus-circle-fill"></i> Add Stock / Price
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/pharmacy/orders" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-receipt"></i> Incoming Orders
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/pharmacy/profile" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-building-gear"></i> Pharmacy Profile
        </NavLink>
      </li>
    </>
  );

  const renderDeliveryLinks = () => (
    <>
      <div className="nav-section-title">Delivery Portal</div>
      <li className="sidebar-nav-item">
        <NavLink to="/delivery/dashboard" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-truck-front-fill"></i> Delivery Dashboard
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/delivery/orders" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-list-task"></i> Assigned Orders
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/delivery/history" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-clock-history"></i> Delivery History
        </NavLink>
      </li>
    </>
  );

  const renderDoctorLinks = () => (
    <>
      <div className="nav-section-title">Clinical Practice</div>
      <li className="sidebar-nav-item">
        <NavLink to="/doctor/dashboard" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-grid-fill"></i> Doctor Portal
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/doctor/patients" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-people-fill"></i> Authorized Patients
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/doctor/prescriptions/new" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-file-earmark-plus-fill"></i> Issue Prescription
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/doctor/profile" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-person-badge-fill"></i> Credentials & Profile
        </NavLink>
      </li>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <div className="nav-section-title">Admin Management</div>
      <li className="sidebar-nav-item">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-shield-lock-fill"></i> Admin Console
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/admin/users" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-people-fill"></i> Manage Users
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/admin/pharmacies" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-buildings-fill"></i> Manage Pharmacies
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/admin/medicines" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-capsule"></i> Medicine Catalog
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/admin/inventory" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-table"></i> All Inventories
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/admin/orders" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-bag-fill"></i> Platform Orders
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/admin/delivery" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-person-badge-fill"></i> Delivery Personnel
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/admin/ocr-health" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-cpu-fill"></i> OCR Health Monitor
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/admin/audit-logs" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-clock-history"></i> System Audit Logs
        </NavLink>
      </li>
      <li className="sidebar-nav-item">
        <NavLink to="/admin/reports" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-bar-chart-line-fill"></i> Analytics & Reports
        </NavLink>
      </li>
    </>
  );

  return (
    <aside className="sidebar">
      <div className="brand-title">
        <i className="bi bi-heart-pulse-fill text-primary"></i>
        <span>MediTrack <span className="text-secondary">AI</span></span>
      </div>

      <ul className="sidebar-nav">
        {role === 'patient' && renderPatientLinks()}
        {role === 'doctor' && renderDoctorLinks()}
        {role === 'pharmacy' && renderPharmacyLinks()}
        {role === 'delivery' && renderDeliveryLinks()}
        {role === 'admin' && renderAdminLinks()}
      </ul>

      <div className="sidebar-user">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', fontWeight: 'bold' }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="text-truncate">
            <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.85rem' }}>{user?.name || 'User'}</div>
            <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>{role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
