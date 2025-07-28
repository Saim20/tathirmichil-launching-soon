"use client";

import React from 'react';
import { bloxat } from '@/components/fonts';

type PageHeaderVariant = 'admin' | 'student' | 'public';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  variant?: PageHeaderVariant;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
  variant = 'admin',
  className = "",
  titleClassName = "",
  descriptionClassName = ""
}) => {
  // Variant-specific styles
  const variantStyles = {
    admin: {
      container: "bg-tathir-dark-green border-tathir-maroon",
      title: "text-tathir-cream",
      description: "text-tathir-light-green"
    },
    student: {
      container: "bg-tathir-dark-green border-tathir-maroon",
      title: "text-tathir-cream",
      description: "text-tathir-light-green"
    },
    public: {
      container: "bg-tathir-dark-green border-tathir-maroon",
      title: "text-tathir-cream",
      description: "text-tathir-light-green"
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.container} rounded-xl p-4 sm:p-6 mb-6 shadow-xl border-2 sm:border-4 ${className}`}>
      <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${styles.title} ${bloxat.className} ${titleClassName}`}>
        {title}
      </h1>
      {description && (
        <p className={`text-sm sm:text-base ${styles.description} ${descriptionClassName}`}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
};
