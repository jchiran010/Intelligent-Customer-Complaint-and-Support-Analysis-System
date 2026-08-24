import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, activeRoleView } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if activeRoleView or actual user.role is permitted
  const currentRole = activeRoleView || user.role;
  const isAllowed = allowedRoles.includes(currentRole);

  if (!isAllowed) {
    return <Navigate to={user.role === 'EMPLOYEE' ? '/employee/dashboard' : '/admin/dashboard'} replace />;
  }

  return <Outlet />;
};
