"use client";
import React from "react";
import { FaCheckCircle, FaExclamationTriangle, FaClock } from "react-icons/fa";
import { bloxat } from "@/components/fonts";

interface ValidationSummaryProps {
  currentStep: number;
  totalSteps: number;
  currentStepErrors: Array<{field: string; message: string}>;
  completedFieldsCount: number;
  totalFieldsCount: number;
  className?: string;
}

export default function ValidationSummary({
  currentStep,
  totalSteps,
  currentStepErrors,
  completedFieldsCount,
  totalFieldsCount,
  className = ""
}: ValidationSummaryProps) {
  const isCurrentStepValid = currentStepErrors.length === 0;
  const progressPercentage = totalFieldsCount > 0 ? Math.round((completedFieldsCount / totalFieldsCount) * 100) : 0;

  return (
    <div className={`tathir-glass-dark border border-white/20 rounded-2xl p-6 shadow-xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-tathir-cream font-semibold text-lg ${bloxat.className}`}>
          Step {currentStep} of {totalSteps}
        </h3>
        <div className="flex items-center gap-2">
          {isCurrentStepValid ? (
            <div className="flex items-center gap-2 text-tathir-light-green">
              <FaCheckCircle />
              <span className="text-sm font-medium">Complete</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-tathir-error">
              <FaExclamationTriangle />
              <span className="text-sm font-medium">{currentStepErrors.length} issue{currentStepErrors.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-tathir-cream/70 mb-2">
          <span>Fields completed</span>
          <span>{completedFieldsCount}/{totalFieldsCount} ({progressPercentage}%)</span>
        </div>
        <div className="w-full bg-tathir-brown/30 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden ${
              isCurrentStepValid 
                ? 'bg-gradient-to-r from-tathir-light-green to-tathir-success' 
                : 'bg-gradient-to-r from-tathir-error to-red-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Simple status message - detailed errors shown in StepNavigation */}
      {!isCurrentStepValid && (
        <div className="text-sm">
          <p className="text-tathir-error/80 font-medium flex items-center gap-2">
            <FaClock className="text-sm" />
            Complete the highlighted fields below to continue
          </p>
        </div>
      )}
    </div>
  );
}
