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
  allValidationErrors,
}: StepNavigationProps) {
  
  // Calculate if step is valid based on validation errors
  let isStepValid: boolean = true;
  if(isLastStep){
    isStepValid = Object.keys(allValidationErrors!).length === 0;
  }else{
    isStepValid = Object.keys(validationErrors).length === 0;
  }

  console.log(`Step Navigation - isStepValid: ${isStepValid}, validationErrors:`, validationErrors);
  

  const getNextButtonContent = () => {
    if (submitting) {
      return (
        <>
          <FaSpinner className="animate-spin text-sm" />
          <span className="hidden xs:inline">Processing...</span>
          <span className="xs:hidden">Loading</span>
        </>
      );
    }

    return (
      <>
        <FaCheckCircle className="text-sm" />
        <span className="truncate">{nextLabel}</span>
        {!isLastStep && <FaArrowRight className="text-sm" />}
      </>
    );
  };

  const getNextButtonStyles = () => {
    if (!isStepValid) {
      return `${buttonClassName} bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30 cursor-not-allowed shadow-lg`;
    }
    return `${buttonClassName} bg-tathir-light-green text-tathir-maroon hover:bg-tathir-cream shadow-lg`;
  };

  const getTooltipText = () => {
    if (!isStepValid && validationErrors.length > 0) {
      return `Missing: ${validationErrors.map(e => e.field).join(', ')}`;
    }
    return isStepValid ? 'Continue to next step' : 'Please complete all required fields';
  };
  return (
    <div className="space-y-4 mt-4">
      {/* Validation feedback */}
      {!isStepValid && validationErrors.length > 0 && (
        <div className="tathir-glass-dark border border-red-500/30 rounded-2xl p-3 md:p-4 mt-6 md:mt-8 shadow-xl">
          <div className="flex items-start gap-2 md:gap-3">
            <FaExclamationCircle className="text-red-400 text-base md:text-lg mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-red-400 font-semibold mb-2 text-sm md:text-base">
                {validationErrors.length === 1 
                  ? 'Please fix this issue to continue:' 
                  : `Please fix these ${validationErrors.length} issues to continue:`
                }
              </p>
              <ul className="text-red-300 text-xs md:text-sm space-y-1">
                {validationErrors.slice(0, 8).map((error, index) => (
                  <li key={`${error.field}-${index}`} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold flex-shrink-0">•</span>
                    <span className="break-words">{error.message}</span>
                  </li>
                ))}
                {validationErrors.length > 8 && (
                  <li className="opacity-70 italic text-xs">
                    • And {validationErrors.length - 8} more issue{validationErrors.length - 8 > 1 ? 's' : ''}...
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        {!isFirstStep && onPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className={`${secondaryButtonClassName} w-full sm:w-auto order-2 sm:order-1`}
            disabled={submitting}
          >
            <FaArrowLeft className="text-sm" />
            <span className="hidden sm:inline">{prevLabel}</span>
            <span className="sm:hidden">Back</span>
          </button>
        ) : (
          <div className="hidden sm:block"></div>
        )}
        
        {showSubmit ? (
          <button
            type="submit"
            className={`${buttonClassName} flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2 ${
              !isStepValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={submitting || !isStepValid}
            title={getTooltipText()}
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                <span className="hidden sm:inline">Submitting...</span>
                <span className="sm:hidden">Submitting</span>
              </>
            ) : (
              <>
                {submitIcon && <span className="text-sm">{submitIcon}</span>}
                <span className="truncate">{submitLabel}</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className={`${getNextButtonStyles()} flex items-center justify-center gap-2 transition-all duration-300 w-full sm:w-auto order-1 sm:order-2`}
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
