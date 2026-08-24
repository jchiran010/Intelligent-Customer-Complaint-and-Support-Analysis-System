import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading data.',
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        margin: '1rem 0',
      }}
    >
      <AlertTriangle size={24} style={{ color: 'var(--rose-500)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--rose-500)' }}>{title}</h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{message}</p>
      </div>
      {onRetry && (
        <button className="df-btn df-btn-secondary" onClick={onRetry} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
};
