"use client";
import React from "react";
import { bloxat } from "@/components/fonts";

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function StepHeader({
  stepNumber,
  title,
  description,
  icon
}: StepHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-tathir-light-green rounded-full mb-4 animate-pulse-soft">
        <div className="text-2xl text-white">{icon}</div>
      </div>
      <h3 className={`text-3xl font-bold text-white mb-2 ${bloxat.className}`}>
        {title}
      </h3>
      <p className="text-white/70 text-lg">{description}</p>
    </div>
  );
}
