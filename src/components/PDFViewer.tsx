'use client';

import React from 'react';

interface PDFViewerProps {
  fileUrl: string;
  onError: (error: string) => void;
}

export default function PDFViewerComponent({ fileUrl, onError }: PDFViewerProps) {
  const handleIframeError = () => {
    onError('Failed to load PDF. Your browser may not support embedded PDF viewing.');
  };

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
