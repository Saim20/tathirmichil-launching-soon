"use client";
import React from "react";
import { 
  FaCheckCircle, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaEdit, 
  FaClock,
  FaCloudUploadAlt,
  FaSave
} from "react-icons/fa";
import { bloxat } from "@/components/fonts";

interface SubmissionStatusProps {
  status: 'unsubmitted' | 'submitting' | 'submitted' | 'modified' | 'error';
  lastSubmissionDate?: Date;
  hasUnsavedChanges?: boolean;
  autoSaveStatus?: {
    status: 'idle' | 'saving' | 'saved' | 'error';
    lastSaved?: Date;
    error?: string;
  };
  className?: string;
}

export default function SubmissionStatus({
  status,
  lastSubmissionDate,
  hasUnsavedChanges = false,
  autoSaveStatus,
  className = ""
}: SubmissionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'submitting':
        return {
          icon: <FaSpinner className="animate-spin" />,
          text: 'Submitting to database...',
          subtext: 'Please wait while we save your application',
          bgColor: 'tathir-glass-dark',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          subtextColor: 'text-blue-300'
        };
      
      case 'submitted':
        return {
          icon: <FaCheckCircle />,
          text: hasUnsavedChanges ? 'Submitted but modified' : 'Successfully submitted',
          subtext: hasUnsavedChanges 
            ? `Original submission: ${lastSubmissionDate ? new Date(lastSubmissionDate).toLocaleString() : 'Unknown'}`
            : `Submitted: ${lastSubmissionDate ? new Date(lastSubmissionDate).toLocaleString() : 'Just now'}`,
          bgColor: 'tathir-glass-dark',
          borderColor: hasUnsavedChanges ? 'border-yellow-500/30' : 'border-tathir-light-green/30',
          textColor: hasUnsavedChanges ? 'text-yellow-400' : 'text-tathir-light-green',
          subtextColor: hasUnsavedChanges ? 'text-yellow-300' : 'text-tathir-cream'
        };
      
      case 'modified':
        return {
          icon: <FaEdit />,
          text: 'Form modified after submission',
          subtext: `Last submitted: ${lastSubmissionDate ? new Date(lastSubmissionDate).toLocaleString() : 'Unknown'}`,
          bgColor: 'tathir-glass-dark',
          borderColor: 'border-orange-500/30',
          textColor: 'text-orange-400',
          subtextColor: 'text-orange-300'
        };
      
      case 'error':
        return {
          icon: <FaExclamationTriangle />,
          text: 'Submission failed',
          subtext: 'There was an error submitting your form. Please try again.',
          bgColor: 'tathir-glass-dark',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          subtextColor: 'text-red-300'
        };
      
      default: // 'unsubmitted'
        return {
          icon: <FaCloudUploadAlt />,
          text: 'Ready to submit',
          subtext: 'Complete all steps and submit your application',
          bgColor: 'tathir-glass-dark',
          borderColor: 'border-white/20',
          textColor: 'text-tathir-cream',
          subtextColor: 'text-tathir-cream/70'
        };
    }
  };

  const config = getStatusConfig();

  const getAutoSaveIndicator = () => {
    if (!autoSaveStatus) return null;

    switch (autoSaveStatus.status) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-blue-400 text-xs">
            <FaSpinner className="animate-spin text-xs" />
            <span>Auto-saving...</span>
          </div>
        );
      
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-green-400 text-xs">
            <FaSave className="text-xs" />
            <span>
              Auto-saved {autoSaveStatus.lastSaved 
                ? new Date(autoSaveStatus.lastSaved).toLocaleTimeString()
                : 'just now'}
            </span>
          </div>
        );
      
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-400 text-xs">
            <FaExclamationTriangle className="text-xs" />
            <span>Auto-save failed</span>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-6 shadow-xl ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`${config.textColor} text-lg mt-0.5`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className={`${config.textColor} font-semibold ${bloxat.className}`}>
              {config.text}
            </h3>
            <p className={`${config.subtextColor} text-sm mt-1`}>
              {config.subtext}
            </p>
            {hasUnsavedChanges && status === 'submitted' && (
              <p className="text-yellow-300 text-xs mt-2 font-medium">
                ⚠️ You have unsaved changes that need to be resubmitted
              </p>
            )}
          </div>
        </div>
        
        {/* Auto-save indicator */}
        <div className="ml-4">
          {getAutoSaveIndicator()}
        </div>
      </div>
      
      {/* Progress indicator for submitting state */}
      {status === 'submitting' && (
        <div className="mt-3">
          <div className="w-full bg-blue-500/20 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
        </div>
      )}
    </div>
  );
}
