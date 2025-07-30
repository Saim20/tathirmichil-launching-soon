"use client";
import React, { useCallback, useRef } from "react";
import { 
  Step1, 
  Step2, 
  Step3, 
  Step4, 
  Step5, 
  Step6, 
  Step7
} from "@/components/form";
import { UseFormStateReturn } from "@/hooks/useFormState";

interface FormRendererProps {
  formState: UseFormStateReturn;
}

export default function FormRenderer({ formState }: FormRendererProps) {
  const {
    currentStep,
    totalSteps,
    formData,
    errors,
    handleInputChange,
    nextStep,
    prevStep,
    submitting,
    photoFile,
    photoPreview,
    handlePhotoChange,
    handleStrugglingAreasChange,
    handlePreferredTimingChange,
    getAllValidationErrors,
    getCurrentStepValidationErrors,
    getCompletedFieldsCount,
    getTotalFieldsCount,
    validateAndSetCurrentStepErrors
  } = formState;

  // Debounce timeout ref
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced input change handler with proper debouncing
  const handleInputChangeWithValidation = useCallback((field: string, value: any) => {
    // Update the form data first
    handleInputChange(field, value);
    
    // Clear existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    // Set new timeout for validation (shorter delay for better UX)
    validationTimeoutRef.current = setTimeout(() => {
      validateAndSetCurrentStepErrors();
    }, 300);
  }, [handleInputChange, validateAndSetCurrentStepErrors]);

  // Immediate validation on blur
  const handleBlurValidation = useCallback(() => {
    // Clear any pending timeout and validate immediately
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    validateAndSetCurrentStepErrors();
  }, [validateAndSetCurrentStepErrors]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  // Enhanced struggling areas handler
  const handleStrugglingAreasChangeWithValidation = (area: string, checked: boolean) => {
    handleStrugglingAreasChange(area, checked);
    
    // Trigger validation after change
    setTimeout(() => {
      validateAndSetCurrentStepErrors();
    }, 100);
  };

  // Enhanced preferred timing handler
  const handlePreferredTimingChangeWithValidation = (timing: string, checked: boolean) => {
    handlePreferredTimingChange(timing, checked);
    
    // Trigger validation after change
    setTimeout(() => {
      validateAndSetCurrentStepErrors();
    }, 100);
  };

  // Enhanced next step function that checks validation
  const handleNext = () => {
    const isValid = validateAndSetCurrentStepErrors();
    
    if (isValid) {
      nextStep();
    } else {
      // Show validation errors in console for debugging
      console.log('Step validation failed:', getCurrentStepValidationErrors());
    }
  };

  // Enhanced prev step function
  const handlePrev = () => {
    prevStep();
  };

  // Render current step content
  const renderCurrentStep = () => {
    
    const commonProps = {
      formData,
      errors,
      onInputChange: handleInputChangeWithValidation,
      onBlur: handleBlurValidation,
      onNext: handleNext,
      onPrev: handlePrev,
      isFirstStep: currentStep === 1,
      isLastStep: currentStep === totalSteps,
      submitting,
      validationErrors: getCurrentStepValidationErrors(),
      completedFieldsCount: getCompletedFieldsCount(),
      totalFieldsCount: getTotalFieldsCount()
    };

    switch (currentStep) {
      case 1:
        return (
          <Step1 
            {...commonProps}
            photoFile={photoFile}
            photoPreview={photoPreview}
            onPhotoChange={handlePhotoChange}
          />
        );
      case 2:
        return <Step2 {...commonProps} />;
      case 3:
        return <Step3 {...commonProps} />;
      case 4:
        return (
          <Step4 
            {...commonProps}
            strugglingAreas={formData.strugglingAreas || []}
            onStrugglingAreasChange={handleStrugglingAreasChangeWithValidation}
          />
        );
      case 5:
        return <Step5 {...commonProps} />;
      case 6:
        return <Step6 {...commonProps} />;
      case 7:
        return (
          <Step7 
            {...commonProps}
            getAllValidationErrors={getAllValidationErrors()}
            photoFile={photoFile}
            photoPreview={photoPreview}
            onPhotoChange={handlePhotoChange}
            preferredTiming={formData.preferredTiming || []}
            onPreferredTimingChange={handlePreferredTimingChangeWithValidation}
          />
        );
      default:
        return null;
    }
  };

  return renderCurrentStep();
}
