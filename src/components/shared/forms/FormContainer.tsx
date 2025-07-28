"use client";

import React from 'react';
import { bloxat } from '@/components/fonts';

type FormContainerVariant = 'auth' | 'admin' | 'student' | 'public';

interface FormContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: FormContainerVariant;
  className?: string;
  contentClassName?: string;
  backgroundImage?: string;
}

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  title,
  subtitle,
  variant = 'auth',
  className = "",
  contentClassName = "",
  backgroundImage
}) => {
  // Variant-specific styles
  const variantStyles = {
    auth: {
      container: "min-h-screen bg-tathir-beige flex items-center justify-center p-4",
      card: "bg-tathir-cream border-tathir-brown shadow-xl",
      title: "text-tathir-dark-green",
      subtitle: "text-tathir-brown"
    },
    admin: {
      container: "w-full",
      card: "bg-tathir-cream border-tathir-brown",
      title: "text-tathir-dark-green",
      subtitle: "text-tathir-brown"
    },
    student: {
      container: "w-full",
      card: "bg-tathir-cream border-tathir-brown",
      title: "text-tathir-dark-green",
      subtitle: "text-tathir-brown"
    },
    public: {
      container: "w-full",
      card: "bg-tathir-cream border-tathir-brown",
      title: "text-tathir-dark-green",
      subtitle: "text-tathir-brown"
    }
  };

  const styles = variantStyles[variant];

  const cardContent = (
    <div className={`${styles.card} rounded-xl border-2 sm:border-4 p-6 sm:p-8 w-full max-w-md ${contentClassName}`}>
      {(title || subtitle) && (
        <div className="text-center mb-6">
          {title && (
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${styles.title} ${bloxat.className}`}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className={`text-sm sm:text-base ${styles.subtitle}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );

  if (variant === 'auth') {
    return (
      <div 
        className={`${styles.container} ${className}`}
        style={backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}}
      >
        {backgroundImage && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        )}
        <div className="relative z-10">
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {cardContent}
    </div>
  );
};
