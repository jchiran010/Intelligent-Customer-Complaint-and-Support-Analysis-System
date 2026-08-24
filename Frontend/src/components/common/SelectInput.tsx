import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  error,
  id,
  ...props
}) => {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="df-form-group">
      <label htmlFor={selectId} className="df-label">
        {label}
        {props.required && <span style={{ color: 'var(--rose-500)', marginLeft: '0.25rem' }}>*</span>}
      </label>

      <select
        id={selectId}
        className={`df-input ${error ? 'df-input-error' : ''}`}
        style={{ cursor: 'pointer' }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <span className="df-error-text">{error}</span>}
    </div>
  );
};
