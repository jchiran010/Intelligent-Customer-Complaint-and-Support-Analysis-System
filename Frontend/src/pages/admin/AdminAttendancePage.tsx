import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../hooks/useAttendance';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { Clock, Filter, Calendar, Search } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AdminAttendancePage: React.FC = () => {
  const { dailyAttendance, isLoading, fetchDailyAttendance } = useAttendance();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchDailyAttendance(selectedDate);
  }, [selectedDate, fetchDailyAttendance]);

  const filteredRecords = dailyAttendance.filter((rec) => {
    return filterStatus === 'ALL' || rec.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Organizational Attendance Monitor</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Real-time daily presence, check-in logs, and timecard adjustments
          </p>
        </div>
      </div>

      {/* Date & Status Filter Bar */}
      <div className="df-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} style={{ color: 'var(--primary-400)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Date:</span>
          <input
            type="date"
            className="df-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: '180px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          <Filter size={18} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter Status:</span>
          <select
            className="df-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: '160px', cursor: 'pointer' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Half-day">Half-day</option>
            <option value="Leave">Leave</option>
          </select>
        </div>
      </div>

      {/* Attendance Logs Master Table */}
      <div className="df-card">
        {isLoading ? (
          <LoadingState message="Loading workforce attendance logs..." />
        ) : (
          <div className="df-table-container">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th>Location / Verification</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td><strong>{rec.employeeName}</strong></td>
                    <td><strong>{rec.employeeId}</strong></td>
                    <td>{formatDate(rec.date)}</td>
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
  );
};
