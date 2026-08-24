import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { useNotification } from '../hooks/useNotification';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} style={{ color: 'var(--emerald-500)' }} />;
      case 'error': return <AlertOctagon size={18} style={{ color: 'var(--rose-500)' }} />;
      case 'warning': return <AlertTriangle size={18} style={{ color: 'var(--amber-500)' }} />;
      default: return <Info size={18} style={{ color: 'var(--primary-400)' }} />;
    }
  };

  return (
    <div className="df-layout-container">
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Header />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <main className="df-main-content">
            <div className="df-page-body animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Floating Toast Notification Alerts */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '380px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="df-card animate-slide-in"
            style={{
              pointerEvents: 'auto',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              boxShadow: 'var(--shadow-xl)',
              background: 'var(--bg-surface)',
              borderLeft: `4px solid ${
                toast.type === 'success' ? 'var(--emerald-500)' : toast.type === 'error' ? 'var(--rose-500)' : 'var(--primary-500)'
              }`,
            }}
          >
            <div style={{ marginTop: '0.125rem' }}>{getToastIcon(toast.type)}</div>
            <div style={{ flex: 1 }}>
              <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{toast.title}</h5>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem', lineHeight: 1.4 }}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '0.125rem' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
