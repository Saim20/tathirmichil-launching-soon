"use client";

import React from 'react';
import { bloxat } from '@/components/fonts';

interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="bg-tathir-dark-green rounded-xl p-4 sm:p-6 mb-6 shadow-xl border-2 sm:border-4 border-tathir-maroon">
      <h1 className={`text-2xl sm:text-3xl font-bold text-tathir-cream mb-2 ${bloxat.className}`}>
        {title}
      </h1>
      <p className="text-tathir-light-green text-sm sm:text-base">
        {description}
      </p>
      {children}
    </div>
  );
};
