"use client";

import React from 'react';
import { bloxat } from '@/components/fonts';

type ContentContainerVariant = 'admin' | 'student' | 'public';

interface ContentContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  variant?: ContentContainerVariant;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  noPadding?: boolean;
}

export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  title,
  description,
  variant = 'admin',
  className = "",
  contentClassName = "",
  titleClassName = "",
  descriptionClassName = "",
  noPadding = false
}) => {
  // Variant-specific styles
  const variantStyles = {
    admin: {
      container: "bg-tathir-cream border-tathir-brown text-tathir-dark-green",
      title: "text-tathir-dark-green",
      description: "text-tathir-brown"
    },
    student: {
      container: "bg-tathir-cream border-tathir-brown text-tathir-dark-green",
      title: "text-tathir-dark-green",
      description: "text-tathir-brown"
    },
    public: {
      container: "bg-tathir-cream border-tathir-brown text-tathir-dark-green",
      title: "text-tathir-dark-green",
      description: "text-tathir-brown"
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.container} rounded-xl border-2 sm:border-4 shadow-xl mb-6 ${className}`}>
      {(title || description) && (
        <div className={`${noPadding ? 'p-4 sm:p-6 pb-0' : 'p-4 sm:p-6 border-b-2 border-current mb-4'}`}>
          {title && (
            <h2 className={`text-lg sm:text-xl font-bold mb-2 ${styles.title} ${bloxat.className} ${titleClassName}`}>
              {title}
            </h2>
          )}
          {description && (
            <p className={`text-sm sm:text-base ${styles.description} ${descriptionClassName}`}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-4 sm:p-6'} ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};
