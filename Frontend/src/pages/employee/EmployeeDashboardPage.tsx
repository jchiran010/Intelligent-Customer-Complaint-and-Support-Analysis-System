import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAttendance } from '../../hooks/useAttendance';
import { useLeave } from '../../hooks/useLeave';
import { usePayroll } from '../../hooks/usePayroll';
import { CheckInWidget } from '../../components/attendance/CheckInWidget';
import { DashboardCard } from '../../components/common/DashboardCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  UserCheck,
  Clock,
  CalendarDays,
  CreditCard,
  Bell,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { myAttendance, fetchMyAttendance } = useAttendance();
  const { myLeaves, balances, fetchMyLeaves } = useLeave();
  const { myPayroll, fetchMyPayroll } = usePayroll();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyAttendance();
    fetchMyLeaves();
    fetchMyPayroll();
  }, [fetchMyAttendance, fetchMyLeaves, fetchMyPayroll]);

  const presentDays = myAttendance.filter((r) => r.status === 'Present').length;
  const pendingLeaves = myLeaves.filter((l) => l.status === 'Pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div
        className="df-card"
        style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.4), rgba(30, 41, 59, 0.8))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-300)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            EMPLOYEE WORKSPACE DASHBOARD
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
            Welcome back, {user?.name || 'Alex Vance'} 👋
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.375rem', maxWidth: '600px' }}>
            {user?.designation || 'Senior Frontend Engineer'} • {user?.department || 'Engineering'} Department
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="df-btn df-btn-secondary" onClick={() => navigate('/employee/profile')}>
            <UserCheck size={16} /> View Profile
          </button>
          <button className="df-btn df-btn-primary" onClick={() => navigate('/employee/leave')}>
            <CalendarDays size={16} /> Apply Leave
          </button>
        </div>
      </div>

      {/* Required Excalidraw Quick-Access Modules Cards */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
          Quick Access Modules
        </h3>

        <div className="df-grid-4">
          <DashboardCard
            title="My Profile"
            value="View & Edit"
            subtitle={`${user?.employeeId || 'DAY-1001'} • Full-Time`}
            icon={<UserCheck size={24} />}
            colorAccent="var(--primary-500)"
            onClick={() => navigate('/employee/profile')}
          />

          <DashboardCard
            title="Attendance"
            value={`${presentDays} Days`}
            subtitle="Logged this month"
            change="+98% On-Time"
            isPositive={true}
            icon={<Clock size={24} />}
            colorAccent="var(--emerald-500)"
            onClick={() => navigate('/employee/attendance')}
          />

          <DashboardCard
            title="Leave Requests"
            value={`${balances?.paidLeaveRemaining || 15} Days`}
            subtitle={`${pendingLeaves} Pending Approval`}
            change="Quota Available"
            isPositive={true}
            icon={<CalendarDays size={24} />}
            colorAccent="var(--amber-500)"
            onClick={() => navigate('/employee/leave')}
          />

          <DashboardCard
            title="Salary & Payroll"
            value={formatCurrency(myPayroll?.salaryStructure?.netSalary || 8750)}
            subtitle="Net monthly payout"
            change="Read-Only Transparency"
            isPositive={true}
            icon={<CreditCard size={24} />}
            colorAccent="var(--purple-500)"
            onClick={() => navigate('/employee/payroll')}
          />
        </div>
      </div>

      {/* Interactive Main Dashboard Grid: Check-in Clock + Recent Activity & Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }} className="df-grid-responsive">
        {/* Left: Quick Clock Check-In Widget */}
        <CheckInWidget />

        {/* Right: Recent Leave Status & Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Leave Status Card */}
          <div className="df-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Leave Requests</h4>
              <button
                className="df-btn df-btn-secondary"
                onClick={() => navigate('/employee/leave')}
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            {myLeaves.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No recent leave requests.</p>
            ) : (
              <div className="df-table-container">
                <table className="df-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaves.slice(0, 3).map((lve) => (
                      <tr key={lve.id}>
                        <td><strong>{lve.leaveType}</strong></td>
                        <td>{lve.startDate} to {lve.endDate}</td>
                        <td>{lve.totalDays} Days</td>
                        <td><StatusBadge status={lve.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="df-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Workday Activity</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-500)', borderRadius: '50%' }}>
                  <Clock size={16} />
                </div>
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Attendance Clocked-In
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Checked in at 09:02 AM today (SF HQ Office).</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)', borderRadius: '50%' }}>
                  <CreditCard size={16} />
                </div>
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Pay Slip Released
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>July 2026 Salary Slip is ready for download.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
