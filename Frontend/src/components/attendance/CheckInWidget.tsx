import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import { Clock, Play, Square, MapPin, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const CheckInWidget: React.FC = () => {
  const { user } = useAuth();
  const { myAttendance, checkIn, checkOut, isLoading } = useAttendance();
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = myAttendance.find((r) => r.date === todayStr);

  const isCheckedIn = !!todayRecord?.checkInTime && !todayRecord?.checkOutTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
      setDateString(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleToggleClock = async () => {
    if (!user) return;
    if (!isCheckedIn && !isCheckedOut) {
      await checkIn({ employeeId: user.employeeId, location: 'San Francisco HQ (Verified)' });
    } else if (isCheckedIn) {
      await checkOut({ employeeId: user.employeeId, notes: 'Day end clock out' });
    }
  };

  return (
    <div
      className="df-card"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: 'var(--radius-md)', color: 'var(--primary-400)' }}>
            <Clock size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Attendance Quick Clock</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dateString || 'Today'}</span>
          </div>
        </div>

        <StatusBadge status={isCheckedOut ? 'Completed' : isCheckedIn ? 'Present' : 'Not Checked In'} />
      </div>

      <div style={{ textAlign: 'center', padding: '1rem 0', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-family-mono)', color: 'var(--primary-300)' }}>
          {timeString || '12:00:00 PM'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <MapPin size={12} style={{ color: 'var(--emerald-500)' }} />
          <span>San Francisco HQ Office (IP Auto-Detected)</span>
        </div>
      </div>

      <button
        onClick={handleToggleClock}
        disabled={isLoading || isCheckedOut}
        className={`df-btn ${isCheckedIn ? 'df-btn-danger' : 'df-btn-success'}`}
        style={{ width: '100%', height: '48px', fontSize: '0.9375rem' }}
      >
        {isCheckedOut ? (
          <>
            <CheckCircle2 size={18} /> Shift Completed Today
          </>
        ) : isCheckedIn ? (
          <>
            <Square size={18} /> Clock Out Now
          </>
        ) : (
          <>
            <Play size={18} /> Check-In Now
          </>
        )}
      </button>

      {todayRecord?.checkInTime && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
          <span>Check In: <strong>{new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
          <span>Check Out: <strong>{todayRecord.checkOutTime ? new Date(todayRecord.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</strong></span>
        </div>
      )}
    </div>
  );
};
