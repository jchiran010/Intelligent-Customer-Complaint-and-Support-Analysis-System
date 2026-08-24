import React from 'react';
import { AttendanceStatus, LeaveStatus } from '../../types';

interface StatusBadgeProps {
  status: AttendanceStatus | LeaveStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toLowerCase().replace('-', '');

  let badgeClass = 'df-badge-pending';
  let dotColor = '#F59E0B';

  if (normalized.includes('present') || normalized.includes('approved') || normalized.includes('active') || normalized.includes('paid')) {
    badgeClass = 'df-badge-present';
    dotColor = '#10B981';
  } else if (normalized.includes('absent') || normalized.includes('rejected') || normalized.includes('inactive')) {
    badgeClass = 'df-badge-absent';
    dotColor = '#EF4444';
  } else if (normalized.includes('half')) {
    badgeClass = 'df-badge-halfday';
    dotColor = '#F59E0B';
  } else if (normalized.includes('leave')) {
    badgeClass = 'df-badge-leave';
    dotColor = '#8B5CF6';
  }

  return (
    <span className={`df-badge ${badgeClass}`}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor }}></span>
      {status}
    </span>
  );
};
