"use client";
import React from "react";
import { FaUpload, FaImage, FaSpinner, FaTimes } from "react-icons/fa";
import Image from "next/image";

interface ImageUploadProps {
  imageUrl?: string;
  imagePreview?: string;
  isUploading?: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
  required?: boolean;
  maxSizeMB?: number;
  accept?: string;
  description?: string;
  className?: string;
}

export default function ImageUpload({
  imageUrl,
  imagePreview,
  isUploading = false,
  onImageChange,
  error,
  label = "Image",
  required = false,
  maxSizeMB = 5,
  accept = "image/*",
  description = "PNG, JPG or WEBP",
  className = ""
}: ImageUploadProps) {
  const displayImage = imageUrl || imagePreview;

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-semibold text-tathir-dark-green">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label 
            htmlFor="image-upload" 
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              error 
                ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                : 'border-tathir-brown/30 bg-tathir-beige/50 hover:bg-tathir-beige/70'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
              {isUploading ? (
                <>
                  <FaSpinner className="animate-spin text-4xl text-tathir-dark-green mb-4" />
                  <p className="text-sm text-tathir-dark-green font-medium">Uploading image...</p>
                  <p className="text-xs text-tathir-brown/60">Please wait</p>
                </>
              ) : displayImage ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <div className="relative w-48 h-32 mb-4">
                    <Image
                      src={displayImage}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg border-2 border-tathir-light-green"
                    />
                  </div>
                  <p className="text-sm text-tathir-dark-green font-medium">Image uploaded successfully!</p>
                  <p className="text-xs text-tathir-brown/60 mt-1">Click to change image</p>
                </div>
              ) : (
                <>
                  <FaUpload className="text-3xl text-tathir-brown/60 mb-4" />
                  <p className="mb-2 text-sm text-tathir-brown font-medium">
                    <span>Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-tathir-brown/60">{description} (MAX. {maxSizeMB}MB)</p>
                </>
              )}
            </div>
            <input 
              id="image-upload" 
              type="file" 
              accept={accept}
              onChange={onImageChange}
              className="hidden" 
              disabled={isUploading}
            />
          </label>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <FaTimes className="text-xs" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
