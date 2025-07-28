"use client";

import React from 'react';

interface StudentPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const StudentPageLayout: React.FC<StudentPageLayoutProps> = ({
  children,
  className = "",
  contentClassName = ""
}) => {
  return (
    <div className={`min-h-screen bg-tathir-beige ${className}`}>
      <div className={`max-w-full lg:max-w-[calc(100vw-19rem)] mx-auto overflow-x-hidden px-4 py-6 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};
