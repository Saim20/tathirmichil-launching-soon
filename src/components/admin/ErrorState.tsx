"use client";

import React from 'react';

interface ErrorStateProps {
  message: string;
  icon?: React.ReactNode;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  icon,
  onRetry,
  fullScreen = true
}) => {
  const containerClass = fullScreen 
    ? "min-h-screen bg-tathir-beige p-4 sm:p-6" 
    : "min-h-[60vh]";
  
  return (
    <div className={containerClass}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            {icon && <div className="text-3xl sm:text-4xl text-red-500 mx-auto mb-4">{icon}</div>}
            <p className="text-red-600 font-medium mb-4 text-sm sm:text-base">{message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 sm:px-4 py-2 bg-tathir-dark-green text-white rounded-lg hover:bg-tathir-dark-green transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
