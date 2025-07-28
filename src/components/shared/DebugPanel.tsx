"use client";

import { useContext } from "react";
import { AuthContext } from "@/lib/auth/auth-provider";
import { usePathname } from "next/navigation";

const DebugPanel = () => {
  const { user, loading, profileChecking, userProfile, profileInitialized } = useContext(AuthContext)!;
  const pathname = usePathname();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 bg-black text-white text-xs p-2 z-50 max-w-xs overflow-auto max-h-96">
      <div className="font-bold mb-2">🐛 Debug Panel</div>
      <div>
        <div><strong>Path:</strong> {pathname}</div>
        <div><strong>User:</strong> {user ? user.uid.slice(0, 8) + "..." : "null"}</div>
        <div><strong>Loading:</strong> {loading ? "✅" : "❌"}</div>
        <div><strong>Profile Checking:</strong> {profileChecking ? "✅" : "❌"}</div>
        <div><strong>Profile Initialized:</strong> {profileInitialized ? "✅" : "❌"}</div>
        <div><strong>Profile:</strong> {userProfile ? userProfile.role : "null"}</div>
        <div><strong>Passed:</strong> {userProfile?.isPassed ? "✅" : "❌"}</div>
        <div><strong>Subscribed:</strong> {userProfile?.isSubscribed ? "✅" : "❌"}</div>
      </div>
    </div>
  );
};

export default DebugPanel;
