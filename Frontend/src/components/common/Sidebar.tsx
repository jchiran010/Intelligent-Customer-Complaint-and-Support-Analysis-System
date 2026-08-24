import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import {
  LayoutDashboard,
  UserCheck,
  Clock,
  CalendarDays,
  CreditCard,
  BarChart3,
  Bell,
  Users,
  LogOut,
  FileSpreadsheet,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeRoleView, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employeeNavItems = [
    { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/employee/profile', icon: UserCheck },
    { label: 'Attendance', path: '/employee/attendance', icon: Clock },
    { label: 'Leave & Time-Off', path: '/employee/leave', icon: CalendarDays },
    { label: 'Payroll', path: '/employee/payroll', icon: CreditCard },
    { label: 'Notifications', path: '/employee/notifications', icon: Bell, badge: unreadCount },
  ];

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/admin/employees', icon: Users },
    { label: 'Attendance', path: '/admin/attendance', icon: Clock },
    { label: 'Leave Requests', path: '/admin/leaves', icon: CalendarDays },
    { label: 'Payroll', path: '/admin/payroll', icon: CreditCard },
    { label: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Reports Export', path: '/admin/reports', icon: FileSpreadsheet },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell, badge: unreadCount },
  ];

  const navItems = activeRoleView === 'EMPLOYEE' ? employeeNavItems : adminNavItems;

  return (
    <aside
      style={{
        width: '260px',
        minHeight: 'calc(100vh - 72px)',
        background: 'var(--bg-card)',
        backdropFilter: 'var(--backdrop-blur)',
        borderRight: 'var(--glass-border)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <div>
        <div style={{ padding: '0 0.75rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            MAIN NAVIGATION ({activeRoleView})
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  background: isActive ? 'linear-gradient(135deg, var(--primary-600), var(--primary-500))' : 'transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span
                    style={{
                      background: 'var(--rose-500)',
                      color: '#FFFFFF',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      padding: '0.125rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer / Logout */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--rose-500)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
