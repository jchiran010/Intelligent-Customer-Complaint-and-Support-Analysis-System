import React from 'react';
import { useNotification } from '../../hooks/useNotification';
import { CheckCheck, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();

  return (
    <div
      className="df-card animate-fade-in"
      style={{
        position: 'absolute',
        right: 0,
        top: 'calc(100% + 12px)',
        width: '360px',
        maxHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-xl)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <span style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Notifications</span>
        {notifications.length > 0 && (
          <button
            onClick={() => markAllAsRead()}
            style={{
              fontSize: '0.75rem',
              color: 'var(--primary-400)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '340px' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BellOff size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.8125rem' }}>No new notifications</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              style={{
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: item.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                cursor: 'pointer',
                transition: 'background-color 150ms',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: item.isRead ? 'var(--text-primary)' : 'var(--primary-300)' }}>
                  {item.title}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {formatDate(item.timestamp)}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {item.message}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          background: 'var(--bg-surface)',
        }}
      >
        <button
          onClick={() => {
            onClose();
            navigate('/employee/notifications');
          }}
          style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-400)' }}
        >
          View Full Notifications History →
        </button>
      </div>
    </div>
  );
};
