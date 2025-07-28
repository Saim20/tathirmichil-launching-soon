"use client";
import React from "react";
import { FaUsers, FaHeart, FaBullseye, FaLightbulb } from "react-icons/fa";
import { FormStepProps } from "./types";
import StepContainer from "./StepContainer";
import StepHeader from "./StepHeader";
import FormField from "./FormField";
import StepNavigation from "./StepNavigation";

export default function Step3({ 
  formData, 
  errors, 
  onInputChange, 
  onNext,
  onPrev
}: FormStepProps) {
  return (
    <StepContainer>
      <StepHeader
        stepNumber={3}
        title="Personal Questions"
        description="Help me understand your motivations and goals"
        icon={<FaUsers />}
      />

      <div className="space-y-8">
        <FormField
          id="personalDescription"
          label="Tell me about yourself"
          icon={<FaUsers />}
          type="textarea"
          required
          value={formData.personalDescription || ""}
          onChange={(value) => onInputChange("personalDescription", value)}
          placeholder="Share your personality, interests, hobbies, values, dreams, and what makes you unique. Be authentic and let your voice shine through!"
          rows={6}
          errors={errors}
        />

        <FormField
          id="whyIBA"
          label="Why do you want to get into IBA?"
          icon={<FaHeart />}
          type="textarea"
          required
          value={formData.whyIBA || ""}
          onChange={(value) => onInputChange("whyIBA", value)}
          placeholder="Share your motivation for choosing IBA. What draws you to this institution? What are your goals?"
          rows={4}
          errors={errors}
        />

        <FormField
          id="whyApplyingHere"
          label="Why are you applying here?"
          icon={<FaBullseye />}
          type="textarea"
          required
          value={formData.whyApplyingHere || ""}
          onChange={(value) => onInputChange("whyApplyingHere", value)}
          placeholder="What brought you so far?"
          rows={4}
          errors={errors}
        />

        <FormField
          id="ifNotIBA"
          label="What are your expectations from this batch?"
          icon={<FaLightbulb />}
          type="textarea"
          required
          value={formData.ifNotIBA || ""}
          onChange={(value) => onInputChange("ifNotIBA", value)}
          placeholder="Share your expectations, goals, and what you hope to achieve through this program."
          rows={4}
          errors={errors}
        />
      </div>

      <StepNavigation
        onPrev={onPrev}
        onNext={onNext}
        nextLabel="Continue to Preferences"
        prevLabel="Back to Academic Info"
      />
    </StepContainer>
  );
}
