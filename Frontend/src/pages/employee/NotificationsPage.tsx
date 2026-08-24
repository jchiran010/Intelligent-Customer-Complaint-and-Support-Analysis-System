import React from 'react';
import { useNotification } from '../../hooks/useNotification';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Notification Telemetry Center</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Real-time Socket.IO alerts, leave updates, and system announcements
          </p>
        </div>

        {notifications.length > 0 && (
          <button className="df-btn df-btn-secondary" onClick={() => markAllAsRead()}>
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      <div className="df-card">
        {notifications.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={48} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>No Notifications</h4>
            <p style={{ fontSize: '0.8125rem' }}>You're all caught up! New real-time alerts will appear here automatically.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  background: notif.isRead ? 'var(--bg-surface)' : 'rgba(99, 102, 241, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  borderLeft: `4px solid ${notif.isRead ? 'var(--border-color)' : 'var(--primary-500)'}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{notif.title}</strong>
                    {!notif.isRead && (
                      <span className="df-badge df-badge-present" style={{ fontSize: '0.6875rem' }}>NEW</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', marginTop: '0.375rem', lineHeight: 1.5 }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                    {formatDate(notif.timestamp)}
                  </span>
                </div>

                {!notif.isRead && (
                  <button className="df-btn df-btn-secondary" onClick={() => markAsRead(notif.id)} style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
