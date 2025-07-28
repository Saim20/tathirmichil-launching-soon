"use client";

import React from 'react';
import { Button } from './Button';
import { bloxat } from '@/components/fonts';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'admin' | 'student' | 'public';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  variant = 'admin',
  className = ""
}) => {
  // Variant-specific styles
  const variantStyles = {
    admin: {
      container: "text-tathir-dark-green",
      title: "text-tathir-dark-green",
      description: "text-tathir-brown",
      icon: "text-tathir-brown/60"
    },
    student: {
      container: "text-tathir-dark-green",
      title: "text-tathir-dark-green",
      description: "text-tathir-brown",
      icon: "text-tathir-brown/60"
    },
    public: {
      container: "text-tathir-dark-green",
      title: "text-tathir-dark-green",
      description: "text-tathir-brown",
      icon: "text-tathir-brown/60"
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${styles.container} ${className}`}>
      {icon && (
        <div className={`text-4xl sm:text-6xl mb-4 ${styles.icon}`}>
          {icon}
        </div>
      )}
      <h3 className={`text-lg sm:text-xl font-bold mb-2 ${styles.title} ${bloxat.className}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-sm sm:text-base mb-6 max-w-md ${styles.description}`}>
          {description}
        </p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
