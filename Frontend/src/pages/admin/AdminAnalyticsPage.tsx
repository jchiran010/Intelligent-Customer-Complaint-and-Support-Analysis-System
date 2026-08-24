import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { DashboardAnalytics } from '../../types';
import { ChartCard } from '../../components/common/ChartCard';
import { LoadingState } from '../../components/common/LoadingState';
import { BarChart3, TrendingUp, PieChart, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboardAnalytics().then((data) => {
      setAnalytics(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !analytics) {
    return <LoadingState message="Computing real-time analytics telemetry..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Analytics & Intelligence Dashboard</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Real-time organizational KPI metrics, attendance distributions, leave stats, and payroll trends
        </p>
      </div>

      {/* KPI Overview */}
      <div className="df-grid-3">
        <div className="df-card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            ATTENDANCE PRESENT RATE
          </span>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--emerald-500)', marginTop: '0.25rem' }}>
            {analytics.kpis.presentPercentage}%
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {analytics.kpis.presentToday} Present out of {analytics.kpis.totalEmployees} Employees
          </span>
        </div>

        <div className="df-card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            TOTAL APPROVED LEAVES
          </span>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-400)', marginTop: '0.25rem' }}>
            {analytics.leaves.approvedCount} Requests
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {analytics.leaves.pendingCount} Pending Approval Queue
          </span>
        </div>

        <div className="df-card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            MONTHLY PAYROLL SPEND
          </span>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--purple-500)', marginTop: '0.25rem' }}>
            {formatCurrency(analytics.payroll.totalExpenditure)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Average Employee Salary: {formatCurrency(analytics.payroll.averageSalary)}
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="df-grid-2">
        <ChartCard
          title="Attendance Distribution Breakdown"
          subtitle="Present vs Absent vs Leave metrics"
          type="donut"
          data={[
            { label: 'Present Staff', count: analytics.attendance.presentCount },
            { label: 'On Leave', count: analytics.attendance.leaveCount },
            { label: 'Absent', count: analytics.attendance.absentCount },
          ]}
        />

        <ChartCard
          title="Leave Type Distribution"
          subtitle="Paid vs Sick vs Unpaid leave claims"
          type="bar"
          data={analytics.leaves.typeDistribution.map((t) => ({ label: t.type, val: t.count }))}
        />

        <ChartCard
          title="Department Payroll Spending"
          subtitle="Budget allocated per department"
          type="bar"
          data={analytics.payroll.departmentDistribution.map((d) => ({ label: d.department, amount: d.amount }))}
        />

        <ChartCard
          title="Monthly Payroll Trend"
          subtitle="Payroll expenditure trajectory over past 4 months"
          type="bar"
          data={analytics.payroll.monthlyTrend.map((m) => ({ label: m.month, amount: m.amount }))}
        />
      </div>
    </div>
  );
};
