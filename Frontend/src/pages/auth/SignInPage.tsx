import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FormInput } from '../../components/common/FormInput';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { validateEmail } from '../../utils/validators';

export const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await login({ email, password });
      // Redirect handled by AuthContext / ProtectedRoute based on user role!
      if (email.toLowerCase().includes('hr') || email.toLowerCase().includes('admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'Incorrect credentials. Please verify your email and password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome back</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Sign in to your Dayflow HRMS portal
        </p>
      </div>

      {errors.general && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--rose-500)',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Work Email"
          type="email"
          placeholder="alex.vance@dayflow.io"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<Mail size={18} />}
          required
        />

        <FormInput
          label="Password"
          type="password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          icon={<Lock size={18} />}
          required
        />

        {/* Demo Quick Logins snippet */}
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Quick Demo Logins:</span>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('alex.vance@dayflow.io');
                setPassword('UserPass123!');
              }}
              style={{ fontSize: '0.75rem', color: 'var(--primary-400)', textDecoration: 'underline' }}
            >
              Employee (Alex)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setEmail('hr@dayflow.io');
                setPassword('HrAdmin123!');
              }}
              style={{ fontSize: '0.75rem', color: 'var(--emerald-500)', textDecoration: 'underline' }}
            >
              HR Admin (Elena)
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="df-btn df-btn-primary"
          style={{ width: '100%', height: '44px', marginTop: '0.5rem' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Signing in...'
          ) : (
            <>
              <LogIn size={18} /> Sign In
            </>
          )}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        Don't have an account yet?{' '}
        <Link to="/signup" style={{ color: 'var(--primary-400)', fontWeight: 700 }}>
          Create an account
        </Link>
      </div>
    </div>
  );
};
