"use client";
import React, { useContext } from "react";
import { AuthContext } from "@/lib/auth/auth-provider";
import { useFormState } from "@/hooks/useFormState";
import { 
  FormHeader,
  ProgressIndicator,
  SuccessView,
  LoadingView,
  FormRenderer
} from "@/components/form";

export default function PersonalBatchFormPage() {
  const { user } = useContext(AuthContext) || {};
  const formState = useFormState();

  // Destructure all needed state from the hook
  const {
    loading,
    submitted,
    isEditing,
    existingFormData,
    submitError,
    submitSuccess,
    currentStep,
    totalSteps,
    autoSaveStatus,
    loadSavedData,
    getSavedDataInfo,
    hasUnsavedChanges,
    handleSubmit,
    setIsEditing,
    setSubmitted,
    setCurrentStep,
    goToStep,
    getStepTitle,
    isStepCompleted,
    completedSteps,
    setCompletedSteps,
    formData,
    photoFile,
    photoPreview
  } = formState;

  // Helper function to check if any saved data exists
  const hasAnySavedData = () => {
    const savedDataInfo = getSavedDataInfo();
    return savedDataInfo.exists && !savedDataInfo.isExpired;
  };

  // Helper function to restore saved data
  const restoreSavedData = () => {
    const savedData = loadSavedData();
    if (savedData?.formData) {
      formState.setFormData(savedData.formData);
      if (savedData.currentStep) {
        setCurrentStep(savedData.currentStep);
      }
      if (savedData.completedSteps) {
        setCompletedSteps(new Set(savedData.completedSteps));
      }
      console.log('🔄 Restored saved data from localStorage');
    }
  };

  // Show loading view
  if (loading) {
    return <LoadingView />;
  }

  // Show success view when submitted and not editing
  if (submitted && !isEditing) {
    return (
      <SuccessView
        existingFormData={existingFormData}
        formData={formState.formData}
        setIsEditing={setIsEditing}
        setSubmitted={setSubmitted}
        setCurrentStep={setCurrentStep}
      />
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FormHeader
          existingFormData={existingFormData}
        />

        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          goToStep={goToStep}
          getStepTitle={getStepTitle}
          isStepCompleted={isStepCompleted}
          completedSteps={completedSteps}
          formData={formData}
          photoPreview={photoPreview}
          photoFile={photoFile}
          hasUnsavedChanges={hasUnsavedChanges}
          autoSaveStatus={autoSaveStatus}
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Current Step Content */}
          <FormRenderer formState={formState} />

          {/* Error and Success Messages */}
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-bold">Error</p>
              <p>{submitError}</p>
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              <p className="font-bold">Success</p>
              <p>{submitSuccess}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
