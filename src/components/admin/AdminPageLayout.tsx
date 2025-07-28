"use client";

import React from 'react';

interface AdminPageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`min-h-screen bg-tathir-beige p-4 sm:p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};
