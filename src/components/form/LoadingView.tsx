"use client";
import React from "react";
import { FaSpinner } from "react-icons/fa";

export default function LoadingView() {
  return (
    <div className="min-h-screen bg-tathir-dark-green flex items-center justify-center">
      <div className="text-center">
        <FaSpinner className="text-4xl text-tathir-cream animate-spin mx-auto mb-4" />
        <p className="text-tathir-cream">Loading...</p>
      </div>
    </div>
  );
}
