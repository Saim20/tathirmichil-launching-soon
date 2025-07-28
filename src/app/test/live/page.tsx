"use client";

import { useLiveTests } from "@/hooks/useTests";
import TestCard from "@/components/TestCard";
import { LoadingState, EmptyState, LoadMoreButton, ErrorState } from "@/components/shared/TestPageStates";
import { bloxat } from "@/components/fonts";

export default function LiveTestsPage() {
  const { tests, loading, error, hasMore, refresh, loadMore } = useLiveTests();

  if (loading && tests.length === 0) {
    return <LoadingState />;
  }

  if (error && tests.length === 0) {
    return <ErrorState error={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-2xl md:text-3xl font-bold text-tathir-dark-green ${bloxat.className}`}>
          Live Tests
        </h1>
        <p className="mt-2 text-sm md:text-base text-tathir-brown">
          Join our scheduled live tests to challenge yourself in real-time and compete with other students.
        </p>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {tests.map((test) => (
          <TestCard key={test.id} test={test} type="live" />
        ))}

        {error && tests.length > 0 && (
          <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="text-sm">Error loading more tests: {error}</p>
            <button 
              onClick={refresh}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {hasMore && tests.length > 0 && !loading && (
          <div className="col-span-full">
            <LoadMoreButton onClick={loadMore} loading={loading} />
          </div>
        )}

        {!hasMore && tests.length === 0 && !error && (
          <div className="col-span-full">
            <EmptyState />
          </div>
        )}
      </div>
    </div>
  );
}
