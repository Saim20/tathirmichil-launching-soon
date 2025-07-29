"use client";
import React from "react";
import { FaGraduationCap, FaSchool, FaUniversity, FaBookOpen, FaCalendarAlt } from "react-icons/fa";
import { FormStepProps } from "./types";
import StepContainer from "./StepContainer";
import StepHeader from "./StepHeader";
import FormField from "./FormField";
import StepNavigation from "./StepNavigation";
import { useStepValidation } from "../../hooks/useStepValidation";

export default function Step2({ 
  formData, 
  errors, 
  onInputChange, 
  onNext, 
  onPrev
}: FormStepProps) {
  const { handleValidationChange, isStepValid } = useStepValidation();
  return (
    <StepContainer>
      <StepHeader
        stepNumber={2}
        title="Academic Information"
        description="Tell me about your educational background"
        icon={<FaGraduationCap />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormField
          id="school"
          label="School"
          icon={<FaSchool />}
          required
          value={formData.school || ""}
          onChange={(value) => onInputChange("school", value)}
          onValidationChange={handleValidationChange}
          placeholder="Enter your school name"
          errors={errors}
        />

        <FormField
          id="college"
          label="College"
          icon={<FaUniversity />}
          required
          value={formData.college || ""}
          onChange={(value) => onInputChange("college", value)}
          onValidationChange={handleValidationChange}
          placeholder="Enter your college name"
          errors={errors}
        />

        <FormField
          id="group"
          label="Group"
          icon={<FaBookOpen />}
          type="select"
          required
          value={formData.group || "Science"}
          onChange={(value) => onInputChange("group", value)}
          options={[
            { value: "Science", label: "Science" },
            { value: "Commerce", label: "Commerce" },
            { value: "Arts", label: "Arts" },
            { value: "Mixed", label: "Mixed" }
          ]}
          errors={errors}
        />

        <FormField
          id="hscBatch"
          label="HSC Batch Year"
          icon={<FaCalendarAlt />}
          type="select"
          required
          value={formData.hscBatch || "2025"}
          onChange={(value) => onInputChange("hscBatch", value)}
          options={[
            { value: "2025", label: "2025" },
            { value: "2026", label: "2026" },
            { value: "2027", label: "2027" },
            { value: "Other", label: "Other" }
          ]}
          errors={errors}
        />

        {formData.hscBatch === "Other" && (
          <FormField
            id="hscBatchOther"
            label="Specify HSC Batch Year"
            icon={<FaCalendarAlt />}
            value={formData.hscBatchOther || ""}
            onChange={(value) => onInputChange("hscBatchOther", value)}
            placeholder="Enter your HSC batch year"
            errors={errors}
          />
        )}

        <div className="lg:col-span-2">
          <FormField
            id="academicDescription"
            label="Academic Background"
            icon={<FaBookOpen />}
            type="textarea"
            required
            value={formData.academicDescription || ""}
            onChange={(value) => onInputChange("academicDescription", value)}
            onValidationChange={handleValidationChange}
            placeholder="Share your academic interests, strengths, challenges, and what motivates you to study."
            rows={6}
            errors={errors}
          />
        </div>
      </div>

            <StepNavigation
        onPrev={onPrev}
        onNext={onNext}
        isStepValid={isStepValid()}
        nextLabel="Continue to Motivations"
        prevLabel="Back to Personal Info"
      />
    </StepContainer>
  );
}
