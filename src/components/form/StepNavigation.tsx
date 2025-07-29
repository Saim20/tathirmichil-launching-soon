"use client";
import React from "react";
import { FaArrowLeft, FaArrowRight, FaSpinner } from "react-icons/fa";
import { buttonClassName, secondaryButtonClassName } from "./utils";

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
  isStepValid?: boolean;
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
  isStepValid = true,
}: StepNavigationProps) {
  return (
    <div className="flex justify-between mt-8">
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
          title={!isStepValid ? 'Please complete all required fields' : ''}
        >
          {submitIcon}
          {submitLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className={`${buttonClassName} flex items-center gap-2 ${
            !isStepValid ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={submitting || !isStepValid}
          title={!isStepValid ? 'Please complete all required fields' : ''}
        >
          {nextLabel}
          {!isLastStep && <FaArrowRight />}
        </button>
      )}
    </div>
  );
}
