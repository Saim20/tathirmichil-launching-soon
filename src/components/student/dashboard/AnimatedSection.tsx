"use client";

import React from 'react';
import useInView from '@/lib/utils';

interface AnimatedSectionProps {
  children: React.ReactNode;
  threshold?: number;
}

/**
 * A component that animates its children when they enter the viewport
 */
const AnimatedSection: React.FC<AnimatedSectionProps> = ({ 
  children, 
  threshold = 0.1 
}) => {
  const [ref, isVisible] = useInView({ threshold });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 rotate-0 scale-100' : 'opacity-0 translate-y-12 -rotate-1 scale-95'
      }`}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
