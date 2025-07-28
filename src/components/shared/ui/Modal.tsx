"use client";

import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { bloxat } from '@/components/fonts';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'admin' | 'student' | 'public';
  className?: string;
  closeOnOverlayClick?: boolean;
  showClose?: boolean;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      loading?: boolean;
      variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'admin',
  className = "",
  closeOnOverlayClick = true,
  showClose = true,
  actions
}) => {
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const variantStyles = {
    admin: {
      overlay: 'bg-black/50',
      container: 'bg-tathir-cream border-tathir-brown text-tathir-dark-green',
      title: 'text-tathir-dark-green',
      closeButton: 'text-tathir-brown hover:text-tathir-dark-green'
    },
    student: {
      overlay: 'bg-black/50',
      container: 'bg-tathir-cream border-tathir-brown text-tathir-dark-green',
      title: 'text-tathir-dark-green',
      closeButton: 'text-tathir-brown hover:text-tathir-dark-green'
    },
    public: {
      overlay: 'bg-black/50',
      container: 'bg-tathir-cream border-tathir-brown text-tathir-dark-green',
      title: 'text-tathir-dark-green',
      closeButton: 'text-tathir-brown hover:text-tathir-dark-green'
    }
  };

  const styles = variantStyles[variant];

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${styles.overlay} backdrop-blur-sm`}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div 
        className={`
          relative w-full ${sizeStyles[size]} ${styles.container} 
          rounded-xl border-2 sm:border-4 shadow-2xl
          transform transition-all duration-300
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-current/20">
            {title && (
              <h2 className={`text-lg sm:text-xl font-bold ${styles.title} ${bloxat.className}`}>
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors duration-200 ${styles.closeButton}`}
              >
                <FaTimes className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>

        {/* Actions */}
        {actions && (actions.primary || actions.secondary) && (
          <div className="flex gap-3 p-4 sm:p-6 pt-0">
            {actions.secondary && (
              <Button
                variant="secondary"
                onClick={actions.secondary.onClick}
                className="flex-1"
              >
                {actions.secondary.label}
              </Button>
            )}
            {actions.primary && (
              <Button
                variant={actions.primary.variant || 'primary'}
                onClick={actions.primary.onClick}
                disabled={actions.primary.loading}
                className="flex-1"
              >
                {actions.primary.loading ? 'Loading...' : actions.primary.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
