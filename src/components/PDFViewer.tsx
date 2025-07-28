'use client';

import React, { useState, useEffect } from 'react';

interface PDFViewerProps {
  fileUrl: string;
  onError: (error: string) => void;
}

export default function PDFViewerComponent({ fileUrl, onError }: PDFViewerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
                           window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleIframeError = () => {
    onError('Failed to load PDF. Your browser may not support embedded PDF viewing.');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isMobile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-tathir-cream p-6">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-tathir-maroon mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xl font-semibold text-tathir-maroon mb-2">PDF Document</h3>
            <p className="text-tathir-brown mb-6">
              For the best viewing experience on mobile devices, download the PDF to your device.
            </p>
          </div>
          
          <button
            onClick={handleDownload}
            className="bg-tathir-dark-green hover:bg-tathir-green text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download PDF
          </button>
          
          <p className="text-sm text-tathir-brown mt-4">
            Or{' '}
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-tathir-dark-green hover:underline"
            >
              open in browser
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      <iframe
        src={fileUrl}
        className="w-full h-full border-0"
        title="PDF Viewer"
        onError={handleIframeError}
        onLoad={() => console.log('PDF loaded successfully')}
        style={{
          height: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        <p className="p-4 text-center text-tathir-maroon">
          Your browser does not support embedded PDFs. 
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-tathir-dark-green hover:underline ml-1"
          >
            Click here to view the PDF
          </a>
        </p>
      </iframe>
    </div>
  );
}
