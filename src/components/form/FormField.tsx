"use client";
import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { FormValidationErrors } from "@/lib/models/form";
import {
  inputClassName,
  inputErrorClassName,
  selectClassName,
  selectErrorClassName,
  textareaClassName,
  textareaErrorClassName,
  getFieldClassName,
  labelClassName,
  errorMessageClassName,
  fieldContainerClassName,
} from "./utils";

interface FormFieldProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  type?: "text" | "email" | "tel" | "url" | "select" | "textarea";
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (fieldId: string, isValid: boolean, error?: string) => void;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  errors: FormValidationErrors;
  tip?: string;
  showCharCount?: boolean;
  showCount?: boolean;
  maxLength?: number;
  minSentences?: number;
  validateEmail?: boolean;
  validatePhone?: boolean;
  validateFacebook?: boolean;
  minLength?: number;
}

export default function FormField({
  id,
  label,
  icon,
  required = false,
  type = "text",
  value,
  onChange,
  onValidationChange,
  placeholder,
  options = [],
  rows = 4,
  errors,
  tip,
  showCharCount = false,
  showCount = false,
  maxLength,
  minSentences,
  validateEmail = false,
  validatePhone = false,
  validateFacebook = false,
  minLength,
}: FormFieldProps) {
  // Internal validation function
  const validateField = React.useCallback((fieldValue: string): { isValid: boolean; error?: string } => {
    // Required field validation
    if (required && (!fieldValue || fieldValue.trim() === "")) {
      return { isValid: false, error: "This field is required" };
    }

    // Skip other validations if field is empty and not required
    if (!fieldValue || fieldValue.trim() === "") {
      return { isValid: true };
    }

    // Email validation
    if (validateEmail && (!fieldValue.includes("@") || !fieldValue.includes("."))) {
      return { isValid: false, error: "Please enter a valid email address" };
    }

    // Phone validation
    if (validatePhone && fieldValue.replace(/\D/g, "").length < 8) {
      return { isValid: false, error: "Please enter a valid phone number" };
    }

    // Facebook validation
    if (validateFacebook && !fieldValue.toLowerCase().includes("facebook")) {
      return { isValid: false, error: "Please enter a valid Facebook profile URL" };
    }

    // Minimum length validation
    if (minLength && fieldValue.trim().length < minLength) {
      return { isValid: false, error: `Minimum ${minLength} characters required` };
    }

    // Minimum sentences validation
    if (minSentences) {
      const sentenceCount = fieldValue.split(/[.!?]+/).filter(s => s.trim().length > 5).length;
      if (sentenceCount < minSentences) {
        return { isValid: false, error: `Please write at least ${minSentences} sentences` };
      }
    }

    return { isValid: true };
  }, [required, validateEmail, validatePhone, validateFacebook, minLength, minSentences]);

  // Validate on value change
  React.useEffect(() => {
    const { isValid, error } = validateField(value);
    onValidationChange?.(id, isValid, error);
  }, [value, validateField, id, onValidationChange]);

  // Handle input change
  const handleChange = (newValue: string) => {
    onChange(newValue);
  };
  const renderInput = () => {
    if (type === "select") {
      return (
        <select
          id={id}
          className={getFieldClassName(
            id,
            selectClassName,
            selectErrorClassName,
            errors
          )}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === "textarea") {
      // More accurate sentence counting - split by sentence-ending punctuation and filter meaningful sentences
      const sentenceCount = value
        ? value.split(/[.!?]+/).filter((s) => s.trim().length > 5).length
        : 0;

      return (
        <div className="relative">
          <textarea
            id={id}
            className={getFieldClassName(
              id,
              textareaClassName,
              textareaErrorClassName,
              errors
            )}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
          />
          {(showCharCount || showCount || minSentences) && (
            <div
              className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-sm ${
                minSentences && sentenceCount < minSentences
                  ? "bg-red-500/80 text-white"
                  : "bg-tathir-dark-green/80 text-white"
              }`}
            >
              {minSentences
                ? `${sentenceCount}/${minSentences} sentences`
                : maxLength
                ? `${value.length}/${maxLength}`
                : `${value.length} chars`}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        id={id}
        type={type}
        className={getFieldClassName(
          id,
          inputClassName,
          inputErrorClassName,
          errors
        )}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  };

  return (
    <div className={fieldContainerClassName}>
      <label className={labelClassName}>
        {icon && <span className="text-tathir-light-green">{icon}</span>}
        {label} {required && <span className="text-tathir-error">*</span>}
      </label>

      {renderInput()}

      {errors[id] && (
        <p className={errorMessageClassName}>
          <FaExclamationTriangle />
          {errors[id]}
        </p>
      )}

      {tip && <p className="text-white/60 text-sm mt-2">{tip}</p>}
    </div>
  );
}
