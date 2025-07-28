"use client";
import React from "react";

interface StepContainerProps {
  children: React.ReactNode;
}

export default function StepContainer({ children }: StepContainerProps) {
  return (
    <div className="tathir-glass rounded-2xl p-8 border border-white/20 shadow-2xl">
      {children}
    </div>
  );
}
