"use client";
import React from "react";
import { FaLightbulb, FaClock, FaBullseye, FaRoad, FaUsers } from "react-icons/fa";
import { FormStepProps, StrugglingAreasProps } from "./types";
import StepContainer from "./StepContainer";
import StepHeader from "./StepHeader";
import FormField from "./FormField";
import CheckboxGroup from "./CheckboxGroup";
import StepNavigation from "./StepNavigation";
import { useStepValidation } from "../../hooks/useStepValidation";

interface Step4Props extends FormStepProps, StrugglingAreasProps {}

export default function Step4({ 
  formData, 
  errors, 
  onInputChange, 
  onNext,
  onPrev,
  strugglingAreas,
  onStrugglingAreasChange,
}: Step4Props) {
  const { handleValidationChange, isStepValid } = useStepValidation();
  const subjectAreas = [
    "English",
    "Mathematics", 
    "Analytical Ability",
    "Time Management",
    "Nerve Management",
    "Writing",
    "Viva"
  ];

  const timelineOptions = [
    { value: "I know nothing", label: "I know nothing" },
    { value: "I know a little bit", label: "I know a little bit" },
    { value: "I've prepared somewhat", label: "I've prepared somewhat" },
    { value: "I've prepared a lot already", label: "I've prepared a lot already" },
  ];

  return (
    <StepContainer>
      <StepHeader
        stepNumber={4}
        title="Preparation Details"
        description="Help us understand your study plans and goals"
        icon={<FaLightbulb />}
      />

      <div className="grid grid-cols-1 gap-8">
        <FormField
          id="prepTimeline"
          label="How long have you prepared for IBA?"
          icon={<FaClock />}
          type="select"
          required
          value={formData.prepTimeline || "2-3 months"}
          onChange={(value) => onInputChange("prepTimeline", value)}
          onValidationChange={handleValidationChange}
          options={timelineOptions}
          errors={errors}
        />

        <CheckboxGroup
          id="strugglingAreas"
          label="Which sections do you struggle with?"
          options={subjectAreas}
          required
          selectedValues={strugglingAreas}
          onChange={onStrugglingAreasChange}
          onValidationChange={handleValidationChange}
        />

        <FormField
          id="fiveYearsVision"
          label="Where do you see yourself 5 years from now?"
          icon={<FaBullseye />}
          type="textarea"
          required
          value={formData.fiveYearsVision || ""}
          onChange={(value) => onInputChange("fiveYearsVision", value)}
          onValidationChange={handleValidationChange}
          placeholder="Share your long-term goals and aspirations..."
          rows={4}
          errors={errors}
        />

        <FormField
          id="otherPlatforms"
          label="What other platforms are you using for preparation?"
          icon={<FaUsers />}
          type="textarea"
          required
          value={formData.otherPlatforms || ""}
          onChange={(value) => onInputChange("otherPlatforms", value)}
          onValidationChange={handleValidationChange}
          placeholder="List other coaching centers, online platforms, tutors, etc. You do not need any other coaching or tutor for IBA/BUP preparation."
          rows={3}
          errors={errors}
        />

        <FormField
          id="admissionPlans"
          label="What are your admission plans?"
          icon={<FaRoad />}
          type="textarea"
          required
          value={formData.admissionPlans || ""}
          onChange={(value) => onInputChange("admissionPlans", value)}
          onValidationChange={handleValidationChange}
          placeholder="List out all options and decisions with some explanation and proper order. This will help me guide you better."
          rows={3}
          errors={errors}
        />
      </div>

      <StepNavigation
        onNext={onNext}
        onPrev={onPrev}
        isStepValid={isStepValid()}
        nextLabel="Continue to Additional Info"
        prevLabel="Back to Academic Info"
      />
    </StepContainer>
  );
}
