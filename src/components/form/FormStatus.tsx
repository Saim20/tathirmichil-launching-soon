"use client";
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaSpinner, FaExclamationTriangle, FaHistory, FaClock } from "react-icons/fa";
import { AutoSaveStatus } from "@/hooks/useAutoSave";

interface FormStatusProps {
  autoSaveStatus: AutoSaveStatus;
  onRestoreData?: () => void;
  hasSavedData?: boolean;
  className?: string;
}

export default function FormStatus({
  autoSaveStatus,
  onRestoreData,
  hasSavedData = false,
  className = ""
}: FormStatusProps) {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (autoSaveStatus.status === 'saving' || autoSaveStatus.status === 'saved') {
      setShowNotification(true);
      const timeout = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [autoSaveStatus.status]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex flex-col gap-2 ${className}`}>
      {/* Auto-save notification */}
      {showNotification && (
        <div className="bg-tathir-dark-green/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-xs transition-all duration-300 transform translate-x-0">
          {autoSaveStatus.status === 'saving' && (
            <>
              <FaSpinner className="animate-spin text-tathir-light-green" />
              <span className="text-sm">Saving...</span>
            </>
          )}
          {autoSaveStatus.status === 'saved' && (
            <>
              <FaCheckCircle className="text-green-400" />
              <span className="text-sm">Form saved</span>
            </>
          )}
          {autoSaveStatus.status === 'error' && (
            <>
              <FaExclamationTriangle className="text-red-400" />
              <span className="text-sm">Save failed</span>
              {autoSaveStatus.error && (
                <span className="text-xs opacity-80 block">{autoSaveStatus.error}</span>
              )}
            </>
          )}
        </div>
      )}

      {/* Restore saved data notification */}
      {hasSavedData && onRestoreData && (
        <div className="bg-tathir-light-green/90 backdrop-blur-sm text-tathir-maroon px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
          <FaHistory className="text-lg flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Previous form data found</p>
            <p className="text-xs opacity-80">Would you like to restore your progress?</p>
          </div>
          <button
            onClick={onRestoreData}
            className="bg-tathir-maroon text-white px-3 py-1 rounded text-xs font-medium hover:bg-tathir-maroon/80 transition-colors"
          >
            Restore
          </button>
        </div>
      )}

      {/* Persistent status indicator */}
      {!showNotification && autoSaveStatus.status !== 'idle' && (
        <div className="bg-tathir-dark-green/70 backdrop-blur-sm text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2">
          {autoSaveStatus.status === 'saving' && (
            <FaSpinner className="animate-spin text-xs" />
          )}
          {autoSaveStatus.status === 'saved' && autoSaveStatus.lastSaved && (
            <>
              <FaClock className="text-xs" />
              <span className="text-xs">{formatTimeAgo(autoSaveStatus.lastSaved)}</span>
            </>
          )}
          {autoSaveStatus.status === 'error' && (
            <FaExclamationTriangle className="text-red-400 text-xs" />
          )}
        </div>
      )}
    </div>
  );
}
