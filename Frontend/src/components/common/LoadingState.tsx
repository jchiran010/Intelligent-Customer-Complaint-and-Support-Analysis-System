import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading Dayflow data...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', color: 'var(--text-secondary)' }}>
      <Loader2 size={36} className="pulse-ring" style={{ color: 'var(--primary-500)', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
