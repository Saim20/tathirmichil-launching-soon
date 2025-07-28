"use client";

import React from 'react';
import { bloxat } from '@/components/fonts';

interface ContentContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  titleClassName?: string;
}

export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  title,
  className = "",
  titleClassName = ""
}) => {
  const defaultClasses = "rounded-xl p-4 sm:p-6 mb-6 shadow-lg border-2";
  const defaultBg = className.includes('bg-') ? '' : 'bg-tathir-cream';
  const defaultBorder = className.includes('border-') && !className.includes('border-2') ? '' : 'border-tathir-brown';
  const defaultTitleColor = titleClassName || (className.includes('bg-tathir-dark-green') ? 'text-tathir-cream' : 'text-tathir-dark-green');
  
  return (
    <div className={`${defaultClasses} ${defaultBg} ${defaultBorder} ${className}`}>
      {title && (
        <h2 className={`text-xl font-bold mb-4 ${defaultTitleColor} ${bloxat.className}`}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};
