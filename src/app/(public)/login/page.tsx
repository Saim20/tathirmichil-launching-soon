"use client";

import { useRedirect } from "@/hooks/useRedirect";
import { AuthContext } from "@/lib/auth/auth-provider";
import Link from "next/link";
import React, { useContext, useState, Suspense } from "react";
import { FaRegEye, FaRegEyeSlash, FaSpinner } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";

const LoginPageContent: React.FC = () => {
  const { signInUser, googleSignIn, user } = useContext(AuthContext)!;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {redirect} = useRedirect();

  // If user is already authenticated, redirect immediately
  React.useEffect(() => {
    if (user) {
      redirect();
    }
  }, [user, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInUser(email, password);
      redirect();
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address");
      } else if (error.code === "auth/user-disabled") {
        setError("This account has been disabled");
      } else {
        setError(error.message || "Failed to sign in");
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

  // const handleRedirect = () => {
  //   if (redirect) {
  //     router.push(redirect);
  //   } else {
  //     router.push("/student");
  //   }
  // };

  return (
<div className="flex items-center justify-center uppercase min-h-screen bg-[url('/login-bg.jpg')] bg-cover bg-center w-full px-4 py-10">
  <div className="relative w-full max-w-md bg-tathir-dark-green shadow-lg drop-shadow-xl rounded-xl overflow-hidden">
    {/* Header Section */}
    <div className="bg-tathir-light-green px-6 py-4">
      <h2 className="text-3xl font-semibold text-tathir-maroon text-center tracking-wide">Welcome Back</h2>
      <p className="text-sm text-center text-white">Login to access your dashboard</p>
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

      {/* Forgot Password Link */}
      <div className="text-right">
        <Link 
          href="/reset-password" 
          className="text-sm text-tathir-light-green hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-tathir-light-green text-white uppercase hover:scale-105 cursor-pointer transition-all ease-in-out duration-300 rounded-md hover:bg-tathir-beige/90 font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing In..." : "Login"}
      </button>
    </form>

    {/* Divider */}
    <div className="border-t border-tathir-light-green" />

    {/* Google Login */}
    <div className="px-6 py-4">
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full py-2 bg-white text-gray-700 border border-gray-300 uppercase hover:scale-105 cursor-pointer transition-all ease-in-out duration-300 rounded-md hover:bg-gray-50 font-medium tracking-wide flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FcGoogle className="h-5 w-5" />
        {loading ? "Signing in..." : "Sign in with Google"}
      </button>
    </div>

    {/* Signup Link */}
    <div className="px-6 pb-6">
      <p className="text-center text-tathir-beige text-sm">
        Don't have an account?{" "}
        <Link href="/signup" className="text-tathir-light-green hover:underline font-semibold">
          Sign up here
        </Link>
      </p>
    </div>
  </div>
</div>
  );
};

const LoginPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[url('/login-bg.jpg')] bg-cover bg-center">
        <div className="text-center">
          <FaSpinner className="h-8 w-8 text-tathir-light-green animate-spin mx-auto mb-4" />
          <p className="text-tathir-beige">Loading login page...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
};

export default LoginPage;