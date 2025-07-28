"use client";

import { useEffect, useState, useContext, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/lib/auth/auth-provider";
import { db } from "@/lib/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { FaSpinner, FaUserCircle } from "react-icons/fa";
import { UserProfile } from "@/lib/apis/users";
import { useRedirect } from "@/hooks/useRedirect";
import { initializeUserCoins } from "@/lib/apis/coin-rtdb";

function CompleteProfilePageContent() {
  const { user, loading, userProfile, profileChecking } = useContext(AuthContext)!;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [profileCompleted, setProfileCompleted] = useState(false);
  const {redirect} = useRedirect();

  useEffect(() => {
    if (!loading && user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user, loading]);

  useEffect(() => {
    if (userProfile && !profileChecking) {
      // Only redirect if we have a role set
      if (userProfile.role) {
        setProfileCompleted(true);
        redirect();
      }
    }
  }, [userProfile, profileChecking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      // Save to Firestore (without coins field)
      await setDoc(doc(db, "users", user!.uid), {
        uid: user!.uid,
        displayName: name,
        email,
        updatedAt: new Date(),
        role: "student",
        // NOTE: coins removed from Firestore - now managed in RTDB
        confidence: 0,
        accuracy: 0,
        isPassed: false,
        totalTestsTaken: 0,
        practiceTestsTaken: 0,
        purchasedVideos: [],
        profilePictureUrl: ""
      } as UserProfile, { merge: true });

      // Initialize coins in RTDB with batch information
      const coinResult = await initializeUserCoins(
        user!.uid, 
        name, 
        undefined, // Batch will be set later when user joins a batch
        "" // No profile picture URL initially
      );
      
      if (!coinResult.success) {
        console.warn("Failed to initialize coins in RTDB:", coinResult.error);
        // Don't fail the entire operation if coin initialization fails
      }

      setSuccess(true);
      // Don't redirect here - let the listener handle it
    } catch (err) {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (profileCompleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-tathir-beige text-gray-500">
        <h1 className="text-2xl font-bold mb-6 text-center text-tathir-dark-green">You have already completed your profile</h1>
      </div>
    );
  }

  if(!loading && !user) {
    router.replace("/login");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-tathir-beige text-gray-500">
        <h1 className="text-2xl font-bold mb-6 text-center text-tathir-dark-green">You are not logged in</h1>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-tathir-beige text-gray-500">
        <FaSpinner className="animate-spin text-3xl mb-2" />
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-bl from-green-700 to-tathir-beige">
      <div className="flex-1 flex flex-col items-center justify-center py-10 px-2">
        {/* Logo/Icon */}
        <div className="mb-6 flex flex-col items-center">
          <FaUserCircle className="text-tathir-dark-green text-6xl mb-2 drop-shadow" />
          <span className="text-lg font-semibold text-tathir-dark-green tracking-wide">Tathir Michil</span>
        </div>
        <div className="w-full max-w-md bg-white/90 p-8 rounded-2xl shadow-xl border border-tathir-dark-green/10">
          <h1 className="text-2xl font-bold mb-6 text-center text-tathir-dark-green">Complete Your Profile</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium mb-1 text-tathir-dark-green">Name</label>
              <input
                type="text"
                className="w-full border border-tathir-dark-green/30 rounded-lg px-3 py-2 bg-tathir-beige/40 focus:outline-none focus:ring-2 focus:ring-tathir-dark-green/40 focus:border-tathir-dark-green transition placeholder:text-gray-400"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Enter your full name"
              />
              <span className="text-xs text-gray-500 mt-1 block">This name will be visible to other students.</span>
            </div>
            <div>
              <label className="block font-medium mb-1 text-tathir-dark-green">Email</label>
              <input
                type="email"
                className="w-full border border-tathir-dark-green/30 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 focus:outline-none cursor-not-allowed"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled
              />
            </div>
            {error && <div className="bg-red-100 border border-red-300 text-red-700 rounded px-3 py-2 text-sm font-medium animate-shake">{error}</div>}
            {success && <div className="bg-green-100 border border-green-300 text-green-700 rounded px-3 py-2 text-sm font-medium">Profile completed! Redirecting...</div>}
            <button
              type="submit"
              className="w-full bg-tathir-dark-green text-tathir-beige py-2.5 rounded-lg font-semibold hover:bg-green-800 focus:bg-green-900 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting && <FaSpinner className="animate-spin" />} Complete Profile
            </button>
          </form>
        </div>
      </div>
      <footer className="w-full text-center py-4 text-xs text-gray-400 bg-transparent select-none">
        &copy; {new Date().getFullYear()} Tathir Michil. All rights reserved.
      </footer>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-tathir-beige">
        <div className="text-center">
          <FaSpinner className="h-8 w-8 text-tathir-dark-green animate-spin mx-auto mb-4" />
          <p className="text-tathir-brown">Loading profile setup...</p>
        </div>
      </div>
    }>
      <CompleteProfilePageContent />
    </Suspense>
  );
}
