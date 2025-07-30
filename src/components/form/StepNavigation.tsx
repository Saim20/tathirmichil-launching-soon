"use client";
import React from "react";
import { FaArrowLeft, FaArrowRight, FaSpinner, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import { buttonClassName, secondaryButtonClassName } from "./utils";
import { FormValidationErrors } from "@/lib/models/form";

interface StepNavigationProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  showSubmit?: boolean;
  submitting?: boolean;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  validationErrors?: Array<{field: string; message: string}>;
  completedFieldsCount?: number;
  totalFieldsCount?: number;
  allValidationErrors?: FormValidationErrors;
}

export default function StepNavigation({
  onPrev,
  onNext,
  prevLabel = "Previous",
  nextLabel = "Next",
  isFirstStep = false,
  isLastStep = false,
  showSubmit = false,
  submitting = false,
  submitLabel = "Submit",
  submitIcon,
  validationErrors = [],
  completedFieldsCount = 0,
  totalFieldsCount = 0,
  allValidationErrors,
}: StepNavigationProps) {
  
  // Calculate if step is valid based on validation errors
  const isStepValid = Object.keys(allValidationErrors || {}).length === 0;

  const getNextButtonContent = () => {
    if (submitting) {
      return (
        <>
          <FaSpinner className="animate-spin" />
          Processing...
        </>
      );
    }

    if (!isStepValid) {
      return (
        <>
          <FaExclamationCircle />
          Complete Required Fields
          {totalFieldsCount > 0 && (
            <span className="text-xs opacity-80">
              ({completedFieldsCount}/{totalFieldsCount})
            </span>
          )}
        </>
      );
    }

    return (
      <>
        <FaCheckCircle />
        {nextLabel}
        {!isLastStep && <FaArrowRight />}
      </>
    );
  };

  const getNextButtonStyles = () => {
    if (!isStepValid) {
      return `${buttonClassName} bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30 cursor-not-allowed shadow-lg`;
    }
    return `${buttonClassName} bg-gradient-to-r from-tathir-light-green to-tathir-cream text-tathir-maroon hover:from-tathir-cream hover:to-tathir-light-green shadow-lg`;
  };

  const getTooltipText = () => {
    if (!isStepValid && validationErrors.length > 0) {
      return `Missing: ${validationErrors.map(e => e.field).join(', ')}`;
    }
    return isStepValid ? 'Continue to next step' : 'Please complete all required fields';
  };
  return (
    <div className="space-y-4">
      {/* Validation feedback */}
      {!isStepValid && validationErrors.length > 0 && (
        <div className="tathir-glass-dark border border-red-500/30 rounded-2xl p-4 mt-8 shadow-xl">
          <div className="flex items-start gap-3">
            <FaExclamationCircle className="text-red-400 text-lg mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-400 font-semibold mb-2">
                {validationErrors.length === 1 
                  ? 'Please fix this issue to continue:' 
                  : `Please fix these ${validationErrors.length} issues to continue:`
                }
              </p>
              <ul className="text-red-300 text-sm space-y-1">
                {validationErrors.slice(0, 8).map((error, index) => (
                  <li key={`${error.field}-${index}`} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{error.message}</span>
                  </li>
                ))}
                {validationErrors.length > 8 && (
                  <li className="opacity-70 italic">
                    • And {validationErrors.length - 8} more issue{validationErrors.length - 8 > 1 ? 's' : ''}...
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        {!isFirstStep && onPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className={secondaryButtonClassName}
            disabled={submitting}
          >
            <FaArrowLeft />
            {prevLabel}
          </button>
        ) : (
          <div></div>
        )}
        
        {showSubmit ? (
          <button
            type="submit"
            className={`${buttonClassName} flex items-center gap-2 ${
              !isStepValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={submitting || !isStepValid}
            title={getTooltipText()}
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                {submitIcon}
                {submitLabel}
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className={`${getNextButtonStyles()} flex items-center gap-2 transition-all duration-300`}
            disabled={submitting || !isStepValid}
            title={getTooltipText()}
          >
            {getNextButtonContent()}
          </button>
        )}
      </div>
    </div>
  );
}
