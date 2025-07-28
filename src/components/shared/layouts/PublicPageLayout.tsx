"use client";

import React from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

interface PublicPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showNavbar?: boolean;
  showFooter?: boolean;
  contentClassName?: string;
}

export const PublicPageLayout: React.FC<PublicPageLayoutProps> = ({
  children,
  className = "",
  showNavbar = true,
  showFooter = true,
  contentClassName = ""
}) => {
  return (
    <div className={`min-h-screen bg-tathir-beige flex flex-col ${className}`}>
      {showNavbar && (
        <div className="shadow-[0_4px_0_0_rgba(90,58,43,0.5)] relative z-40">
          <Navbar />
        </div>
      )}
      
      <main className={`flex-grow ${contentClassName}`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};
