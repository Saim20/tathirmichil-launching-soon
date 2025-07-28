"use client";

import React from 'react';

interface FormFieldProps {
  label?: string;
  labelAlt?: string;
  children: React.ReactNode;
  className?: string;
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'light' | 'dark';
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'light' | 'dark';
  children: React.ReactNode;
}

interface LabelProps {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  labelAlt,
  children,
  className = ""
}) => {
  return (
    <div className={`form-control ${className}`}>
      {(label || labelAlt) && (
        <div className="label">
          {label && <span className="label-text text-tathir-cream">{label}</span>}
          {labelAlt && <span className="label-text-alt text-tathir-light-green">{labelAlt}</span>}
        </div>
      )}
      {children}
    </div>
  );
};

export const FormInput: React.FC<FormInputProps> = ({
  variant = 'dark',
  className = "",
  ...props
}) => {
  const baseClasses = "input input-bordered w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-tathir-light-green focus:border-tathir-light-green";
  const variantClasses = variant === 'dark' 
    ? "bg-tathir-beige text-tathir-dark-green border-tathir-brown"
    : "bg-tathir-cream text-tathir-dark-green border-tathir-brown";
    
  return (
    <input
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    />
  );
};

export const FormSelect: React.FC<FormSelectProps> = ({
  variant = 'dark',
  className = "",
  children,
  ...props
}) => {
  const baseClasses = "select select-bordered w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-tathir-light-green focus:border-tathir-light-green";
  const variantClasses = variant === 'dark' 
    ? "bg-tathir-beige text-tathir-dark-green border-tathir-brown"
    : "bg-tathir-cream text-tathir-dark-green border-tathir-brown";
    
  return (
    <select
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

export const FormLabel: React.FC<LabelProps> = ({
  variant = 'light',
  className = "",
  children
}) => {
  const colorClass = variant === 'light' 
    ? "text-tathir-dark-green" 
    : "text-tathir-cream";
    
  return (
    <label className={`text-xs mb-1 block font-medium ${colorClass} ${className}`}>
      {children}
    </label>
  );
};
