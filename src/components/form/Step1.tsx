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
  onPhotoChange
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
        onPhotoChange={onPhotoChange}
        error={errors.profilePicture}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormField
          id="fullName"
          label="Full Name"
          icon={<FaUser />}
          required
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
          value={formData.phoneNumber || ""}
          onChange={(value) => onInputChange("phoneNumber", value)}
          placeholder="01XXXXXXXXX"
          errors={errors}
        />

        <FormField
          id="emailAddress"
          label="Email Address"
          icon={<FaEnvelope />}
          required
          type="email"
          value={formData.emailAddress || ""}
          onChange={(value) => onInputChange("emailAddress", value)}
          placeholder="Enter your email address"
          errors={errors}
        />

        <FormField
          id="facebookProfile"
          label="Facebook Profile"
          icon={<FaFacebook />}
          required
          type="url"
          value={formData.facebookProfile || ""}
          onChange={(value) => onInputChange("facebookProfile", value)}
          placeholder="https://facebook.com/yourprofile"
          errors={errors}
        />

        <div className="lg:col-span-2">
          <FormField
            id="location"
            label="Current Location"
            icon={<FaMapMarkerAlt />}
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
      />
    </StepContainer>
  );
}
