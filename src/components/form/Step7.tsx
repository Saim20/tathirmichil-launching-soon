"use client";
import React from "react";
import {
  FaCalendarAlt,
  FaSpinner,
  FaCheckCircle,
  FaUsers,
  FaClock,
  FaHandshake,
  FaInfoCircle,
} from "react-icons/fa";
import { FormStepProps } from "./types";
import StepContainer from "./StepContainer";
import StepHeader from "./StepHeader";
import FormField from "./FormField";
import StepNavigation from "./StepNavigation";

export default function Step7({
  formData,
  errors,
  onInputChange,
  onPrev,
  submitting,
  isLastStep,
}: FormStepProps) {
  const timingOptions = [
    { value: "SatWed7_9PM", label: "Sat & Wed 7-9 PM" },
    { value: "SunTue7_9PM", label: "Sun & Tue 7-9 PM" },
    { value: "MonThu7_9PM", label: "Mon & Thu 7-9 PM" },
    { value: "SatWed10_12PM", label: "Sat & Wed 10-12 PM" },
    { value: "SunTue10_12PM", label: "Sun & Tue 10-12 PM" },
    { value: "MonThu10_12PM", label: "Mon & Thu 10-12 PM" },
    { value: "Flexible", label: "Flexible - Any time" },
    { value: "None", label: "None" },
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
          id="preferredStartDate"
          label="When do you prefer to start classes?"
          icon={<FaCalendarAlt />}
          value={formData.preferredStartDate || ""}
          onChange={(value) => onInputChange("preferredStartDate", value)}
          placeholder='Enter date (e.g., "Next Monday") or "ASAP"'
          errors={errors}
        />

        <FormField
          id="preferredTiming"
          label="Preferred class timing"
          icon={<FaClock />}
          type="select"
          value={formData.preferredTiming || "Evening"}
          onChange={(value) => onInputChange("preferredTiming", value)}
          options={timingOptions}
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
