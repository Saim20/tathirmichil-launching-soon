"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'admin' | 'student' | 'public';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'admin',
  className = "",
  text
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variantStyles = {
    admin: {
      spinner: 'border-tathir-dark-green border-t-transparent',
      text: 'text-tathir-dark-green'
    },
    student: {
      spinner: 'border-tathir-dark-green border-t-transparent',
      text: 'text-tathir-dark-green'
    },
    public: {
      spinner: 'border-tathir-dark-green border-t-transparent',
      text: 'text-tathir-dark-green'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div 
        className={`${sizeStyles[size]} ${styles.spinner} border-4 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className={`text-sm font-medium ${styles.text}`}>
          {text}
        </p>
      )}
    </div>
  );
};
