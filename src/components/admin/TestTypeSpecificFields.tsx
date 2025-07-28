"use client";

import React from 'react';
import { FormField, FormInput } from './FormComponents';
import { DateTimeSelector } from './DateTimeSelector';

type TestType = "assessment" | "live" | "practice" | "challenge";

interface TestTypeSpecificFieldsProps {
  testType: TestType;
  startsAt: string;
  endsAt: string;
  onStartsAtChange: (value: string) => void;
  onEndsAtChange: (value: string) => void;
  invitedUserEmail?: string;
  onInvitedUserEmailChange?: (value: string) => void;
}

export const TestTypeSpecificFields: React.FC<TestTypeSpecificFieldsProps> = ({
  testType,
  startsAt,
  endsAt,
  onStartsAtChange,
  onEndsAtChange,
  invitedUserEmail = "",
  onInvitedUserEmailChange
}) => {
  const today = new Date().toISOString().split("T")[0];
  const startDate = startsAt.split("T")[0] || today;

  switch (testType) {
    case "live":
      return (
        <>
          <DateTimeSelector
            value={startsAt}
            onChange={onStartsAtChange}
            minDate={today}
            label="Start Date & Time"
            labelAlt="When the test becomes available"
          />
          <DateTimeSelector
            value={endsAt}
            onChange={onEndsAtChange}
            minDate={startDate}
            label="End Date & Time"
            labelAlt="When the test closes"
          />
        </>
      );
    case "challenge":
      return (
        <FormField
          label="Invite User (by email)"
          labelAlt="Send challenge to specific user"
        >
          <FormInput
            type="email"
            placeholder="user@example.com"
            value={invitedUserEmail}
            onChange={(e) => onInvitedUserEmailChange?.(e.target.value)}
          />
        </FormField>
      );
    default:
      return null;
  }
};
