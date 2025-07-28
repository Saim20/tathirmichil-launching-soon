import React from "react";

type InputProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
};

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
}) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 6, fontWeight: 500 }}>
    <span style={{ marginBottom: 4, color: error ? '#d32f2f' : '#222', fontSize: 15 }}>
      {label} {required && <span style={{ color: '#d32f2f' }}>*</span>}
    </span>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={{
        padding: '10px 12px',
        borderRadius: 6,
        border: error ? '1.5px solid #d32f2f' : '1.5px solid #bdbdbd',
        outline: 'none',
        fontSize: 15,
        transition: 'border-color 0.2s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
      onFocus={e => (e.currentTarget.style.borderColor = error ? '#d32f2f' : '#1976d2')}
      onBlur={e => (e.currentTarget.style.borderColor = error ? '#d32f2f' : '#bdbdbd')}
      onMouseOver={e => (e.currentTarget.style.borderColor = error ? '#d32f2f' : '#1976d2')}
      onMouseOut={e => (e.currentTarget.style.borderColor = error ? '#d32f2f' : '#bdbdbd')}
      aria-invalid={!!error}
      aria-describedby={helperText ? `${label}-helper-text` : error ? `${label}-error-text` : undefined}
    />
    {helperText && !error && (
      <span id={`${label}-helper-text`} style={{ color: '#757575', fontSize: 13, marginTop: 2 }}>{helperText}</span>
    )}
    {error && (
      <span id={`${label}-error-text`} style={{ color: '#d32f2f', fontSize: 13, marginTop: 2 }}>{error}</span>
    )}
  </label>
);

export default Input; 