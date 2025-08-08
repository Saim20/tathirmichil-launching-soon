"use client";
import React, { useContext } from "react";
import { useRouter } from "next/navigation";
import { PersonalBatchFormData } from "@/lib/models/form";
import { bloxat } from "@/components/fonts";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { AuthContext } from "@/lib/auth/auth-provider";

interface SuccessViewProps {
  existingFormData: PersonalBatchFormData | null;
  formData: Partial<PersonalBatchFormData>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function SuccessView({
  existingFormData,
  formData,
  setIsEditing,
  setSubmitted,
  setCurrentStep,
}: SuccessViewProps) {
  const router = useRouter();
  const { userProfile } = useContext(AuthContext)!;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="tathir-glass-dark rounded-2xl p-8 text-center max-w-lg w-full border border-white/20 shadow-2xl">
        <div className="relative">
          {/* Status Animation */}
          <div
            className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-pulse-soft ${
              userProfile?.approvalStatus === "accepted"
                ? "bg-tathir-light-green"
                : userProfile?.approvalStatus === "rejected"
                ? "bg-red-500/80"
                : "bg-yellow-500/80"
            }`}
          >
            {userProfile?.approvalStatus === "accepted" ? (
              <FaCheckCircle className="text-4xl text-white" />
            ) : userProfile?.approvalStatus === "rejected" ? (
              <FaTimesCircle className="text-4xl text-white" />
            ) : (
              <FaClock className="text-4xl text-white" />
            )}
          </div>

          {/* Floating particles effect */}
          <div
            className="absolute -top-4 -left-4 w-3 h-3 bg-tathir-light-green rounded-full animate-float"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="absolute -top-2 -right-6 w-2 h-2 bg-tathir-cream rounded-full animate-float"
            style={{ animationDelay: "0.3s" }}
          ></div>
          <div
            className="absolute -bottom-2 -left-6 w-2 h-2 bg-tathir-light-green rounded-full animate-float"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <h1
          className={`text-3xl font-bold text-white mb-4 ${bloxat.className}`}
        >
          {userProfile?.approvalStatus === "accepted"
            ? "Welcome to the Batch!"
            : userProfile?.approvalStatus === "rejected"
            ? "Application Status"
            : `Application ${
          existingFormData &&
          existingFormData.submittedAt !== formData.submittedAt
            ? "Updated"
            : "Submitted"
              }!`}
        </h1>

        <p className="text-white opacity-90 mb-2 text-lg">
          {userProfile?.approvalStatus === "accepted"
            ? "Congratulations! You have been accepted"
            : userProfile?.approvalStatus === "rejected"
            ? "We appreciate your interest in our program"
            : `Your application has been ${
          existingFormData &&
          existingFormData.submittedAt !== formData.submittedAt
            ? "updated"
            : "submitted"
              } successfully!`}
        </p>

        <p className="text-white opacity-70 mb-6 text-sm">
          {userProfile?.approvalStatus === "accepted"
            ? ""
            : userProfile?.approvalStatus === "rejected"
            ? "Unfortunately, your application was not accepted."
            : "Visit this link on August 17th. You’ll get the results. Drop me a text based on your batch preference then. Or I might reach out to you beforehand."}
        </p>

        {/* Status badge */}
        <div
          className={`inline-flex items-center gap-2  px-4 py-2 rounded-full text-sm font-medium mb-6
          ${
            userProfile?.approvalStatus === "accepted"
              ? "bg-tathir-light-green/20 text-tathir-light-green"
              : ""
          }
          ${
            userProfile?.approvalStatus === "rejected"
              ? "bg-tathir-error/20 text-tathir-error"
              : ""
          }
          ${
            userProfile?.approvalStatus === "unsure"
              ? "bg-tathir-gold/20 text-tathir-gold"
              : ""
          }
        `}
        >
          <div
            className={`w-2 h-2 rounded-full animate-pulse
            ${
              userProfile?.approvalStatus === "accepted"
                ? "bg-tathir-light-green"
                : userProfile?.approvalStatus === "rejected"
                ? "bg-tathir-error"
                : "bg-tathir-gold"
            }`}
          ></div>
          Status:{" "}
          {userProfile?.approvalStatus === "accepted"
            ? "Accepted"
            : userProfile?.approvalStatus === "rejected"
            ? "Rejected"
            : "Pending"}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {userProfile?.approvalStatus === "accepted" || userProfile?.approvalStatus === "rejected" ? (
            <></>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setSubmitted(false);
                setCurrentStep(1);
              }}
              className="tathir-card-hover bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40"
            >
              Edit Application
            </button>
          )}
          <button
            onClick={() => router.push("/")}
            className="tathir-card-hover bg-tathir-light-green hover:bg-tathir-light-green/80 text-tathir-dark-green px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Back to Home
          </button>
        </div>

        {existingFormData && (
          <p className="text-white opacity-50 text-xs mt-4">
            {userProfile?.approvalStatus === "accepted" ? (
              <>
                Accepted on:{" "}
                {userProfile.updatedAt
                  ? new Date(userProfile.updatedAt).toLocaleDateString()
                  : "Recently"}
                <span className="block">
                  Originally submitted:{" "}
                  {new Date(existingFormData.submittedAt).toLocaleDateString()}
                </span>
              </>
            ) : (
              <>
                First submitted:{" "}
                {new Date(existingFormData.submittedAt).toLocaleDateString()}
                {formData.submittedAt &&
                  formData.submittedAt !== existingFormData.submittedAt && (
                    <span className="block">
                      Last updated: {new Date().toLocaleDateString()}
                    </span>
                  )}
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
