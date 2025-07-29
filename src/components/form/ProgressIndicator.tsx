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
  autoSaveStatus
}: ProgressIndicatorProps) {
  
  // Real-time validation function for each step
  const validateStepRealTime = React.useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fullName?.trim() && 
                 formData.emailAddress?.trim() && 
                 formData.phoneNumber?.trim() && 
                 formData.facebookProfile?.trim() &&
                 (photoPreview?.trim() || photoFile)); // Include photo validation with proper empty string check
      case 2:
        return !!(formData.school?.trim() && 
                 formData.college?.trim() && 
                 formData.group && 
                 formData.hscBatch && 
                 formData.academicDescription?.trim());
      case 3:
        return !!(formData.personalDescription?.trim() && 
                 formData.whyIBA?.trim() && 
                 formData.whyApplyingHere?.trim() && 
                 formData.ifNotIBA?.trim());
      case 4:
        return !!(formData.prepTimeline && 
                 formData.strugglingAreas && formData.strugglingAreas.length > 0 &&
                 formData.fiveYearsVision?.trim() && 
                 formData.otherPlatforms?.trim() && 
                 formData.admissionPlans?.trim());
      case 5:
        return !!(formData.stableInternet && 
                 formData.videoCameraOn && 
                 formData.attendClasses && 
                 formData.activeParticipation && 
                 formData.skipOtherCoachings && 
                 formData.stickTillExam);
      case 6:
        return !!(formData.recentFailure?.trim() && 
                 formData.lastBookVideoArticle?.trim());
      case 7:
        return !!(formData.preferredTiming && formData.preferredTiming.length > 0 && 
                 formData.preferredBatchType);
      default:
        return false;
    }
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
          
          return (
            <button
              key={step}
              type="button"
              onClick={() => goToStep(step)}
              className={`w-12 h-12 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-110 tathir-card-hover ${
                step === currentStep
                  ? 'bg-tathir-light-green text-tathir-maroon shadow-lg scale-110'
                  : isRealTimeCompleted
                  ? 'bg-tathir-success/80 text-white hover:bg-tathir-light-green hover:text-tathir-maroon backdrop-blur-sm'
                  : 'bg-tathir-cream text-tathir-maroon hover:bg-tathir-light-green hover:text-tathir-maroon backdrop-blur-sm'
              }`}
              disabled={!isAccessible}
              title={`Step ${step}: ${getStepTitle(step)}${isRealTimeCompleted ? ' (Completed)' : ' (Incomplete)'}`}
            >
              {isRealTimeCompleted ? '✓' : step}
            </button>
          );
        })}
      </div>
    </div>
  );
}
