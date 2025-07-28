"use client";

import { useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingState } from '@/components/shared/TestPageStates';
import { AuthContext } from '@/lib/auth/auth-provider';

export default function TestPage() {
  const router = useRouter();
  const pathname = usePathname();
  const authContext = useContext(AuthContext);
  const isSubscribed = authContext?.userProfile?.isSubscribed;

    // Redirect to practice tests by default and replace /test in history
    useEffect(() => {
      if (pathname === '/test') {
        if (!isSubscribed) {
          // If not subscribed, redirect to practice tests
          router.replace('/test/assessment');
        } else {
          // If subscribed, redirect to the test list
          router.replace('/test/practice');
        }
      }
    }, [pathname, router]);

  // Show loading state while redirecting
  if (pathname === '/test') {
    return <LoadingState />;
  }

  return null; // Don't render anything as we're redirecting
}
