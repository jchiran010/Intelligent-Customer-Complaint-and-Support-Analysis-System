import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="df-form-group">
      <label htmlFor={inputId} className="df-label">
        {label}
        {props.required && <span style={{ color: 'var(--rose-500)', marginLeft: '0.25rem' }}>*</span>}
      </label>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '0.875rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </div>
        )}

        <input
          id={inputId}
          className={`df-input ${error ? 'df-input-error' : ''} ${className}`}
          style={{ paddingLeft: icon ? '2.5rem' : '1rem' }}
          {...props}
        />
      </div>

      {error && <span className="df-error-text">{error}</span>}
      {!error && helperText && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{helperText}</span>}
    </div>
  );
};
