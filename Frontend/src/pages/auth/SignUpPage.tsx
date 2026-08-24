import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FormInput } from '../../components/common/FormInput';
import { SelectInput } from '../../components/common/SelectInput';
import { Mail, Lock, UserCheck, Shield, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { validateEmail, validatePassword, validateEmployeeId } from '../../utils/validators';
import { UserRole } from '../../types';

export const SignUpPage: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [errors, setErrors] = useState<{ employeeId?: string; email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const pwdChecks = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { employeeId?: string; email?: string; password?: string } = {};

    if (!validateEmployeeId(employeeId)) {
      newErrors.employeeId = 'Employee ID must be at least 3 characters long.';
    }

    if (!email) {
      newErrors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid work email address.';
    }

    if (!pwdChecks.isValid) {
      newErrors.password = 'Password does not meet the security requirements below.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await register({ employeeId, email, password, role });
      // Redirect to Email Verification page
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setErrors({ general: err.message || 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create Your Account</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Join Dayflow HRMS workspace
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Employee ID"
          placeholder="e.g. DAY-1001"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          error={errors.employeeId}
          icon={<UserCheck size={18} />}
          required
        />

        <FormInput
          label="Work Email"
          type="email"
          placeholder="your.name@dayflow.io"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<Mail size={18} />}
          required
        />

        <SelectInput
          label="Organizational Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={[
            { value: 'EMPLOYEE', label: 'Employee' },
            { value: 'HR', label: 'HR / Personnel Administrator' },
          ]}
          required
        />

        <FormInput
          label="Password"
          type="password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          icon={<Lock size={18} />}
          required
        />

        {/* Live Password Security Requirements Checklist */}
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '0.875rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Password Security Checklist:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: pwdChecks.hasMinLength ? 'var(--emerald-500)' : 'var(--text-muted)' }}>
              {pwdChecks.hasMinLength ? <CheckCircle size={14} /> : <XCircle size={14} />} 8+ Characters
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: pwdChecks.hasUppercase ? 'var(--emerald-500)' : 'var(--text-muted)' }}>
              {pwdChecks.hasUppercase ? <CheckCircle size={14} /> : <XCircle size={14} />} Uppercase Letter
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: pwdChecks.hasLowercase ? 'var(--emerald-500)' : 'var(--text-muted)' }}>
              {pwdChecks.hasLowercase ? <CheckCircle size={14} /> : <XCircle size={14} />} Lowercase Letter
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: pwdChecks.hasNumber ? 'var(--emerald-500)' : 'var(--text-muted)' }}>
              {pwdChecks.hasNumber ? <CheckCircle size={14} /> : <XCircle size={14} />} Number (0-9)
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="df-btn df-btn-primary"
          style={{ width: '100%', height: '44px' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Creating Account...'
          ) : (
            <>
              <UserPlus size={18} /> Register & Continue
            </>
          )}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        Already registered?{' '}
        <Link to="/login" style={{ color: 'var(--primary-400)', fontWeight: 700 }}>
          Sign in here
        </Link>
      </div>
    </div>
  );
};
