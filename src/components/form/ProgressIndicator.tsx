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
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  goToStep,
  getStepTitle,
  isStepCompleted,
  completedSteps
}: ProgressIndicatorProps) {
  // Calculate progress based on completed steps only
  const completedCount = completedSteps.size;
  const progressPercentage = Math.min(100, Math.round((completedCount / totalSteps) * 100));

  return (
    <div className="tathir-glass-dark rounded-2xl p-6 mb-8 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-white font-bold ${bloxat.className} flex items-center gap-2`}>
          <span className="text-2xl">📍</span>
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-white opacity-70 text-sm bg-white/10 px-3 py-1 rounded-full">
          {progressPercentage}% Complete
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
          const isCompleted = completedSteps.has(step) || step < currentStep;
          const isAccessible = step <= currentStep || isCompleted || (step === currentStep + 1 && isStepCompleted(currentStep));
          
          return (
            <button
              key={step}
              type="button"
              onClick={() => goToStep(step)}
              className={`w-12 h-12 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-110 tathir-card-hover ${
                step === currentStep
                  ? 'bg-tathir-light-green text-tathir-maroon shadow-lg scale-110'
                  : isCompleted
                  ? 'bg-tathir-success/80 text-white hover:bg-tathir-light-green hover:text-tathir-maroon backdrop-blur-sm'
                  : isAccessible
                  ? 'bg-white/20 text-white hover:bg-tathir-light-green hover:text-tathir-maroon backdrop-blur-sm'
                  : 'bg-white/10 text-white opacity-50 cursor-not-allowed'
              }`}
              disabled={!isAccessible}
              title={`Step ${step}: ${getStepTitle(step)}${isCompleted ? ' (Completed)' : ''}`}
            >
              {isCompleted ? '✓' : step}
            </button>
          );
        })}
      </div>
    </div>
  );
}
