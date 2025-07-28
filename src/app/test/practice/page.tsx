"use client";

import { useState } from "react";
import { usePracticeTests } from "@/hooks/useTests";
import TestCard from "@/components/TestCard";
import { LoadingState, EmptyState, ErrorState } from "@/components/shared/TestPageStates";
import { bloxat } from "@/components/fonts";

export default function PracticeTestsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { tests, categories, loading, error, refresh } = usePracticeTests(selectedCategory);

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
          Practice Tests
        </h1>
        <p className="mt-2 text-sm md:text-base text-tathir-brown">
          Enhance your skills with our practice tests. Take these at your own pace and get instant feedback on your performance.
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="bg-tathir-cream border border-tathir-cream rounded-xl p-4 md:p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-tathir-dark-green mb-3">Filter by Category</h3>
          <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            !selectedCategory
          ? "bg-tathir-dark-green text-white shadow-md"
          : "bg-tathir-beige text-tathir-brown hover:bg-tathir-cream border border-tathir-cream hover:shadow-sm"
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          selectedCategory === category
            ? "bg-tathir-dark-green text-white shadow-md"
            : "bg-tathir-beige text-tathir-brown hover:bg-tathir-cream border border-tathir-cream hover:shadow-sm"
            }`}
          >
            {category}
          </button>
        ))}
          </div>
        </div>
      )}

      {/* Test Count */}
      {tests.length > 0 && (
        <div className="text-sm text-tathir-brown">
          {selectedCategory ? `${tests.length} tests in "${selectedCategory}"` : `${tests.length} total tests`}
        </div>
      )}

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {tests.map((test) => (
          <TestCard key={test.id} test={test} type="practice" />
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

        {tests.length === 0 && !loading && !error && (
          <div className="col-span-full">
            <EmptyState />
          </div>
        )}
      </div>
    </div>
  );
}
