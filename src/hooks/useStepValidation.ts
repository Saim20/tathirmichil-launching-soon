"use client";
import { useState, useCallback } from "react";

interface FieldValidation {
  isValid: boolean;
  error?: string;
}

export const useStepValidation = () => {
  const [fieldValidations, setFieldValidations] = useState<Record<string, FieldValidation>>({});

  // Handle validation change from field components
  const handleValidationChange = useCallback((fieldId: string, isValid: boolean, error?: string) => {
    setFieldValidations(prev => ({
      ...prev,
      [fieldId]: { isValid, error }
    }));
  }, []);

  // Check if current step is valid (all fields are valid)
  const isStepValid = useCallback(() => {
    return Object.values(fieldValidations).every(validation => validation.isValid);
  }, [fieldValidations]);

  // Get all current errors
  const getStepErrors = useCallback(() => {
    const errors: Record<string, string> = {};
    Object.entries(fieldValidations).forEach(([fieldId, validation]) => {
      if (!validation.isValid && validation.error) {
        errors[fieldId] = validation.error;
      }
    });
    return errors;
  }, [fieldValidations]);

  // Clear all validations (useful when changing steps)
  const clearValidations = useCallback(() => {
    setFieldValidations({});
  }, []);

  // Get validation status for a specific field
  const getFieldValidation = useCallback((fieldId: string) => {
    return fieldValidations[fieldId] || { isValid: true };
  }, [fieldValidations]);

  return {
    handleValidationChange,
    isStepValid,
    getStepErrors,
    clearValidations,
    getFieldValidation,
    fieldValidations
  };
};

export type { FieldValidation };
