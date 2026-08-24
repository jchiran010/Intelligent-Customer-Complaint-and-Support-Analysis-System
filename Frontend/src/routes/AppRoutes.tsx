import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Auth Pages
import { SignInPage } from '../pages/auth/SignInPage';
import { SignUpPage } from '../pages/auth/SignUpPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';

// Employee Pages
import { EmployeeDashboardPage } from '../pages/employee/EmployeeDashboardPage';
import { ProfilePage } from '../pages/employee/ProfilePage';
import { ProfileEditPage } from '../pages/employee/ProfileEditPage';
import { AttendancePage } from '../pages/employee/AttendancePage';
import { LeavePage } from '../pages/employee/LeavePage';
import { PayrollPage } from '../pages/employee/PayrollPage';
import { NotificationsPage } from '../pages/employee/NotificationsPage';

// Admin / HR Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { EmployeesPage } from '../pages/admin/EmployeesPage';
import { AdminAttendancePage } from '../pages/admin/AdminAttendancePage';
import { AdminLeavesPage } from '../pages/admin/AdminLeavesPage';
import { AdminPayrollPage } from '../pages/admin/AdminPayrollPage';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Employee Routes */}
          <Route element={<RoleRoute allowedRoles={['EMPLOYEE', 'HR', 'ADMIN']} />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
            <Route path="/employee/profile" element={<ProfilePage />} />
            <Route path="/employee/profile/edit" element={<ProfileEditPage />} />
            <Route path="/employee/attendance" element={<AttendancePage />} />
            <Route path="/employee/leave" element={<LeavePage />} />
            <Route path="/employee/payroll" element={<PayrollPage />} />
            <Route path="/employee/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Admin / HR Routes */}
          <Route element={<RoleRoute allowedRoles={['HR', 'ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/employees" element={<EmployeesPage />} />
            <Route path="/admin/attendance" element={<AdminAttendancePage />} />
            <Route path="/admin/leaves" element={<AdminLeavesPage />} />
            <Route path="/admin/payroll" element={<AdminPayrollPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Default Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
