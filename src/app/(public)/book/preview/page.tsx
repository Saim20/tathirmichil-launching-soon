'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import HomeLayout from '@/layouts/HomeLayout';
import { Home } from 'lucide-react';
import Link from 'next/link';

// Dynamically import PDF viewer to avoid SSR issues
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-10 sm:py-20 px-4">
      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-tathir-dark-green border-t-transparent mb-4"></div>
      <p className="text-tathir-maroon text-base sm:text-lg text-center">Loading PDF Viewer...</p>
    </div>
  ),
});

export default function BookPreviewPage() {
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleError = (errorMessage: string) => {
    setError(errorMessage);

    // Add debug information
    const isProduction = process.env.NODE_ENV === 'production';
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
    setDebugInfo(`Environment: ${isProduction ? 'Production' : 'Development'}, Domain: ${currentDomain}`);
  };

  // Show fast viewer option after 5 seconds
  useEffect(() => {
    // Remove this timeout since we're not using iframe fallback
  }, []);

  // Auto-fallback to iframe after timeout
  useEffect(() => {
    // Remove this timeout since we're not using iframe fallback
  }, []);

  // Test PDF URL accessibility on component mount
  useEffect(() => {
    const testPdfUrl = async () => {
      try {
        const response = await fetch("/THE_IBA_BOOK_organized-1-7.pdf", {
          method: 'HEAD',
          headers: {
            'Accept': 'application/pdf,*/*',
          }
        });
        
        console.log('PDF URL test - Status:', response.status);
        console.log('PDF URL test - Headers:', Object.fromEntries(response.headers.entries()));
        console.log('PDF URL test - Content-Type:', response.headers.get('content-type'));
        console.log('PDF URL test - Content-Length:', response.headers.get('content-length'));
        
        if (!response.ok) {
          console.error('PDF URL not accessible:', response.status, response.statusText);
        } else {
          
          // Test if we can actually fetch the PDF content
          try {
            const fullResponse = await fetch("/THE_IBA_BOOK_organized-1-7.pdf");
            const blob = await fullResponse.blob();
          } catch (contentError) {
            console.error('❌ Failed to fetch PDF content:', contentError);
          }
        }
      } catch (error) {
        console.error('PDF URL test failed:', error);
      }
    };

    testPdfUrl();
  }, []);

  return (
    <HomeLayout 
      showFooter={false}
      className="bg-gradient-to-b from-tathir-beige to-tathir-cream-light"
    >
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-tathir-maroon text-white py-2 sm:py-4 px-3 sm:px-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full">
              <Link 
                href="/book" 
                className="flex items-center space-x-1 sm:space-x-2 text-tathir-beige hover:text-white transition-colors duration-200"
              >
                <Home size={16} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">Back to Book</span>
              </Link>
              <div className="text-tathir-cream block">|</div>
              <h1 className="text-sm sm:text-xl font-bold text-tathir-beige truncate">
                IBA Book Preview
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-80px)]">
          {error && (
            <div className="flex flex-col items-center justify-center py-10 sm:py-20 px-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 sm:px-6 sm:py-4 rounded-lg mb-4 max-w-md">
                <p className="font-semibold text-sm sm:text-base">Error Loading PDF</p>
                <p className="text-xs sm:text-sm mb-2">{error}</p>
                {debugInfo && <p className="text-xs text-gray-600 mb-2">{debugInfo}</p>}
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="bg-tathir-dark-green text-white px-4 py-2 rounded-lg hover:bg-tathir-green transition-colors duration-200 text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          )}

          {!error && (
            <div className="h-full w-full">
              <PDFViewer 
                fileUrl="/book.pdf"
                onError={handleError}
              />
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}