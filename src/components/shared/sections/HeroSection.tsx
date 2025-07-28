"use client";

import React from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { bloxat } from '@/components/fonts';
import { Button } from '../ui/Button';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  backgroundImage?: string;
  variant?: 'admin' | 'student' | 'public';
  className?: string;
  features?: string[];
  stats?: {
    label: string;
    value: string;
    icon?: React.ReactNode;
  }[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  variant = 'public',
  className = "",
  features = [],
  stats = []
}) => {
  const variantStyles = {
    admin: {
      container: 'bg-tathir-dark-green text-tathir-cream',
      title: 'text-tathir-light-green',
      subtitle: 'text-tathir-cream/80',
      description: 'text-tathir-cream/90',
      backgroundAccent: 'bg-tathir-maroon/20'
    },
    student: {
      container: 'bg-tathir-beige text-tathir-dark-green',
      title: 'text-tathir-dark-green',
      subtitle: 'text-tathir-brown',
      description: 'text-tathir-brown/90',
      backgroundAccent: 'bg-tathir-cream'
    },
    public: {
      container: 'bg-tathir-beige text-tathir-dark-green',
      title: 'text-tathir-dark-green',
      subtitle: 'text-tathir-brown',
      description: 'text-tathir-brown/90',
      backgroundAccent: 'bg-tathir-cream'
    }
  };

  const styles = variantStyles[variant];

  return (
    <section 
      className={`relative w-full min-h-screen flex items-center justify-center overflow-hidden ${styles.container} ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[40rem] h-[40rem] bg-tathir-maroon/10 rounded-full blur-3xl -top-96 -left-48 animate-pulse"></div>
        <div className="absolute w-[30rem] h-[30rem] bg-tathir-brown/10 rounded-full blur-3xl bottom-0 right-0 animate-pulse delay-1000"></div>
        <div className="absolute w-[20rem] h-[20rem] bg-tathir-dark-green/10 rounded-full blur-3xl top-1/2 left-1/2 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Subtitle */}
          {subtitle && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tathir-cream/20 backdrop-blur-sm rounded-full mb-6">
              <span className={`text-sm font-medium ${styles.subtitle}`}>
                {subtitle}
              </span>
            </div>
          )}

          {/* Main Title */}
          <h1 className={`${bloxat.className} text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight ${styles.title}`}>
            {title}
          </h1>

          {/* Description */}
          <p className={`text-lg sm:text-xl lg:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed ${styles.description}`}>
            {description}
          </p>

          {/* Features list */}
          {features.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-tathir-cream/30 backdrop-blur-sm rounded-lg">
                  <ChevronRight className="w-4 h-4 text-tathir-dark-green" />
                  <span className={`text-sm font-medium ${styles.description}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {primaryAction && (
              <Button
                variant="primary"
                size="lg"
                onClick={primaryAction.onClick}
                icon={primaryAction.icon || <ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="secondary"
                size="lg"
                onClick={secondaryAction.onClick}
                icon={secondaryAction.icon}
                className="w-full sm:w-auto"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  {stat.icon && (
                    <div className="flex justify-center mb-2">
                      <div className="w-12 h-12 bg-tathir-cream/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        {stat.icon}
                      </div>
                    </div>
                  )}
                  <div className={`text-2xl sm:text-3xl font-bold ${styles.title}`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm ${styles.subtitle}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Background overlay for image backgrounds */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
      )}
    </section>
  );
};
