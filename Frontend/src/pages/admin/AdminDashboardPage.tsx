import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLeave } from '../../hooks/useLeave';
import { useAttendance } from '../../hooks/useAttendance';
import { analyticsService } from '../../services/analyticsService';
import { DashboardAnalytics } from '../../types';
import { DashboardCard } from '../../components/common/DashboardCard';
import { ChartCard } from '../../components/common/ChartCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const { user, setSwitchedEmployee } = useAuth();
  const { allLeaves, approveLeave, rejectLeave, fetchAllLeaves } = useLeave();
  const { dailyAttendance, fetchDailyAttendance } = useAttendance();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllLeaves();
    fetchDailyAttendance();
    analyticsService.getDashboardAnalytics().then(setAnalytics);
  }, [fetchAllLeaves, fetchDailyAttendance]);

  const pendingRequests = allLeaves.filter((l) => l.status === 'Pending');

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await approveLeave(id, adminComment);
      setSelectedLeave(null);
      setAdminComment('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsProcessing(true);
    try {
      await rejectLeave(id, adminComment);
      setSelectedLeave(null);
      setAdminComment('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Executive HR Header Banner */}
      <div
        className="df-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(30, 41, 59, 0.95))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--emerald-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            HR & MANAGEMENT ADMINISTRATION DASHBOARD
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
            HR Overview & Workforce Analytics
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
            Managing staff attendance, leave approvals queue, and monthly payroll
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="df-btn df-btn-secondary" onClick={() => navigate('/admin/employees')}>
            <Users size={16} /> Employee Directory
          </button>
          <button className="df-btn df-btn-primary" onClick={() => navigate('/admin/analytics')}>
            <TrendingUp size={16} /> Reports & Analytics
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="df-grid-4">
        <DashboardCard
          title="Total Employees"
          value={analytics?.kpis.totalEmployees || 148}
          subtitle="Active workforce"
          change="+4 New this month"
          isPositive={true}
          icon={<Users size={24} />}
          colorAccent="var(--primary-500)"
          onClick={() => navigate('/admin/employees')}
        />

        <DashboardCard
          title="Today's Attendance"
          value={`${analytics?.kpis.presentPercentage || 91.8}%`}
          subtitle={`${analytics?.kpis.presentToday || 136} Staff Present`}
          change="Real-time presence"
          isPositive={true}
          icon={<Clock size={24} />}
          colorAccent="var(--emerald-500)"
          onClick={() => navigate('/admin/attendance')}
        />

        <DashboardCard
          title="Pending Leave Approvals"
          value={pendingRequests.length}
          subtitle="Requires HR action"
          change={pendingRequests.length > 0 ? 'Urgent Queue' : 'Queue Clear'}
          isPositive={pendingRequests.length === 0}
          icon={<CalendarDays size={24} />}
          colorAccent="var(--amber-500)"
          onClick={() => navigate('/admin/leaves')}
        />

        <DashboardCard
          title="Monthly Payroll"
          value={formatCurrency(analytics?.kpis.monthlyPayrollTotal || 1248000)}
          subtitle="Disbursed this month"
          change="Budget Verified"
          isPositive={true}
          icon={<CreditCard size={24} />}
          colorAccent="var(--purple-500)"
          onClick={() => navigate('/admin/payroll')}
        />
      </div>

      {/* Analytics Visual Grid */}
      <div className="df-grid-2">
        <ChartCard
          title="Weekly Attendance Presence Trend"
          subtitle="Staff present vs absent across workday week"
          type="bar"
          data={analytics?.attendance.weeklyTrend || [
            { day: 'Mon', val: 140 },
            { day: 'Tue', val: 138 },
            { day: 'Wed', val: 142 },
            { day: 'Thu', val: 139 },
            { day: 'Fri', val: 136 },
          ]}
        />

        <ChartCard
          title="Department Payroll Expenditure Breakdown"
          subtitle="Monthly salary budget distribution"
          type="bar"
          data={analytics?.payroll.departmentDistribution || [
            { department: 'Engineering', val: 580000 },
            { department: 'Product', val: 240000 },
            { department: 'Sales', val: 220000 },
            { department: 'HR & Ops', val: 208000 },
          ]}
        />
      </div>

      {/* Leave Approval Queue Table (Explicit Excalidraw requirement) */}
      <div className="df-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Pending Leave Approvals Queue</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Review employee applications and issue instant approval/rejection</span>
          </div>

          <button className="df-btn df-btn-secondary" onClick={() => navigate('/admin/leaves')} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
            Manage All Requests <ArrowRight size={14} />
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} style={{ color: 'var(--emerald-500)', marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.875rem' }}>All leave applications have been reviewed! No pending requests in queue.</p>
          </div>
        ) : (
          <div className="df-table-container">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Date Range</th>
                  <th>Days</th>
                  <th>Reason / Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req) => (
                  <tr key={req.id}>
                    <td><strong>{req.employeeName}</strong></td>
                    <td>{req.department}</td>
                    <td><span className="df-badge df-badge-leave">{req.leaveType}</span></td>
                    <td>{req.startDate} to {req.endDate}</td>
                    <td><strong>{req.totalDays} Days</strong></td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.remarks}</td>
                    <td>
                      <button
                        className="df-btn df-btn-primary"
                        onClick={() => setSelectedLeave(req)}
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Review Request
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Leave Modal with HR Comments */}
      <Modal isOpen={!!selectedLeave} onClose={() => setSelectedLeave(null)} title="Review Leave Application">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Employee:</span> <strong>{selectedLeave?.employeeName}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Department:</span> <strong>{selectedLeave?.department}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Leave Type:</span> <strong>{selectedLeave?.leaveType}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Duration:</span> <strong>{selectedLeave?.startDate} to {selectedLeave?.endDate} ({selectedLeave?.totalDays} Days)</strong></div>
            </div>

            <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Applicant Remarks:</span>
              <p style={{ marginTop: '0.25rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{selectedLeave?.remarks}"</p>
            </div>
          </div>

          <div className="df-form-group">
            <label className="df-label">HR Admin Comments (Optional)</label>
            <input
              type="text"
              className="df-input"
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="e.g. Approved for annual vacation project window"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              className="df-btn df-btn-danger"
              onClick={() => handleReject(selectedLeave.id)}
              disabled={isProcessing}
            >
              <XCircle size={16} /> Reject Request
            </button>

            <button
              className="df-btn df-btn-success"
              onClick={() => handleApprove(selectedLeave.id)}
              disabled={isProcessing}
            >
              <CheckCircle2 size={16} /> Approve Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
