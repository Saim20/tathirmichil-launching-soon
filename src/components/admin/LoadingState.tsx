"use client";

import React from 'react';
import { FaSpinner } from 'react-icons/fa';

interface LoadingStateProps {
  message?: string;
  icon?: React.ReactNode;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  icon,
  fullScreen = true
}) => {
  const containerClass = fullScreen 
    ? "min-h-screen bg-tathir-beige p-4 sm:p-6" 
    : "min-h-[60vh]";
  
  return (
    <div className={containerClass}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            {icon || <FaSpinner className="animate-spin text-3xl sm:text-4xl text-tathir-dark-green mx-auto mb-4" />}
            <p className="text-tathir-dark-green font-medium text-sm sm:text-base">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
