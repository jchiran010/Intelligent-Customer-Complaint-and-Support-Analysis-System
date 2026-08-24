import React from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, #1E1B4B 0%, #0F172A 70%)',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '440px', zIndex: 10 }}>
        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-500))',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
              color: '#FFFFFF',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={30} />
          </div>

          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #FFFFFF, #94A3B8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            DAYFLOW
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--primary-300)', fontWeight: 600, marginTop: '0.25rem' }}>
            Every workday, perfectly aligned.
          </p>
        </div>

        {/* Auth Content Card */}
        <div className="df-card animate-fade-in" style={{ padding: '2.25rem' }}>
          <Outlet />
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          © 2026 DAYFLOW HRMS. Enterprise Security & JWT Authenticated.
        </div>
      </div>
    </div>
  );
};
