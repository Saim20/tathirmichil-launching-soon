"use client";
import React from "react";
import { PersonalBatchFormData } from "@/lib/models/form";
import { bloxat } from "@/components/fonts";

interface FormHeaderProps {
  existingFormData: PersonalBatchFormData | null;
}

export default function FormHeader({ existingFormData }: FormHeaderProps) {
  return (
    <div className="tathir-glass-dark rounded-2xl p-8 mb-8 text-center border border-white/20 shadow-2xl">
      <div className="mb-4">
        {existingFormData ? (
          <div className="inline-flex items-center gap-2 bg-tathir-info/20 text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-tathir-info rounded-full animate-pulse"></div>
            Editing Previous Application
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-tathir-success/20 text-green-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-tathir-success rounded-full animate-pulse"></div>
            New Application
          </div>
        )}
      </div>
      
      <h1 className={`text-3xl md:text-4xl font-bold text-white mb-4 ${bloxat.className}`}>
        Personal Batch
      </h1>
      <h2 className="text-xl text-tathir-light-green mb-4 font-semibold">
        Application Form
      </h2>
      <p className="text-white opacity-80">
        {existingFormData 
          ? "Update your application with any new information. Keep it casual and real! 😊"
          : "Welcome! Fill out these questions well for me to accept you into my batch. Keep the answers casual and real! 😊"
        }
      </p>
    </div>
  );
}
