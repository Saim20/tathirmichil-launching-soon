"use client";
import React from "react";
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
import { useStepValidation } from "@/hooks/useStepValidation";

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
    handlePreferredTimingChange
  } = formState;

  // Use step validation hook
  const stepValidation = useStepValidation();

  // Enhanced next step function that checks validation
  const handleNext = () => {
    if (stepValidation.isStepValid()) {
      nextStep();
      stepValidation.clearValidations(); // Clear validations when moving to next step
    } else {
      // Show validation errors
      console.log('Step validation failed:', stepValidation.getStepErrors());
    }
  };

  // Enhanced prev step function
  const handlePrev = () => {
    prevStep();
    stepValidation.clearValidations(); // Clear validations when moving to prev step
  };

  // Render current step content
  const renderCurrentStep = () => {
    
    const commonProps = {
      formData,
      errors,
      onInputChange: handleInputChange,
      onNext: handleNext,
      onPrev: handlePrev,
      onValidationChange: stepValidation.handleValidationChange,
      isFirstStep: currentStep === 1,
      isLastStep: currentStep === totalSteps,
      isStepValid: stepValidation.isStepValid(),
      submitting
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
            onStrugglingAreasChange={handleStrugglingAreasChange}
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
            photoFile={photoFile}
            photoPreview={photoPreview}
            onPhotoChange={handlePhotoChange}
            preferredTiming={formData.preferredTiming || []}
            onPreferredTimingChange={handlePreferredTimingChange}
          />
        );
      default:
        return null;
    }
  };

  return renderCurrentStep();
}
