import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-body">
          {/* Prominent but unobtrusive Medical Safety Disclaimer */}
          <div className="disclaimer-banner">
            <i className="bi bi-shield-exclamation text-warning fs-5"></i>
            <div>
              <strong>Medical Disclaimer:</strong> Medical information extracted or managed by this application is for organizational assistance only. Please verify prescription details with your healthcare professional or pharmacist before use.
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
