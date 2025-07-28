"use client";

import React from 'react';
import { bloxat } from '@/components/fonts';

type FormFieldVariant = 'auth' | 'admin' | 'student' | 'public';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  variant?: FormFieldVariant;
  className?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
}

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  variant?: FormFieldVariant;
  className?: string;
  selectClassName?: string;
  placeholder?: string;
}

interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  variant?: FormFieldVariant;
  className?: string;
  textareaClassName?: string;
  rows?: number;
}

// Common variant styles
const getVariantStyles = (variant: FormFieldVariant) => {
  const variants = {
    auth: {
      label: 'text-tathir-dark-green',
      input: 'bg-white border-tathir-brown text-tathir-dark-green placeholder-tathir-brown/60 focus:border-tathir-dark-green',
      error: 'text-red-600'
    },
    admin: {
      label: 'text-tathir-dark-green',
      input: 'bg-white border-tathir-brown text-tathir-dark-green placeholder-tathir-brown/60 focus:border-tathir-dark-green',
      error: 'text-red-600'
    },
    student: {
      label: 'text-tathir-dark-green',
      input: 'bg-white border-tathir-brown text-tathir-dark-green placeholder-tathir-brown/60 focus:border-tathir-dark-green',
      error: 'text-red-600'
    },
    public: {
      label: 'text-tathir-dark-green',
      input: 'bg-white border-tathir-brown text-tathir-dark-green placeholder-tathir-brown/60 focus:border-tathir-dark-green',
      error: 'text-red-600'
    }
  };
  return variants[variant];
};

// Base input styles
const baseInputStyles = "w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50";

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  variant = 'auth',
  className = "",
  inputClassName = "",
  icon
}) => {
  const styles = getVariantStyles(variant);

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className={`block text-sm font-bold mb-2 ${styles.label} ${bloxat.className}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`${styles.label} opacity-60`}>{icon}</span>
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            ${baseInputStyles}
            ${styles.input}
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${inputClassName}
          `}
        />
      </div>
      {error && (
        <p className={`text-xs mt-1 ${styles.error}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export const FormSelect: React.FC<FormSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  variant = 'auth',
  className = "",
  selectClassName = "",
  placeholder = "Select an option"
}) => {
  const styles = getVariantStyles(variant);

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className={`block text-sm font-bold mb-2 ${styles.label} ${bloxat.className}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`
          ${baseInputStyles}
          ${styles.input}
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${selectClassName}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className={`text-xs mt-1 ${styles.error}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  variant = 'auth',
  className = "",
  textareaClassName = "",
  rows = 4
}) => {
  const styles = getVariantStyles(variant);

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className={`block text-sm font-bold mb-2 ${styles.label} ${bloxat.className}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`
          ${baseInputStyles}
          ${styles.input}
          resize-vertical min-h-[100px]
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${textareaClassName}
        `}
      />
      {error && (
        <p className={`text-xs mt-1 ${styles.error}`}>
          {error}
        </p>
      )}
    </div>
  );
};
