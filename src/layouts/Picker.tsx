"use client";

import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useState, useRef, useCallback, useMemo } from "react";
import { AuthContext } from "../lib/auth/auth-provider";
import Dashboard from "./Dashboard";
import HomeLayout from "./HomeLayout";
import AdminLayout from "./AdminLayout";
import LoadingScreen from "../components/shared/LoadingScreen";
import {
  isStudentPath,
  isTestPagePath,
  isAdminPath,
  isTestListPath,
  isPrivatePath,
  isPremiumPath,
  isPassingRequiredPath,
  isLoginRoute,
} from "../lib/auth/path-utils";
import TestLayout from "./TestLayout";

// Memoized tips array (moved outside component to prevent recreating)
const STUDY_TIPS = [
  "Break the numbers into smaller chunks. 1230 is 1000 and 200 and 30.",
  "Every rushed mistake takes more time to fix later.",
  "You won't solve every question. You only need to solve the right ones.",
  "Sometimes you can trust your guts.",
  "If you're stuck on a question, move on.",
  "If you can't comprehend the question after first read, come back later.",
  "Reviewing mock solutions matters more than the test.",
  "If you don't review your mistakes properly, you'll repeat them again and again.",
  "Addition. Subtraction. Multiplication. Division. That's it.",
  "Develop your fundamental understanding. Then practice to get faster.",
  "In the exam hall, tackle the easy questions first.",
  "Time is relative. That's why chatgaiyas like it.",
  "The syllabus is small and repetitive. Catch the patterns.",
  "Don't over-plan your study routine. Sit down. Start what you like.",
  "More practice only helps if you fix what went wrong before.",
  "Being able to manage your nerves is half the success.",
  "The biggest determinants: Time Management and Nerve Management.",
  "It doesn't matter how many books you complete. Can you solve 10 of these questions under 10 minutes?",
  "The passing bar will probably be lower than your expectations.",
  "Your real enemy is not the difficult questions, it is fumbling the easy ones.",
  "If you're still waiting to feel ready, you'll never start.",
  "Never skip a mock.",
  "One post-mock analysis is worth more than sitting for a new one.",
  "You don't need everything to pass. Skip what you don't know.",
  "You will feel you haven't done enough. Everyone does.",
  "Skipping a tough question early makes all the difference.",
  "FOMO about 'advanced resources' is nothing but a waste.",
  "If you're tired, take a break.",
  "Give life a fresh start!",
  "Easy questions first. Don't forget.",
  "Vocab is not memory. It's exposure.",
  "Look at the same words 5 times till they stop looking new.",
  "In Data Sufficiency, don't solve the problem. Ask yourself: 'Do I have enough to solve it?'",
  "Time doesn't run out in the last 10 minutes. It runs out in the first 10. Rush.",
  "Keep track of your time taken per question. Average should be 1m15s.",
  "If you freeze, breathe. Panic wastes more points than a tough question ever could.",
  "Don't study to complete resources. Study to understand question patterns.",
  "Solve the easiest questions first. Hard questions don't give extra marks.",
  "If you feel overwhelmed by the syllabus, pick one small topic and master it.",
  "Time isn't short. You just waste it on questions you should skip.",
  "Don't assume anything about the exam standard beforehand. Be flexible enough to adapt.",
  "Feeling anxious? Good.",
  "Don't compare your mock scores with the highest marks. Compare with the passing bar.",
  "If a question takes too long, it's testing your judgment to skip it.",
  "Be ready to adapt when it surprises you.",
  "The more tests you sit for, the better your chances.",
] as const;

const getRandomTipIndex = () => Math.floor(Math.random() * STUDY_TIPS.length);

const Picker = ({ children }: { children: React.ReactNode }) => {
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, profileChecking, userProfile, profileInitialized } =
    useContext(AuthContext)!;
  // Route checks - memoized for performance
  const routeChecks = useMemo(() => ({
    isStudent: isStudentPath(pathname),
    isTest: isTestPagePath(pathname),
    isTestList: isTestListPath(pathname),
    isAdmin: isAdminPath(pathname),
    isPremium: isPremiumPath(pathname),
    isPassingRequired: isPassingRequiredPath(pathname),
    isLogin: isLoginRoute(pathname),
  }), [pathname]);

  const { isStudent, isTest, isTestList, isAdmin, isPremium, isPassingRequired, isLogin } = routeChecks;

  // Prevent state updates on unmounted component
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Set a random tip index only on the client after mount and cycle tips
  useEffect(() => {
    setTipIndex(getRandomTipIndex());
    
    // Only start cycling tips if not in a loading state
    const startCycling = () => {
      return setInterval(() => {
        setTipIndex((prev) => {
          const newIndex = (prev + 1) % STUDY_TIPS.length;
          return newIndex;
        });
      }, 3000);
    };

    // Delay starting the interval to avoid re-renders during initial load
    const startDelay = setTimeout(() => {
      const interval = startCycling();
      
      // Store interval in a way that can be cleaned up
      return () => {
        clearInterval(interval);
      };
    }, 5000); // Wait 5 seconds before starting tip cycling

    return () => {
      clearTimeout(startDelay);
    };
  }, []);

  // * Early redirect check - happens before any rendering to prevent page flash
  const shouldRedirect = useMemo(() => {
    
    // Only check redirects when auth data is ready AND stable
    if (profileChecking || !profileInitialized) {
      return null;
    }

    // If user is null and we're on a private path, let middleware handle redirect
    if (!user && (isStudent || isAdmin || isTest)) {
      return null; // Let middleware redirect to login
    }

    // Skip redirection if already on target routes to prevent loops
    if (pathname === "/complete-profile" || 
        pathname === "/batch" || 
        pathname.startsWith("/test/assessment") || 
        pathname.startsWith("/admin")) {
      return null;
    }

    // Only proceed with app-level redirects if user exists
    if (!user) {
      return null;
    }

    // Early return if no userProfile - avoid multiple checks
    if (!userProfile) {
      if (isStudent) {
        const redirectPath = `/complete-profile?redirect=${encodeURIComponent(pathname)}`;
        return {
          path: redirectPath,
          shouldReplace: true
        };
      }
      return null;
    }

    // Single pass through redirect logic with early returns
    const { role, isPassed, isSubscribed } = userProfile;

    // Admin check
    if (role !== "admin" && isAdmin) {
      return { path: `/student`, shouldReplace: true };
    }

    // Assessment test check (non-admin only)
    if (role !== "admin" && !isPassed && !isTestList) {
      return { path: `/test/assessment`, shouldReplace: true };
    }

    // Subscription check (non-admin premium routes only)
    if (role !== "admin" && !isSubscribed && isPremium) {
      const redirectPath = `/batch?redirect=${encodeURIComponent(pathname)}`;

      return { path: redirectPath, shouldReplace: false };
    }

    // Passing requirement check
    if (!isPassed && isPassingRequired) {

      return { path: `/test/assessment`, shouldReplace: true };
    }

    return null;
  }, [
    profileChecking,
    profileInitialized,
    user,
    pathname,
    userProfile,
    isStudent,
    isTestList,
    isAdmin,
    isTest,
    isPremium,
    isPassingRequired,
  ]);

  // Execute redirect immediately if needed
  useEffect(() => {
    if (shouldRedirect && shouldRedirect.path !== pathname && !isRedirecting) {
      setIsRedirecting(true);
      
      // Small delay to prevent race conditions with state updates
      const timeoutId = setTimeout(() => {
        try {
          if (shouldRedirect.shouldReplace) {
            router.replace(shouldRedirect.path);
          } else {
            router.push(shouldRedirect.path);
          }
        } catch (error) {
          console.error("❌ Navigation error:", error);
          setIsRedirecting(false);
        }
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [shouldRedirect, pathname, router, isRedirecting]);

  // Reset redirecting state when pathname changes (redirect completed)
  useEffect(() => {

    if (isRedirecting && pathname !== undefined) {

      setIsRedirecting(false);
    }
  }, [pathname, isRedirecting]);

  // Determine if we should show loading screen
  const shouldShowLoading = useMemo(() => {
    // Don't show loading if we're just cycling tips after everything is loaded
    const needsAuth = user && !profileInitialized && (isStudent || isAdmin || isTest);
    const result = (
      loading ||
      profileChecking ||
      isRedirecting ||
      !profileInitialized ||
      needsAuth
    );
    return result;
  }, [loading, profileChecking, isRedirecting, user, profileInitialized, isStudent, isAdmin, isTest]);
  if (shouldShowLoading) {
    // Don't show loading screen for login routes when user is null
    if (!user && isLogin) {

      return (
        <div className="transition-opacity duration-200 ease-in-out">
          <HomeLayout>{children}</HomeLayout>
        </div>
      );
    }

    return <LoadingScreen tipText={STUDY_TIPS[tipIndex]} isRedirecting={isRedirecting || !!shouldRedirect} />;
  }

  // Show redirecting screen if redirect is needed (prevents page flash)
  if (shouldRedirect) {

    return <LoadingScreen tipText="" isRedirecting={true} />;
  }

  // Render TestLayout for diagnostic and practice tests
  if (isTest && user) {

    return (
      <div className="transition-opacity duration-200 ease-in-out">
        <TestLayout>{children}</TestLayout>
      </div>
    );
  }

  // Render Dashboard for regular student dashboard
  if ((isStudent || isTestList) && user) {

    return (
      <div className="transition-opacity duration-200 ease-in-out">
        <Dashboard>{children}</Dashboard>
      </div>
    );
  }

  // Render AdminLayout for admin dashboard
  if (isAdmin && user && !loading) {

    return (
      <div className="transition-opacity duration-200 ease-in-out">
        <AdminLayout>{children}</AdminLayout>
      </div>
    );
  }

  // For non-dashboard routes, use HomeLayout
  return (
    <div className="transition-opacity duration-200 ease-in-out">
      <HomeLayout>{children}</HomeLayout>
    </div>
  );
};

export default Picker;
