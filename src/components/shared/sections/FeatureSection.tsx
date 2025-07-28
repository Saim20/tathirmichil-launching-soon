"use client";

import React from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { bloxat } from '@/components/fonts';
import { Button } from '../ui/Button';

interface Feature {
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  highlight?: boolean;
}

interface FeatureSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  features: Feature[];
  variant?: 'admin' | 'student' | 'public';
  layout?: 'grid' | 'alternating' | 'carousel';
  className?: string;
  maxFeatures?: number;
  showAction?: boolean;
  sectionAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  subtitle,
  description,
  features,
  variant = 'public',
  layout = 'grid',
  className = "",
  maxFeatures,
  showAction = true,
  sectionAction
}) => {
  const variantStyles = {
    admin: {
      container: 'bg-tathir-dark-green text-tathir-cream',
      title: 'text-tathir-light-green',
      subtitle: 'text-tathir-cream/80',
      description: 'text-tathir-cream/90',
      featureCard: 'bg-tathir-cream/10 border-tathir-maroon hover:bg-tathir-cream/20',
      featureTitle: 'text-tathir-cream',
      featureDescription: 'text-tathir-cream/80',
      highlightCard: 'bg-tathir-light-green/20 border-tathir-light-green'
    },
    student: {
      container: 'bg-tathir-beige text-tathir-dark-green',
      title: 'text-tathir-dark-green',
      subtitle: 'text-tathir-brown',
      description: 'text-tathir-brown/90',
      featureCard: 'bg-tathir-cream border-tathir-brown hover:shadow-lg',
      featureTitle: 'text-tathir-dark-green',
      featureDescription: 'text-tathir-brown',
      highlightCard: 'bg-tathir-light-green/30 border-tathir-dark-green'
    },
    public: {
      container: 'bg-tathir-beige text-tathir-dark-green',
      title: 'text-tathir-dark-green',
      subtitle: 'text-tathir-brown',
      description: 'text-tathir-brown/90',
      featureCard: 'bg-tathir-cream border-tathir-brown hover:shadow-lg',
      featureTitle: 'text-tathir-dark-green',
      featureDescription: 'text-tathir-brown',
      highlightCard: 'bg-tathir-light-green/30 border-tathir-dark-green'
    }
  };

  const styles = variantStyles[variant];
  const displayFeatures = maxFeatures ? features.slice(0, maxFeatures) : features;

  const getLayoutClasses = () => {
    switch (layout) {
      case 'grid':
        return `grid grid-cols-1 md:grid-cols-2 ${displayFeatures.length >= 3 ? 'lg:grid-cols-3' : ''} gap-6`;
      case 'alternating':
        return 'space-y-12';
      case 'carousel':
        return 'flex overflow-x-auto gap-6 pb-4 scrollbar-hide';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  const FeatureCard: React.FC<{ feature: Feature; index: number }> = ({ feature, index }) => {
    const isAlternating = layout === 'alternating';
    const isReversed = isAlternating && index % 2 === 1;

    return (
      <div 
        className={`
          ${isAlternating ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 items-center' : ''}
          ${layout === 'carousel' ? 'min-w-[300px] flex-shrink-0' : ''}
        `}
      >
        {/* Feature Content */}
        <div className={`${isReversed ? 'lg:order-2' : ''}`}>
          <div 
            className={`
              p-6 rounded-xl border-2 transition-all duration-300 h-full
              ${feature.highlight ? styles.highlightCard : styles.featureCard}
            `}
          >
            {/* Icon */}
            {feature.icon && (
              <div className="flex items-center justify-center w-12 h-12 bg-tathir-cream/20 rounded-lg mb-4">
                <div className="text-tathir-dark-green">
                  {feature.icon}
                </div>
              </div>
            )}

            {/* Content */}
            <h3 className={`${bloxat.className} text-xl font-bold mb-3 ${styles.featureTitle}`}>
              {feature.title}
            </h3>
            
            <p className={`text-sm leading-relaxed mb-4 ${styles.featureDescription}`}>
              {feature.description}
            </p>

            {/* Action */}
            {feature.action && showAction && (
              <Button
                variant="secondary"
                size="sm"
                onClick={feature.action.onClick}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {feature.action.label}
              </Button>
            )}
          </div>
        </div>

        {/* Feature Image (for alternating layout) */}
        {isAlternating && feature.image && (
          <div className={`${isReversed ? 'lg:order-1' : ''}`}>
            <div className="aspect-video bg-tathir-cream/20 rounded-xl overflow-hidden">
              <img 
                src={feature.image} 
                alt={feature.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className={`py-16 sm:py-24 ${styles.container} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          {subtitle && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tathir-cream/20 backdrop-blur-sm rounded-full mb-4">
              <span className={`text-sm font-medium ${styles.subtitle}`}>
                {subtitle}
              </span>
            </div>
          )}

          <h2 className={`${bloxat.className} text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${styles.title}`}>
            {title}
          </h2>

          {description && (
            <p className={`text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed ${styles.description}`}>
              {description}
            </p>
          )}
        </div>

        {/* Features */}
        <div className={getLayoutClasses()}>
          {displayFeatures.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Section Action */}
        {sectionAction && (
          <div className="text-center mt-12">
            <Button
              variant="primary"
              size="lg"
              onClick={sectionAction.onClick}
              icon={sectionAction.icon || <ChevronRight className="w-5 h-5" />}
            >
              {sectionAction.label}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
