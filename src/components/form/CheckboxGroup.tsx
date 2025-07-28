"use client";
import React from "react";
import { FaCheckSquare } from "react-icons/fa";
import { checkboxClassName, labelClassName, fieldContainerClassName } from "./utils";

interface CheckboxGroupProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (value: string, checked: boolean) => void;
  required?: boolean;
  tip?: string;
}

export default function CheckboxGroup({
  label,
  options,
  selectedValues,
  onChange,
  required = false,
  tip
}: CheckboxGroupProps) {
  return (
    <div className={fieldContainerClassName}>
      <label className={`${labelClassName} flex items-center gap-2`}>
        <FaCheckSquare className="text-tathir-light-green" />
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      
      {tip && (
        <p className="text-tathir-cream/70 text-sm mb-3 italic">💡 {tip}</p>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center space-x-3 text-tathir-cream cursor-pointer hover:text-tathir-light-green transition-all duration-200 p-2 rounded-lg hover:bg-tathir-cream/5"
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={(e) => onChange(option, e.target.checked)}
              className={checkboxClassName}
            />
            <span className="text-sm font-medium">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
