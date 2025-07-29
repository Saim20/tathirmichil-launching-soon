"use client";
import React from "react";
import {
  FaCalendarAlt,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaHandshake,
  FaInfoCircle,
} from "react-icons/fa";
import { FormStepProps, PreferredTimingProps, PhotoUploadProps } from "./types";
import StepContainer from "./StepContainer";
import StepHeader from "./StepHeader";
import FormField from "./FormField";
import CheckboxGroup from "./CheckboxGroup";
import StepNavigation from "./StepNavigation";
import { useStepValidation } from "../../hooks/useStepValidation";

interface Step7Props extends FormStepProps, PreferredTimingProps, PhotoUploadProps {}

export default function Step7({
  formData,
  onInputChange,
  onNext,
  onPrev,
  errors,
  submitting,
  photoFile,
  photoPreview,
  onPhotoChange,
  preferredTiming,
  onPreferredTimingChange
}: Step7Props) {
  const { handleValidationChange, isStepValid } = useStepValidation();
  
  // Custom validation for Step7 that includes all required fields across all steps
  const isStep7Valid = () => {
    // Check all required fields across all steps
    const validationErrors = [];

    // Step 1 - Basic Information (including photo)
    if (!formData.fullName?.trim()) validationErrors.push("Full name");
    if (!formData.emailAddress?.trim()) validationErrors.push("Email address");
    if (!formData.phoneNumber?.trim()) validationErrors.push("Phone number");
    if (!formData.facebookProfile?.trim()) validationErrors.push("Facebook profile");
    if (!photoPreview?.trim() && !photoFile) validationErrors.push("Profile picture");

    // Step 2 - Academic Information
    if (!formData.school?.trim()) validationErrors.push("School");
    if (!formData.college?.trim()) validationErrors.push("College");
    if (!formData.group) validationErrors.push("Group");
    if (!formData.hscBatch) validationErrors.push("HSC batch");
    if (!formData.academicDescription?.trim()) validationErrors.push("Academic background");

    // Step 3 - Personal Questions
    if (!formData.personalDescription?.trim()) validationErrors.push("Personal description");
    if (!formData.whyIBA?.trim()) validationErrors.push("Why IBA");
    if (!formData.whyApplyingHere?.trim()) validationErrors.push("Why applying here");
    if (!formData.ifNotIBA?.trim()) validationErrors.push("Expectations");

    // Step 4 - Preparation Details
    if (!formData.prepTimeline) validationErrors.push("Preparation timeline");
    if (!formData.strugglingAreas || formData.strugglingAreas.length === 0) {
      validationErrors.push("Struggling areas");
    }
    if (!formData.fiveYearsVision?.trim()) validationErrors.push("Five years vision");
    if (!formData.otherPlatforms?.trim()) validationErrors.push("Other platforms");
    if (!formData.admissionPlans?.trim()) validationErrors.push("Admission plans");

    // Step 5 - Commitment
    if (!formData.stableInternet) validationErrors.push("Internet stability");
    if (!formData.videoCameraOn) validationErrors.push("Video camera preference");
    if (!formData.attendClasses) validationErrors.push("Class attendance");
    if (!formData.activeParticipation) validationErrors.push("Active participation");
    if (!formData.skipOtherCoachings) validationErrors.push("Other coaching commitment");
    if (!formData.stickTillExam) validationErrors.push("Exam commitment");

    // Step 6 - Reflection
    if (!formData.recentFailure?.trim()) validationErrors.push("Recent failure");
    if (!formData.lastBookVideoArticle?.trim()) validationErrors.push("Last book/video/article");

    // Step 7 - Final Details
    if (!preferredTiming || preferredTiming.length === 0) {
      validationErrors.push("Preferred timing");
    }
    if (!formData.preferredBatchType) validationErrors.push("Preferred batch type");

    const isValid = validationErrors.length === 0;
    
    // Log validation state for debugging
    if (!isValid) {
      console.log('Form validation failed. Missing fields:', validationErrors);
    }
    
    return isValid;
  };
  const timingOptions = [
    "Sat & Wed 7-9 PM",
    "Sun & Tue 7-9 PM", 
    "Mon & Thu 7-9 PM",
    "Sat & Wed 10-12 PM",
    "Sun & Tue 10-12 PM",
    "Mon & Thu 10-12 PM",
    "Flexible - Any time",
    "None"
  ];

  return (
    <StepContainer>
      <StepHeader
        stepNumber={7}
        title="Final Details"
        description="Last step! Let's finalize your preferences"
        icon={<FaCalendarAlt />}
      />

      <div className="grid grid-cols-1 gap-8">
        <FormField
          id="referral"
          label="Referral — is there anyone I know who will vouch for you?"
          icon={<FaHandshake />}
          value={formData.referral || ""}
          onChange={(value) => onInputChange("referral", value)}
          onValidationChange={handleValidationChange}
          placeholder='Enter name or write "None"'
          errors={errors}
        />

        <FormField
          id="preferredStartDate"
          label="When do you prefer to start classes?"
          icon={<FaCalendarAlt />}
          value={formData.preferredStartDate || ""}
          onChange={(value) => onInputChange("preferredStartDate", value)}
          onValidationChange={handleValidationChange}
          placeholder='Enter date (e.g., "Next Monday") or "ASAP"'
          errors={errors}
        />

        <CheckboxGroup
          id="preferredTiming"
          label="Preferred class timing (select all that apply)"
          options={timingOptions}
          required
          selectedValues={preferredTiming}
          onChange={onPreferredTimingChange}
          onValidationChange={handleValidationChange}
          tip="Choose all time slots that work for you"
        />

        <FormField
          id="preferredBatchType"
          label="Preferred batch type"
          icon={<FaClock />}
          type="select"
          required
          value={formData.preferredBatchType || "Regular"}
          onChange={(value) => onInputChange("preferredBatchType", value)}
          onValidationChange={handleValidationChange}
          options={[
            { value: "Regular", label: "Regular" },
            { value: "Crash", label: "Crash" }
          ]}
          errors={errors}
        />
      </div>

      {/* Important Information */}
      <div className="mt-8 p-6 bg-gradient-to-r from-tathir-dark-green/20 to-tathir-brown/20 rounded-xl border-2 border-tathir-light-green/30">
        <div className="flex items-start gap-4">
          <FaInfoCircle className="text-tathir-light-green text-xl mt-1 flex-shrink-0" />
          <div className="space-y-3">
            <h4 className="text-tathir-cream font-bold text-lg">
              Before You Submit
            </h4>
            <div className="space-y-2 text-tathir-cream/90 text-sm">
              <p>
                <strong>Confirmation Email:</strong> You'll receive a detailed
                confirmation within minutes
              </p>
              <p>
                <strong>Review Process:</strong> I'll review your application
                within 2-3 days
              </p>
              <p>
                <strong>Final Check:</strong> Make sure all information is
                accurate - you can't edit after submission
              </p>
              <p>
                <strong>Next Steps:</strong> If selected, I'll contact you with
                batch details
              </p>
            </div>
          </div>
        </div>
      </div>

      <StepNavigation
        onPrev={onPrev}
        prevLabel="Back to Reflection"
        showSubmit={true}
        submitting={submitting}
        isStepValid={isStep7Valid()}
        submitLabel={
          submitting ? "Submitting Application..." : "Submit Application"
        }
        submitIcon={
          submitting ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaCheckCircle />
          )
        }
      />
    </StepContainer>
  );
}
