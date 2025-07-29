"use client";

import { createContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { transformUser, UserProfile } from "@/lib/apis/users";
import { CoinUserData, initializeUserCoins } from "@/lib/apis/coin-rtdb";
import { useCoinBalance } from "@/hooks/useCoinBalance";

interface AuthInfo {
  user: User | null;
  userProfile: UserProfile | null;
  coinData: CoinUserData | null;
  coinBalance: number;
  loading: boolean;
  profileChecking: boolean;
  profileInitialized: boolean;
  signInUser: (email: string, password: string) => Promise<unknown>;
  createUser: (email: string, password: string) => Promise<unknown>;
  resetPassword: (email: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  googleSignIn: () => Promise<unknown>;
  logOut: () => Promise<void>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthInfo | null>(null);
const provider = new GoogleAuthProvider();

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileChecking, setProfileChecking] = useState(true);
  const [profileInitialized, setProfileInitialized] = useState(false);

  // Debug logging for state changes

  // Use the coin balance hook for real-time coin data
  const { 
    coinBalance, 
    coinData, 
    loading: coinLoading, 
    error: coinError 
  } = useCoinBalance(user?.uid, !!user);

  // Debug coin loading

  const createUser = (email: string, password: string) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };
  
  const signInUser = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential;
    } catch (error) {
      setLoading(false); // Only set loading false on error
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    let tokenRefreshInterval: NodeJS.Timeout | undefined;
    let currentUserId: string | null = null;

    const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const newUserId = currentUser?.uid || null;

      // Skip if it's the same user to prevent duplicate processing
      if (currentUserId === newUserId && currentUser) {

        return;
      }
      
      currentUserId = newUserId;

      // Update auth state
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const token = await currentUser.getIdToken();
        // Set cookie via server API
        await fetch("/api/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        // Set up token refresh interval to prevent expiration issues
        tokenRefreshInterval = setInterval(async () => {
          try {
            if (auth.currentUser) {
              const refreshedToken = await auth.currentUser.getIdToken(true);
              // Use fetch with no-cache to avoid network delays affecting UI
              fetch("/api/set-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: refreshedToken }),
              }).catch((error) => {
                console.error("Token refresh error:", error);
              });
            }
          } catch (error) {
            console.error("Token refresh error:", error);
            // Don't auto-logout on token refresh failures to prevent disruption
          }
        }, 45 * 60 * 1000); // Refresh every 45 minutes (before 1-hour expiry)

        // Student profile check - also check for complete-profile path
        if (typeof window !== "undefined") {

          // Cleanup existing profile listener if any
          if (unsubscribeProfile) {

            unsubscribeProfile();
          }
          
          setProfileChecking(true);

          // Try to load from localStorage first for faster initial load
          const cachedProfile = localStorage.getItem("studentProfile");
          if (cachedProfile && !profileInitialized) {
            try {
              const parsedProfile = JSON.parse(cachedProfile);

              setUserProfile(parsedProfile);
            } catch (error) {
              console.error("❌ Error parsing cached profile:", error);
            }
          }

          // Set up realtime listener for user profile (Firestore)
          unsubscribeProfile = onSnapshot(
            doc(db, "users", currentUser.uid),
            (snapshot) => {
              const data = snapshot.data();

              // Mark profile as initialized after first check
              if (!profileInitialized) {

                setProfileInitialized(true);
              }

              const profile: UserProfile | null = data
                ? transformUser(data, snapshot.id)
                : null;

              setUserProfile(profile);
              
              if (profile) {
                localStorage.setItem("studentProfile", JSON.stringify(profile));
                // Sync profile data to RTDB for coin operations
                syncProfileToRTDB(profile);
              } else if (profileInitialized) {
                // Only remove from localStorage if profile was actually initialized and is now null
                localStorage.removeItem("studentProfile");
              }

              setProfileChecking(false);
            },
            (error) => {
              console.error("❌ Profile fetch error:", error);
              setProfileChecking(false);
              if (!profileInitialized) {

                setProfileInitialized(true);
              }
            }
          );
        }
      } else {

        // Clear token refresh interval
        if (tokenRefreshInterval) {
          clearInterval(tokenRefreshInterval);
        }

        // Clear profile loading state
        setProfileChecking(false);
        
        // Remove the token cookie via server API
        await fetch("/api/logout", { method: "POST" });
        // Clear profile from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("studentProfile");
        }
        setUserProfile(null);
        setProfileInitialized(false);

      }
    });

    return () => {

      unSubscribe();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, []); // Empty dependency array to prevent re-running

  // Sync user profile data to RTDB when profile changes
  const syncProfileToRTDB = async (profile: UserProfile) => {
    if (!profile || !user) return;
    
    try {
      await initializeUserCoins(
        user.uid,
        profile.displayName || 'Anonymous Student',
        profile.profilePictureUrl,
        profile.batch
      );
    } catch (error) {

    }
  };
  
  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setProfileInitialized(false);
      // Clear everything from Local Storage
      localStorage.clear();

      // Remove the token cookie via server API
      await fetch("/api/logout", { method: "POST" });
      // Clear profile from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("studentProfile");
      }
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = () => {
    setLoading(true);
    return signInWithPopup(auth, provider);
  };

  const authinfo: AuthInfo = {
    user,
    userProfile,
    coinData,
    coinBalance,
    loading: loading, // Remove coinLoading dependency
    profileChecking,
    profileInitialized,
    signInUser,
    createUser,
    resetPassword,
    setUser,
    googleSignIn,
    logOut,
    setLoading,
  };

  return (
    <AuthContext.Provider value={authinfo}>
      {children}
    </AuthContext.Provider>
  );
}
