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
  SubmissionStatus,
} from "@/components/form";

export default function PersonalBatchFormPage() {
  const { userProfile } = useContext(AuthContext) || {};
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
    hasUnsavedChanges,
    handleSubmit,
    setIsEditing,
    setSubmitted,
    setCurrentStep,
    goToStep,
    getStepTitle,
    isStepCompleted,
    completedSteps,
    formData,
    photoFile,
    photoPreview,
    submissionStatus,
    isStepValid,
  } = formState;

  // Show loading view
  if (loading) {
    return <LoadingView />;
  }

  // Show success view when submitted and not editing and submission is actually complete
  if ((submitted && !isEditing && submissionStatus.status === 'submitted') || userProfile?.approvalStatus === 'accepted' || userProfile?.approvalStatus === 'rejected') {
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

        {/* Submission Status - only show when not loading initial data */}
        {!formState.isLoadingInitialData && !loading && (
          <SubmissionStatus
            status={submissionStatus.status}
            lastSubmissionDate={submissionStatus.lastSubmissionDate}
            hasUnsavedChanges={submissionStatus.hasUnsavedChanges}
            autoSaveStatus={autoSaveStatus}
            className="mb-6"
          />
        )}

        {/* Loading placeholder for submission status */}
        {(formState.isLoadingInitialData || loading) && (
          <div className="tathir-glass-dark border border-white/20 rounded-2xl p-4 sm:p-6 shadow-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-tathir-cream"></div>
              <div className="text-tathir-cream text-sm">Checking submission status...</div>
            </div>
          </div>
        )}

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
          isStepValid={isStepValid}
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
