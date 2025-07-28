'use client';

import { ReactNode } from 'react';
import TestNavigation from '@/components/shared/TestNavigation';
import { bloxat } from '@/components/fonts';

interface TestLayoutProps {
  children: ReactNode;
}

export default function TestLayout({ children }: TestLayoutProps) {
  
  return (
    <div className="min-h-screen bg-tathir-beige">
      <div className="max-w-7xl mx-auto py-2 md:py-2">
        {/* Navigation */}
        {/* Hide TestNavigation if path has 3 segments (e.g. /test/type/[id]) */}
        {typeof window === 'undefined'
          ? null
          : window.location.pathname.split('/').length !== 4 && (
              <div className="mb-6 md:mb-8">
          <TestNavigation />
              </div>
            )
        }

        {/* Content */}
        <div className="space-y-2 md:space-y-3 w-full">
          {children}
        </div>
      </div>
    </div>
  );
} 