import { ReactNode } from 'react';
import TestNavigation from './TestNavigation';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { bloxat } from '@/components/fonts';

interface TestPageLayoutProps {
  title: string;
  children: ReactNode;
  description?: string;
  gridCols?: 'two' | 'three';  // Allow customization of grid columns
  contentClassName?: string;    // Allow custom class names for content area
}

export default function TestPageLayout({ 
  title, 
  description, 
  children,
  gridCols = 'three',    // Default to three columns
  contentClassName = ''   // Default to empty string
}: TestPageLayoutProps) {
  const gridClass = gridCols === 'two' 
    ? 'grid-cols-1 sm:grid-cols-2' 
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="min-h-screen bg-tathir-beige">
      <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
        {/* Back Navigation */}
        <Link 
          href="/student" 
          className="inline-flex items-center text-sm text-tathir-brown hover:text-tathir-dark-green mb-6 group"
        >
          <FaArrowLeft className="mr-2 text-xs transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>

        {/* Test Navigation */}
        <TestNavigation />

        {/* Content Area */}
        <div className="bg-tathir-cream-light rounded-lg shadow-lg p-6 border-2 border-tathir-maroon">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className={`text-2xl text-tathir-dark-green font-bold uppercase ${bloxat.className}`}>
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm text-tathir-brown">{description}</p>
            )}
          </div>

          {/* Grid Content */}
          <div className={`grid ${gridClass} gap-6 ${contentClassName}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 