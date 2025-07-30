"use client";
import React from "react";
import { FaUser, FaPhone, FaEnvelope, FaFacebook, FaMapMarkerAlt } from "react-icons/fa";
import { FormStepProps, PhotoUploadProps } from "./types";
import StepContainer from "./StepContainer";
import StepHeader from "./StepHeader";
import FormField from "./FormField";
import PhotoUpload from "./PhotoUpload";
import StepNavigation from "./StepNavigation";

interface Step1Props extends FormStepProps, PhotoUploadProps {}

export default function Step1({ 
  formData, 
  errors, 
  onInputChange, 
  onNext,
  photoFile,
  photoPreview,
  onBlur,
  onPhotoChange,
  validationErrors = [],
  completedFieldsCount = 0,
  totalFieldsCount = 0
}: Step1Props) {
  return (
    <StepContainer>
      <StepHeader
        stepNumber={1}
        title="Basic Information"
        description="Let's start with your personal details"
        icon={<FaUser />}
      />

      <PhotoUpload
        photoPreview={photoPreview}
        photoFile={photoFile}
        onPhotoChange={onPhotoChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormField
          id="fullName"
          label="Full Name"
          icon={<FaUser />}
          required
          onBlur={onBlur}
          value={formData.fullName || ""}
          onChange={(value) => onInputChange("fullName", value)}
          placeholder="Enter your full name"
          errors={errors}
        />

        <FormField
          id="phoneNumber"
          label="Phone Number (Active)"
          icon={<FaPhone />}
          required
          type="tel"
          onBlur={onBlur}
          value={formData.phoneNumber || ""}
          onChange={(value) => onInputChange("phoneNumber", value)}
          validatePhone={true}
          placeholder="01XXXXXXXXX"
          errors={errors}
        />

        <FormField
          id="emailAddress"
          label="Email Address"
          icon={<FaEnvelope />}
          onBlur={onBlur}
          required
          type="email"
          value={formData.emailAddress || ""}
          onChange={(value) => onInputChange("emailAddress", value)}
          validateEmail={true}
          placeholder="Enter your email address"
          errors={errors}
        />

        <FormField
          id="facebookProfile"
          label="Facebook Profile"
          icon={<FaFacebook />}
          onBlur={onBlur}
          required
          type="url"
          value={formData.facebookProfile || ""}
          onChange={(value) => onInputChange("facebookProfile", value)}
          validateFacebook={true}
          placeholder="https://facebook.com/yourprofile"
          errors={errors}
        />

        <div className="lg:col-span-2">
          <FormField
            id="location"
            label="Current Location"
            icon={<FaMapMarkerAlt />}
          onBlur={onBlur}
            required
            value={formData.location || ""}
            onChange={(value) => onInputChange("location", value)}
            placeholder="e.g. 204, IBA hostel, Green Super Market, Farmgate"
            errors={errors}
          />
        </div>
      </div>

      <StepNavigation
        onNext={onNext}
        nextLabel="Continue to Academic Info"
        isFirstStep={true}
        validationErrors={validationErrors}
        completedFieldsCount={completedFieldsCount}
        totalFieldsCount={totalFieldsCount}
      />
    </StepContainer>
  );
}
