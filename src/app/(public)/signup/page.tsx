"use client";

import { useRedirect } from "@/hooks/useRedirect";
import { AuthContext } from "@/lib/auth/auth-provider";
import Link from "next/link";
import React, { useContext, useState, Suspense } from "react";
import { FaRegEye, FaRegEyeSlash, FaSpinner } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";

const SignupPageContent: React.FC = () => {
  const { createUser, googleSignIn } = useContext(AuthContext)!;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { redirect } = useRedirect();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await createUser(email, password);
      redirect();
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password");
      } else if (error.code === "auth/operation-not-allowed") {
        setError("Email/password accounts are not enabled");
      } else {
        setError(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await googleSignIn();
      redirect();
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled");
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups and try again");
      } else {
        setError(error.message || "Failed to sign in with Google");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center uppercase min-h-screen bg-[url('/login-bg.jpg')] bg-cover bg-center w-full px-4 py-10">
      <div className="relative w-full max-w-md bg-tathir-dark-green shadow-lg drop-shadow-xl rounded-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-tathir-light-green px-6 py-4">
          <h2 className="text-3xl font-semibold text-tathir-maroon text-center tracking-wide">Create Account</h2>
          <p className="text-sm text-center text-white">Join us to start your journey</p>
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
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-tathir-maroon rounded-md focus:ring-2 focus:ring-tathir-beige focus:outline-none transition text-tathir-beige placeholder:text-tathir-beige/40"
              placeholder="Enter your email"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-tathir-beige mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-tathir-maroon rounded-md focus:ring-2 focus:ring-tathir-beige focus:outline-none transition text-tathir-beige placeholder:text-tathir-beige/40"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 top-7 text-tathir-beige/60 hover:text-tathir-beige transition"
            >
              {showPassword ? (
                <FaRegEye className="h-5 w-5 text-tathir-beige" />
              ) : (
                <FaRegEyeSlash className="h-5 w-5 text-tathir-beige" />
              )}
            </button>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-tathir-beige mb-1">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-tathir-maroon rounded-md focus:ring-2 focus:ring-tathir-beige focus:outline-none transition text-tathir-beige placeholder:text-tathir-beige/40"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 top-7 text-tathir-beige/60 hover:text-tathir-beige transition"
            >
              {showConfirmPassword ? (
                <FaRegEye className="h-5 w-5 text-tathir-beige" />
              ) : (
                <FaRegEyeSlash className="h-5 w-5 text-tathir-beige" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-tathir-light-green text-white uppercase hover:scale-105 cursor-pointer transition-all ease-in-out duration-300 rounded-md hover:bg-tathir-beige/90 font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="border-t border-tathir-light-green" />

        {/* Google Login */}
        <div className="px-6 py-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2 bg-tathir-gold text-gray-700 border border-tathir-gold uppercase hover:scale-105 cursor-pointer transition-all ease-in-out duration-300 rounded-md hover:bg-gray-50 font-medium tracking-wide flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle className="h-5 w-5" />
            {loading ? "Signing up..." : "Sign up with Google"}
          </button>
        </div>

        {/* Login Link */}
        <div className="px-6 pb-6">
          <p className="text-center text-tathir-beige text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-tathir-light-green hover:underline font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const SignupPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[url('/login-bg.jpg')] bg-cover bg-center">
        <div className="text-center">
          <FaSpinner className="h-8 w-8 text-tathir-light-green animate-spin mx-auto mb-4" />
          <p className="text-tathir-beige">Loading signup page...</p>
        </div>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
};

export default SignupPage;