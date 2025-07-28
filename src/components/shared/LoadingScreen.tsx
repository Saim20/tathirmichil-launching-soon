"use client";

import { memo, useCallback } from "react";

interface LoadingScreenProps {
  tipText: string;
  isRedirecting?: boolean;
}

const LoadingScreen = memo(({ tipText, isRedirecting = false }: LoadingScreenProps) => {
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = "/fallback-loading.png";
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-tathir-beige px-4 text-center transition-opacity duration-200"
      aria-busy="true"
    >
      <img
        src="/loading.gif"
        alt="Loading..."
        className="w-64 object-contain"
        onError={handleImageError}
      />
      <div className={`text-lg font-extrabold text-tathir-maroon max-w-xl ${isRedirecting ? 'animate-pulse' : ''}`}>
        {isRedirecting ? "Redirecting..." : `Tip: ${tipText}`}
      </div>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";

export default LoadingScreen;
