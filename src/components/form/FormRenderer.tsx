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
    handleStrugglingAreasChange
  } = formState;

  // Render current step content
  const renderCurrentStep = () => {
    
    const commonProps = {
      formData,
      errors,
      onInputChange: handleInputChange,
      onNext: nextStep,
      onPrev: prevStep,
      isFirstStep: currentStep === 1,
      isLastStep: currentStep === totalSteps,
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
        return <Step7 {...commonProps} />;
      default:
        return null;
    }
  };

  return renderCurrentStep();
}
