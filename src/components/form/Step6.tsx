"use client";
import React from "react";
import { FaBullseye, FaHeart, FaBook } from "react-icons/fa";
import { FormStepProps } from "./types";
import StepContainer from "./StepContainer";
import StepHeader from "./StepHeader";
import FormField from "./FormField";
import StepNavigation from "./StepNavigation";

export default function Step6({ 
  formData, 
  errors, 
  onInputChange, 
  onNext,
  onPrev,
  onBlur,
  validationErrors,
  completedFieldsCount,
  totalFieldsCount
}: FormStepProps) {
  return (
    <StepContainer>
      <StepHeader
        stepNumber={6}
        title="Personal Reflection"
        description="Help us understand your mindset and learning approach"
        icon={<FaBullseye />}
      />

      <div className="grid grid-cols-1 gap-8">
        <FormField
          id="recentFailure"
          label="Tell me about a recent failure and what you learned from it"
          icon={<FaHeart />}
          type="textarea"
          onBlur={onBlur}
          required
          value={formData.recentFailure || ""}
          onChange={(value) => onInputChange("recentFailure", value)}
          placeholder="Share a meaningful experience where you faced failure and the lessons learned..."
          rows={5}
          errors={errors}
        />

        <FormField
          id="lastBookVideoArticle"
          label="What's the last meaningful book/video/article you consumed?"
          icon={<FaBook />}
          type="textarea"
          onBlur={onBlur}
          required
          value={formData.lastBookVideoArticle || ""}
          onChange={(value) => onInputChange("lastBookVideoArticle", value)}
          placeholder="Tell us about something you recently read/watched that impacted you and why..."
          rows={4}
          errors={errors}
        />
      </div>

      <StepNavigation
        onNext={onNext}
        onPrev={onPrev}
        validationErrors={validationErrors || []}
        completedFieldsCount={completedFieldsCount || 0}
        totalFieldsCount={totalFieldsCount || 0}
        nextLabel="Final Step"
        prevLabel="Back to Commitment"
      />
    </StepContainer>
  );
}
