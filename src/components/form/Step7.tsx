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
import { FormValidationErrors } from "@/lib/models/form";

interface ValidationProps {
  getAllValidationErrors: FormValidationErrors;
}
interface Step7Props extends FormStepProps, PreferredTimingProps, PhotoUploadProps, ValidationProps {}

export default function Step7({
  formData,
  onInputChange,
  onPrev,
  errors,
  submitting,
  preferredTiming,
  onPreferredTimingChange,
  validationErrors = [],
  completedFieldsCount = 0,
  totalFieldsCount = 0,
  onBlur,
  getAllValidationErrors,
}: Step7Props) {
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
          placeholder='Enter name or write "None"'
          errors={errors}
        />

        <FormField
          id="selectedBatch"
          label="Select Batch"
          icon={<FaCalendarAlt />}
          type="select"
          onBlur={onBlur}
          required
          value={formData.selectedBatch || ""}
          onChange={(value) => onInputChange("selectedBatch", value)}
          options={[
            { value: "", label: "Choose a batch..." },
            { value: "Batch 4.1 - 10-12 PM - Sat, Tue - starts on Aug 23", label: "Batch 4.1 - 10-12 PM - Sat, Tue - starts on Aug 23" },
            { value: "Batch 4.2 - 7-9 PM - Sat, Tue - starts on Aug 26", label: "Batch 4.2 - 7-9 PM - Sat, Tue - starts on Aug 26" },
            { value: "Batch 4.3 - 10-12 PM - Sun, Wed - starts on Aug 27", label: "Batch 4.3 - 10-12 PM - Sun, Wed - starts on Aug 27" },
            { value: "Crash Batch - 10-12 PM - starts after BUP circular", label: "Crash Batch - 10-12 PM - starts after BUP circular" }
          ]}
          errors={errors}
          tip="(Subject to change)"
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
                <strong>Review Process:</strong> You'll get your results on this same link
              </p>
              <p>
                <strong>Final Check:</strong> Make sure all information is
                accurate.
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
        isLastStep={true}
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
        validationErrors={validationErrors}
        allValidationErrors={getAllValidationErrors}
        completedFieldsCount={completedFieldsCount}
        totalFieldsCount={totalFieldsCount}
      />
    </StepContainer>
  );
}
