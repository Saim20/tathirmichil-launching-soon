"use client";
import React from "react";
import { FaExclamationCircle, FaCheckCircle, FaInfoCircle } from "react-icons/fa";

interface ValidationError {
  field: string;
  message: string;
}

interface StepValidationIndicatorProps {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
  className?: string;
}

export default function StepValidationIndicator({
  isValid,
  errors,
  warnings = [],
  className = ""
}: StepValidationIndicatorProps) {
  // Don't show anything if valid and no warnings - let the button handle the positive feedback
  if (isValid && warnings.length === 0) {
    return null;
  }

  if (!isValid && errors.length > 0) {
    // Group errors by type for better organization
    const requiredFields = errors.filter(e => e.message.includes('required'));
    const requiredFieldNames = new Set(requiredFields.map(e => e.field));
    
    // Only show validation errors for fields that don't have required field errors
    const validationErrors = errors.filter(e => 
      !e.message.includes('required') && !requiredFieldNames.has(e.field)
    );

    return (
      <div className={`bg-red-500/10 border border-red-500/30 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <FaExclamationCircle className="text-red-400 text-lg mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-red-400 font-semibold mb-3">
              {(requiredFields.length + validationErrors.length) === 1 
                ? 'Please fix this issue:' 
                : `${requiredFields.length + validationErrors.length} issues need to be resolved:`
              }
            </h4>
            
            {requiredFields.length > 0 && (
              <div className="mb-3">
                <p className="text-red-300 text-sm font-medium mb-2">Missing required fields:</p>
                <ul className="space-y-1 ml-4">
                  {requiredFields.map((error, index) => (
                    <li key={`required-${index}`} className="text-red-300 text-sm flex items-start gap-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{error.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div>
                <p className="text-red-300 text-sm font-medium mb-2">Validation errors:</p>
                <ul className="space-y-1 ml-4">
                  {validationErrors.map((error, index) => (
                    <li key={`validation-${index}`} className="text-red-300 text-sm flex items-start gap-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{error.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (warnings.length > 0) {
    return (
      <div className={`bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-yellow-400 text-lg mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-yellow-400 font-semibold mb-2">
              Optional improvements:
            </h4>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-yellow-300 text-sm">
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
