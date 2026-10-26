import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import NotFound from './pages/NotFound';

// Patient Pages
import PatientDashboard from './pages/user/Dashboard';
import PatientProfile from './pages/user/Profile';
import UploadPrescription from './pages/user/UploadPrescription';
import PrescriptionVerification from './pages/user/PrescriptionVerification';
import PrescriptionsHistory from './pages/user/Prescriptions';
import MedicinesSearch from './pages/user/Medicines';
import MedicationSchedulePage from './pages/user/MedicationSchedule';
import RemindersPage from './pages/user/Reminders';
import AppointmentsPage from './pages/user/Appointments';
import PharmacyFinder from './pages/user/PharmacyFinder';
import PharmacyComparison from './pages/user/PharmacyComparison';
import CartPage from './pages/user/Cart';
import CheckoutPage from './pages/user/Checkout';
import PatientOrdersPage from './pages/user/Orders';
import OrderTrackingPage from './pages/user/OrderTracking';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPatientDetail from './pages/doctor/PatientDetail';
import DoctorIssuePrescription from './pages/doctor/IssuePrescription';
import DoctorProfile from './pages/doctor/Profile';

// Pharmacy Pages
import PharmacyDashboard from './pages/pharmacy/Dashboard';
import PharmacyProfilePage from './pages/pharmacy/Profile';
import PharmacyInventoryPage from './pages/pharmacy/Inventory';
import AddMedicineStock from './pages/pharmacy/AddMedicine';
import PharmacyOrdersPage from './pages/pharmacy/Orders';
import PharmacyOrderDetails from './pages/pharmacy/OrderDetails';

// Delivery Pages
import DeliveryDashboard from './pages/delivery/Dashboard';
import AssignedOrdersPage from './pages/delivery/AssignedOrders';
import DeliveryHistoryPage from './pages/delivery/DeliveryHistory';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminPharmacies from './pages/admin/Pharmacies';
import AdminMedicines from './pages/admin/Medicines';
import AdminInventory from './pages/admin/Inventory';
import AdminOrders from './pages/admin/Orders';
import AdminDeliveryPersonnel from './pages/admin/DeliveryPersonnel';
import AdminReports from './pages/admin/Reports';
import AdminOcrHealth from './pages/admin/OcrHealth';
import AdminAuditLogs from './pages/admin/AuditLogs';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Patient Routes */}
            <Route element={<RoleRoute allowedRoles={['patient']} />}>
              <Route path="/user/dashboard" element={<PatientDashboard />} />
              <Route path="/user/profile" element={<PatientProfile />} />
              <Route path="/user/upload" element={<UploadPrescription />} />
              <Route path="/user/verify-prescription" element={<PrescriptionVerification />} />
              <Route path="/user/prescriptions" element={<PrescriptionsHistory />} />
              <Route path="/user/medicines" element={<MedicinesSearch />} />
              <Route path="/user/medication-schedule" element={<MedicationSchedulePage />} />
              <Route path="/user/reminders" element={<RemindersPage />} />
              <Route path="/user/appointments" element={<AppointmentsPage />} />
              <Route path="/user/pharmacies" element={<PharmacyFinder />} />
              <Route path="/user/pharmacy-comparison" element={<PharmacyComparison />} />
              <Route path="/user/cart" element={<CartPage />} />
              <Route path="/user/checkout" element={<CheckoutPage />} />
              <Route path="/user/orders" element={<PatientOrdersPage />} />
              <Route path="/user/orders/:id" element={<OrderTrackingPage />} />
            </Route>

            {/* Doctor Routes */}
            <Route element={<RoleRoute allowedRoles={['doctor']} />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/patients" element={<DoctorPatients />} />
              <Route path="/doctor/patients/:id" element={<DoctorPatientDetail />} />
              <Route path="/doctor/prescriptions/new" element={<DoctorIssuePrescription />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
            </Route>

            {/* Pharmacy Routes */}
            <Route element={<RoleRoute allowedRoles={['pharmacy']} />}>
              <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
              <Route path="/pharmacy/profile" element={<PharmacyProfilePage />} />
              <Route path="/pharmacy/inventory" element={<PharmacyInventoryPage />} />
              <Route path="/pharmacy/inventory/add" element={<AddMedicineStock />} />
              <Route path="/pharmacy/orders" element={<PharmacyOrdersPage />} />
              <Route path="/pharmacy/orders/:id" element={<PharmacyOrderDetails />} />
            </Route>

            {/* Delivery Routes */}
            <Route element={<RoleRoute allowedRoles={['delivery']} />}>
              <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
              <Route path="/delivery/orders" element={<AssignedOrdersPage />} />
              <Route path="/delivery/history" element={<DeliveryHistoryPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/pharmacies" element={<AdminPharmacies />} />
              <Route path="/admin/medicines" element={<AdminMedicines />} />
              <Route path="/admin/inventory" element={<AdminInventory />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/delivery" element={<AdminDeliveryPersonnel />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/ocr-health" element={<AdminOcrHealth />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            </Route>
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
