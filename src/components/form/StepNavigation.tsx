"use client";
import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
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
}

export default function StepNavigation({
  onPrev,
  onNext,
  prevLabel = "Previous Step",
  nextLabel = "Next Step",
  isFirstStep = false,
  isLastStep = false,
  showSubmit = false,
  submitting = false,
  submitLabel = "Submit",
  submitIcon
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
          className={`${buttonClassName} flex items-center gap-2`}
          disabled={submitting}
        >
          {submitIcon}
          {submitLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className={buttonClassName}
        >
          {nextLabel}
          {!isLastStep && <FaArrowRight />}
        </button>
      )}
    </div>
  );
}
