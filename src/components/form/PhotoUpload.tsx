"use client";
import React from "react";
import { FaCamera } from "react-icons/fa";
import { labelClassName, fieldContainerClassName } from "./utils";

interface PhotoUploadProps {
  photoPreview?: string;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidationChange?: (fieldId: string, isValid: boolean, error?: string) => void;
  error?: string;
  required?: boolean;
}

export default function PhotoUpload({
  photoPreview,
  onPhotoChange,
  onValidationChange,
  error,
  required = true
}: PhotoUploadProps) {
  // Validate photo upload
  React.useEffect(() => {
    if (required) {
      const isValid = !!photoPreview;
      onValidationChange?.('profilePicture', isValid, isValid ? undefined : 'Profile picture is required');
    } else {
      onValidationChange?.('profilePicture', true);
    }
  }, [photoPreview, required, onValidationChange]);
  return (
    <div className={`${fieldContainerClassName} mb-8`}>
      <label className={labelClassName}>
        <FaCamera className="text-tathir-light-green" />
        Profile Picture <span className="text-tathir-error">*</span>
      </label>
      <div className="flex flex-col items-center">
        <div className="relative group">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Profile preview"
              className="w-32 h-32 object-cover rounded-full border-4 border-tathir-light-green shadow-lg group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-32 h-32 bg-tathir-cream rounded-full border-4 border-tathir-brown flex items-center justify-center group-hover:scale-110 group-hover:border-tathir-light-green transition-all duration-300">
              <FaCamera className="text-4xl text-tathir-maroon group-hover:text-tathir-light-green transition-colors duration-300" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <p className="text-white/60 text-sm mt-2 text-center">
          Click to upload a profile picture
        </p>
        {error && (
          <p className="text-tathir-error text-sm mt-2 flex items-center gap-1 animate-pulse-soft justify-center">
            <span>⚠️</span>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
