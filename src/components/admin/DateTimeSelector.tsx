"use client";

import React from 'react';
import { FormInput, FormSelect } from './FormComponents';

interface DateTimeSelectorProps {
  value: string; // ISO string format YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  minDate?: string;
  label?: string;
  labelAlt?: string;
  className?: string;
}

export const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  value,
  onChange,
  minDate,
  label,
  labelAlt,
  className = ""
}) => {
  const dateValue = value.split("T")[0] || "";
  const timeValue = value.split("T")[1] || "09:00";

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    onChange(`${newDate}T${timeValue}`);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTime = e.target.value;
    const currentDate = dateValue || new Date().toISOString().split("T")[0];
    onChange(`${currentDate}T${newTime}`);
  };

  // Generate time options (every 15 minutes)
  const timeOptions = Array.from({ length: 24 }, (_, hour) =>
    Array.from({ length: 4 }, (_, quarter) => {
      const h = hour.toString().padStart(2, "0");
      const m = (quarter * 15).toString().padStart(2, "0");
      const timeValue = `${h}:${m}`;
      const displayTime = new Date(
        `2000-01-01T${timeValue}`
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        value: timeValue,
        label: displayTime
      };
    })
  ).flat();

  return (
    <div className={`form-control ${className}`}>
      {(label || labelAlt) && (
        <div className="label">
          {label && <span className="label-text text-tathir-cream">{label}</span>}
          {labelAlt && <span className="label-text-alt text-tathir-light-green">{labelAlt}</span>}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <FormInput
          type="date"
          value={dateValue}
          onChange={handleDateChange}
          min={minDate}
          className="col-span-2"
        />
        <FormSelect
          value={timeValue}
          onChange={handleTimeChange}
        >
          {timeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormSelect>
      </div>
    </div>
  );
};
