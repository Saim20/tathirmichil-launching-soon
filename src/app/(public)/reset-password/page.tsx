"use client";

import { AuthContext } from "@/lib/auth/auth-provider";
import Link from "next/link";
import React, { useContext, useState, Suspense } from "react";
import { FaSpinner } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";

const ResetPasswordPageContent: React.FC = () => {
  const { resetPassword } = useContext(AuthContext)!;
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error: any) {
      console.error("Password reset error:", error);
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address");
      } else {
        setError(error.message || "Failed to send password reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center uppercase min-h-screen bg-[url('/login-bg.jpg')] bg-cover bg-center w-full px-4 py-10">
        <div className="relative w-full max-w-md bg-tathir-dark-green shadow-lg drop-shadow-xl rounded-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-tathir-light-green px-6 py-4">
            <h2 className="text-3xl font-semibold text-tathir-maroon text-center tracking-wide">Email Sent</h2>
            <p className="text-sm text-center text-white">Check your inbox for reset instructions</p>
          </div>

          {/* Success Message */}
          <div className="px-6 py-8 text-center">
            <FaCheckCircle className="h-16 w-16 text-tathir-light-green mx-auto mb-4" />
            <p className="text-tathir-beige mb-4">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-tathir-beige/80 text-sm mb-6">
              Please check your email and follow the instructions to reset your password.
            </p>
            <Link
              href="/login"
              className="w-full py-2 bg-tathir-light-green text-white uppercase hover:scale-105 cursor-pointer transition-all ease-in-out duration-300 rounded-md hover:bg-tathir-beige/90 font-semibold tracking-wide inline-block"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center uppercase min-h-screen bg-[url('/login-bg.jpg')] bg-cover bg-center w-full px-4 py-10">
      <div className="relative w-full max-w-md bg-tathir-dark-green shadow-lg drop-shadow-xl rounded-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-tathir-light-green px-6 py-4">
          <h2 className="text-3xl font-semibold text-tathir-maroon text-center tracking-wide">Reset Password</h2>
          <p className="text-sm text-center text-white">Enter your email to receive reset instructions</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {error && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-tathir-beige mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-tathir-maroon rounded-md focus:ring-2 focus:ring-tathir-beige focus:outline-none transition text-tathir-beige placeholder:text-tathir-beige/40"
              placeholder="Enter your email address"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-tathir-light-green text-white uppercase hover:scale-105 cursor-pointer transition-all ease-in-out duration-300 rounded-md hover:bg-tathir-beige/90 font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        {/* Back to Login */}
        <div className="px-6 pb-6">
          <p className="text-center text-tathir-beige text-sm">
            Remember your password?{" "}
            <Link href="/login" className="text-tathir-light-green hover:underline font-semibold">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const ResetPasswordPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[url('/login-bg.jpg')] bg-cover bg-center">
        <div className="text-center">
          <FaSpinner className="h-8 w-8 text-tathir-light-green animate-spin mx-auto mb-4" />
          <p className="text-tathir-beige">Loading reset password page...</p>
        </div>
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
