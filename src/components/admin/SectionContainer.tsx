"use client";

import React from 'react';

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`bg-tathir-beige/50 p-4 rounded-xl mb-4 border border-tathir-brown/30 ${className}`}>
      {children}
    </div>
  );
};
