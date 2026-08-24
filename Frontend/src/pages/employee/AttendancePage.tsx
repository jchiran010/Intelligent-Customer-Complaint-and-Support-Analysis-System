import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../hooks/useAttendance';
import { CheckInWidget } from '../../components/attendance/CheckInWidget';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AttendancePage: React.FC = () => {
  const { myAttendance, isLoading, fetchMyAttendance } = useAttendance();
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    fetchMyAttendance();
  }, [fetchMyAttendance]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Attendance Log</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Daily & weekly work hour tracking, check-ins, and logs
          </p>
        </div>

        {/* View Mode Toggle Button */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setViewMode('daily')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'daily' ? 'var(--primary-600)' : 'transparent',
              color: viewMode === 'daily' ? '#FFFFFF' : 'var(--text-secondary)',
            }}
          >
            Daily View
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'weekly' ? 'var(--primary-600)' : 'transparent',
              color: viewMode === 'weekly' ? '#FFFFFF' : 'var(--text-secondary)',
            }}
          >
            Weekly Summary
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>
        {/* Interactive Clock Widget */}
        <CheckInWidget />

        {/* Attendance Logs Table / Grid */}
        <div className="df-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            {viewMode === 'daily' ? 'Recent Daily Clock Records' : 'Weekly Work Breakdown'}
          </h3>

          {isLoading ? (
            <LoadingState message="Fetching your attendance records..." />
          ) : myAttendance.length === 0 ? (
            <EmptyState title="No attendance logs" description="You have no clock-in records logged yet." />
          ) : (
            <div className="df-table-container">
              <table className="df-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                    <th>Location / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttendance.map((rec) => (
                    <tr key={rec.id}>
                      <td><strong>{formatDate(rec.date)}</strong></td>
                      <td>{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                      <td>{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                      <td><strong>{rec.totalHours ? `${rec.totalHours} hrs` : '--'}</strong></td>
                      <td><StatusBadge status={rec.status} /></td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.location || rec.notes || 'Verified'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
