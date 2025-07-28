"use client";

import React from 'react';
import { ArrowRight, Star, CheckCircle } from 'lucide-react';
import { bloxat } from '@/components/fonts';
import { Button } from '../ui/Button';

interface CTASectionProps {
  title: string;
  subtitle?: string;
  description: string;
  primaryAction: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  variant?: 'admin' | 'student' | 'public';
  style?: 'default' | 'gradient' | 'minimal' | 'bordered';
  className?: string;
  backgroundImage?: string;
  features?: string[];
  testimonial?: {
    text: string;
    author: string;
    role?: string;
    avatar?: string;
  };
  urgency?: {
    text: string;
    highlight?: string;
  };
}

export const CTASection: React.FC<CTASectionProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  variant = 'public',
  style = 'default',
  className = "",
  backgroundImage,
  features = [],
  testimonial,
  urgency
}) => {
  const variantStyles = {
    admin: {
      container: 'bg-tathir-dark-green text-tathir-cream',
      title: 'text-tathir-light-green',
      subtitle: 'text-tathir-cream/80',
      description: 'text-tathir-cream/90',
      feature: 'text-tathir-cream/90',
      testimonialBg: 'bg-tathir-cream/10 border-tathir-maroon',
      testimonialText: 'text-tathir-cream/80',
      urgencyBg: 'bg-tathir-maroon/20 border-tathir-maroon'
    },
    student: {
      container: 'bg-tathir-beige text-tathir-dark-green',
      title: 'text-tathir-dark-green',
      subtitle: 'text-tathir-brown',
      description: 'text-tathir-brown/90',
      feature: 'text-tathir-brown/90',
      testimonialBg: 'bg-tathir-cream border-tathir-brown',
      testimonialText: 'text-tathir-brown/80',
      urgencyBg: 'bg-tathir-light-green/20 border-tathir-dark-green'
    },
    public: {
      container: 'bg-tathir-beige text-tathir-dark-green',
      title: 'text-tathir-dark-green',
      subtitle: 'text-tathir-brown',
      description: 'text-tathir-brown/90',
      feature: 'text-tathir-brown/90',
      testimonialBg: 'bg-tathir-cream border-tathir-brown',
      testimonialText: 'text-tathir-brown/80',
      urgencyBg: 'bg-tathir-light-green/20 border-tathir-dark-green'
    }
  };

  const styleClasses = {
    default: 'relative',
    gradient: 'relative bg-gradient-to-br from-tathir-maroon via-tathir-brown to-tathir-dark-green text-white',
    minimal: 'relative bg-transparent',
    bordered: 'relative border-4 border-tathir-brown bg-tathir-cream'
  };

  const styles = variantStyles[variant];
  const containerClasses = style === 'gradient' ? 'text-white' : styles.container;

  return (
    <section 
      className={`py-16 sm:py-24 relative overflow-hidden ${containerClasses} ${styleClasses[style]} ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {/* Background decorative elements */}
      {style === 'default' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[30rem] h-[30rem] bg-tathir-maroon/10 rounded-full blur-3xl -top-48 -right-24 animate-pulse"></div>
          <div className="absolute w-[25rem] h-[25rem] bg-tathir-brown/10 rounded-full blur-3xl bottom-0 left-0 animate-pulse delay-1000"></div>
        </div>
      )}

      {/* Background overlay for image backgrounds */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Urgency Banner */}
          {urgency && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${styles.urgencyBg} border`}>
              <Star className="w-4 h-4 text-tathir-maroon animate-pulse" />
              <span className="text-sm font-medium">
                {urgency.text}
                {urgency.highlight && (
                  <span className="font-bold text-tathir-maroon ml-1">
                    {urgency.highlight}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tathir-cream/20 backdrop-blur-sm rounded-full mb-4">
              <span className={`text-sm font-medium ${style === 'gradient' ? 'text-white/80' : styles.subtitle}`}>
                {subtitle}
              </span>
            </div>
          )}

          {/* Main Title */}
          <h2 className={`${bloxat.className} text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight ${style === 'gradient' ? 'text-white' : styles.title}`}>
            {title}
          </h2>

          {/* Description */}
          <p className={`text-lg sm:text-xl lg:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed ${style === 'gradient' ? 'text-white/90' : styles.description}`}>
            {description}
          </p>

          {/* Features */}
          {features.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2 bg-tathir-cream/20 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-4 h-4 text-tathir-dark-green" />
                  <span className={`text-sm font-medium ${style === 'gradient' ? 'text-white/90' : styles.feature}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Testimonial */}
          {testimonial && (
            <div className={`p-6 rounded-xl border-2 mb-8 max-w-2xl mx-auto ${styles.testimonialBg}`}>
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className={`text-lg mb-4 italic ${styles.testimonialText}`}>
                "{testimonial.text}"
              </p>
              <div className="flex items-center justify-center gap-3">
                {testimonial.avatar && (
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div className="text-center">
                  <div className="font-semibold">{testimonial.author}</div>
                  {testimonial.role && (
                    <div className={`text-sm ${styles.testimonialText}`}>
                      {testimonial.role}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={primaryAction.onClick}
              icon={primaryAction.icon || <ArrowRight className="w-6 h-6" />}
              className="w-full sm:w-auto px-8 py-4 text-lg"
            >
              {primaryAction.label}
            </Button>
            {secondaryAction && (
              <Button
                variant="secondary"
                size="lg"
                onClick={secondaryAction.onClick}
                icon={secondaryAction.icon}
                className="w-full sm:w-auto px-8 py-4 text-lg"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
