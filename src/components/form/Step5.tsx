"use client";
import React from "react";
import { FaHeart, FaWifi, FaVideo, FaCalendarCheck, FaComments, FaPause, FaLock } from "react-icons/fa";
import { FormStepProps } from "./types";
import StepContainer from "./StepContainer";
import StepHeader from "./StepHeader";
import FormField from "./FormField";
import StepNavigation from "./StepNavigation";

export default function Step5({ 
  formData, 
  errors, 
  onInputChange, 
  onNext,
  onPrev
}: FormStepProps) {
  const internetOptions = [
    { value: "Yes", label: "Yes - High speed & reliable" },
    { value: "Mostly", label: "Mostly - Occasional issues" },
    { value: "Sometimes", label: "Sometimes - Frequent problems" },
    { value: "No", label: "No - Very unstable" }
  ];

  const videoOptions = [
    { value: "I agree", label: "I agree - Camera will be on" },
    { value: "Sometimes", label: "Sometimes - When possible" },
    { value: "I disagree", label: "I disagree - Prefer camera off" }
  ];

  const attendanceOptions = [
    { value: "Always unless emergency", label: "Always unless emergency" },
    { value: "Most of the time", label: "Most of the time" },
    { value: "When I can", label: "When I can" },
    { value: "Rarely", label: "Rarely" }
  ];

  const participationOptions = [
    { value: "Sure", label: "Sure - Love to participate" },
    { value: "Probably", label: "Probably - When comfortable" },
    { value: "If needed", label: "If needed - Only when asked" },
    { value: "I'm shy", label: "I'm shy - Prefer listening" }
  ];

  const skipCoachingOptions = [
    { value: "Done", label: "Done - This is my priority" },
    { value: "Will try", label: "Will try - Depends on schedule" },
    { value: "If necessary", label: "If necessary - Hard to decide" },
    { value: "Cannot", label: "Cannot - Have other commitments" }
  ];

  const commitmentOptions = [
    { value: "Locked in", label: "Locked in - 100% committed" },
    { value: "Most likely", label: "Most likely - Very committed" },
    { value: "Depends", label: "Depends - Will see how it goes" },
    { value: "Probably not", label: "Probably not - Uncertain" }
  ];

  return (
    <StepContainer>
      <StepHeader
        stepNumber={5}
        title="Commitment & Expectations"
        description="Let's ensure we're aligned on learning expectations"
        icon={<FaHeart />}
      />

      <div className="grid grid-cols-1 gap-8">
        <FormField
          id="stableInternet"
          label="Do you have stable internet?"
          icon={<FaWifi />}
          type="select"
          required
          value={formData.stableInternet || "Yes"}
          onChange={(value) => onInputChange("stableInternet", value)}
          options={internetOptions}
          errors={errors}
        />

        <FormField
          id="videoCameraOn"
          label="I will keep my video camera on during classes (Mandatory)"
          icon={<FaVideo />}
          type="select"
          required
          value={formData.videoCameraOn || "I agree"}
          onChange={(value) => onInputChange("videoCameraOn", value)}
          options={videoOptions}
          errors={errors}
        />

        <FormField
          id="attendClasses"
          label="I will attend classes regularly"
          icon={<FaCalendarCheck />}
          type="select"
          required
          value={formData.attendClasses || "Always unless emergency"}
          onChange={(value) => onInputChange("attendClasses", value)}
          options={attendanceOptions}
          errors={errors}
        />

        <FormField
          id="activeParticipation"
          label="I will actively participate in classes"
          icon={<FaComments />}
          type="select"
          required
          value={formData.activeParticipation || "Sure"}
          onChange={(value) => onInputChange("activeParticipation", value)}
          options={participationOptions}
          errors={errors}
        />

        <FormField
          id="skipOtherCoachings"
          label="I will skip other coachings/classes during this batch"
          icon={<FaPause />}
          type="select"
          required
          value={formData.skipOtherCoachings || "Done"}
          onChange={(value) => onInputChange("skipOtherCoachings", value)}
          options={skipCoachingOptions}
          errors={errors}
        />

        <FormField
          id="stickTillExam"
          label="I will stick with this batch till my exam"
          icon={<FaLock />}
          type="select"
          required
          value={formData.stickTillExam || "Locked in"}
          onChange={(value) => onInputChange("stickTillExam", value)}
          options={commitmentOptions}
          errors={errors}
        />
      </div>

      <StepNavigation
        onNext={onNext}
        onPrev={onPrev}
        nextLabel="Continue to Personality"
        prevLabel="Back to Preparation"
      />
    </StepContainer>
  );
}
