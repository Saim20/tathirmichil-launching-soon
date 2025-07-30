"use client";
import React from "react";
import { bloxat } from "@/components/fonts";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  getStepTitle: (step: number) => string;
  isStepCompleted: (step: number) => boolean;
  completedSteps: Set<number>;
  formData: any; // Add formData for real-time validation
  photoPreview: string; // Add photo preview for validation
  photoFile: File | null; // Add photo file for validation
  hasUnsavedChanges?: boolean; // Add unsaved changes indicator
  autoSaveStatus?: any; // Add auto-save status
  isStepValid: (stepNumber: number) => boolean; // Function to check if a step is valid
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  goToStep,
  getStepTitle,
  isStepCompleted,
  completedSteps,
  formData,
  photoPreview,
  photoFile,
  hasUnsavedChanges = false,
  autoSaveStatus,
  isStepValid
}: ProgressIndicatorProps) {
  
  // Real-time validation function for each step
  const validateStepRealTime = React.useCallback((step: number): boolean => {
    return isStepValid(step);
  }, [formData, photoPreview, photoFile]);

  // Calculate completed steps using real-time validation - memoized for performance
  const { actuallyCompletedSteps, completedCount, progressPercentage } = React.useMemo(() => {
    const completed = Array.from({ length: totalSteps }, (_, i) => i + 1)
      .filter(step => validateStepRealTime(step));
    const count = completed.length;
    const percentage = Math.min(100, Math.round((count / totalSteps) * 100));
    
    return {
      actuallyCompletedSteps: completed,
      completedCount: count,
      progressPercentage: percentage
    };
  }, [totalSteps, validateStepRealTime]);

  return (
    <div className="tathir-glass-dark rounded-2xl p-6 mb-8 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-white font-bold ${bloxat.className} flex items-center gap-2`}>
          <span className="text-2xl">📍</span>
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-white opacity-70 text-sm bg-white/10 px-3 py-1 rounded-full flex items-center gap-2">
          {progressPercentage}% Complete
          {hasUnsavedChanges && (
            <span className="text-yellow-300 text-xs">
              • Unsaved
            </span>
          )}
          {autoSaveStatus?.status === 'saving' && (
            <span className="text-blue-300 text-xs animate-pulse">
              • Saving...
            </span>
          )}
          {autoSaveStatus?.status === 'saved' && autoSaveStatus.lastSaved && (
            <span className="text-green-300 text-xs">
              • Saved {new Date(autoSaveStatus.lastSaved).toLocaleTimeString()}
            </span>
          )}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-tathir-light-green to-tathir-cream h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
        </div>
      </div>

      {/* Step Navigator */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isRealTimeCompleted = validateStepRealTime(step);
          const isAccessible = true; // Allow free navigation to all steps
          const isCurrent = step === currentStep;
          
          return (
            <button
              key={step}
              type="button"
              onClick={() => goToStep(step)}
              className={`relative w-12 h-12 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-110 tathir-card-hover ${
                isCurrent
                  ? 'bg-tathir-light-green text-tathir-maroon shadow-lg scale-110 ring-2 ring-white/50'
                  : isRealTimeCompleted
                  ? 'bg-tathir-success/80 text-white hover:bg-tathir-light-green hover:text-tathir-maroon backdrop-blur-sm'
                  : 'bg-red-500/20 border-2 border-red-500/40 text-red-300 hover:bg-red-500/30 hover:border-red-500/60 backdrop-blur-sm'
              }`}
              disabled={!isAccessible}
              title={`Step ${step}: ${getStepTitle(step)}${isRealTimeCompleted ? ' (Completed)' : ' (Incomplete)'}`}
            >
              {isRealTimeCompleted ? '✓' : isCurrent ? step : '!'}
              
              {/* Warning indicator for incomplete steps */}
              {!isRealTimeCompleted && !isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
