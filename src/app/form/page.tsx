"use client";
import React, { useContext } from "react";
import { AuthContext } from "@/lib/auth/auth-provider";
import { useFormState } from "@/hooks/useFormState";
import { 
  FormHeader,
  ProgressIndicator,
  SuccessView,
  LoadingView,
  FormRenderer,
  FormStatus
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
    handleSubmit,
    setIsEditing,
    setSubmitted,
    setCurrentStep,
    goToStep,
    getStepTitle,
    isStepCompleted,
    completedSteps
  } = formState;

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
        />

        {/* Auto-save Status */}
        {!submitted && (
          <FormStatus 
            autoSaveStatus={autoSaveStatus} 
            onRestoreData={() => {
              const savedData = loadSavedData();
              if (savedData) {
                formState.setFormData(savedData);
              }
            }}
            hasSavedData={getSavedDataInfo().exists}
          />
        )}

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
