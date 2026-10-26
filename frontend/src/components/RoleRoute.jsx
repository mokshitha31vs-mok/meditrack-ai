import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect user to their role's specific dashboard
    const roleDashboards = {
      patient: '/user/dashboard',
      pharmacy: '/pharmacy/dashboard',
      delivery: '/delivery/dashboard',
      admin: '/admin/dashboard'
    };
    return <Navigate to={roleDashboards[user?.role] || '/login'} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
