"use client";

import React from 'react';
import { bloxat } from '@/components/fonts';
import { Button } from '../ui/Button';

interface InfoCardProps {
  title: string;
  description?: string;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  image?: string;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      loading?: boolean;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
  variant?: 'admin' | 'student' | 'public';
  className?: string;
  imageClassName?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  content,
  icon,
  image,
  actions,
  variant = 'admin',
  className = "",
  imageClassName = ""
}) => {
  const variantStyles = {
    admin: {
      container: 'bg-tathir-cream border-tathir-brown text-tathir-dark-green',
      title: 'text-tathir-dark-green',
      description: 'text-tathir-brown',
      icon: 'text-tathir-dark-green'
    },
    student: {
      container: 'bg-tathir-cream border-tathir-brown text-tathir-dark-green',
      title: 'text-tathir-dark-green',
      description: 'text-tathir-brown',
      icon: 'text-tathir-dark-green'
    },
    public: {
      container: 'bg-tathir-cream border-tathir-brown text-tathir-dark-green',
      title: 'text-tathir-dark-green',
      description: 'text-tathir-brown',
      icon: 'text-tathir-dark-green'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.container} rounded-xl border-2 sm:border-4 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${className}`}>
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className={`w-full h-full object-cover ${imageClassName}`}
          />
        </div>
      )}
      
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          {icon && (
            <div className={`text-2xl flex-shrink-0 ${styles.icon}`}>
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h3 className={`text-lg sm:text-xl font-bold mb-2 ${styles.title} ${bloxat.className}`}>
              {title}
            </h3>
            {description && (
              <p className={`text-sm sm:text-base ${styles.description}`}>
                {description}
              </p>
            )}
          </div>
        </div>

        {content && (
          <div className="mb-4">
            {content}
          </div>
        )}

        {actions && (actions.primary || actions.secondary) && (
          <div className="flex gap-3 pt-4 border-t border-current/20">
            {actions.primary && (
              <Button
                variant="primary"
                onClick={actions.primary.onClick}
                disabled={actions.primary.loading}
                className="flex-1"
              >
                {actions.primary.loading ? 'Loading...' : actions.primary.label}
              </Button>
            )}
            {actions.secondary && (
              <Button
                variant="secondary"
                onClick={actions.secondary.onClick}
                className="flex-1"
              >
                {actions.secondary.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
