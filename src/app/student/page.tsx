"use client";

import React, { useState, useEffect } from "react";
import { FaUser, FaChartLine, FaTrophy } from "react-icons/fa";
import {
  getDefaultUser,
  UserProfile,
  getTotalPracticeTests,
} from "@/lib/apis/users";
import { PageHeader } from "@/components/shared/ui/PageHeader";
import { LoadingSpinner } from "@/components/shared/ui/LoadingSpinner";
import { EmptyState } from "@/components/shared/ui/EmptyState";
import { StatsCard } from "@/components/shared/data/StatsCard";
import { Button } from "@/components/shared/ui/Button";
import { bloxat } from "@/components/fonts";
import {
  PerformanceStats,
  ProgressTracker,
  LeaderboardSection,
} from "@/components/student/dashboard";
import StudentGradeCard from "@/components/student/StudentGradeCard";

const OverviewPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPracticeTests, setTotalPracticeTests] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user data and total practice tests in parallel
        const [userResponse, totalTestsResponse] = await Promise.all([
          getDefaultUser(),
          getTotalPracticeTests(),
        ]);

        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        } else {
          setError(userResponse.error || "Failed to load user data");
          return;
        }

        if (
          totalTestsResponse.success &&
          totalTestsResponse.data !== undefined &&
          totalTestsResponse.data !== null
        ) {
          setTotalPracticeTests(totalTestsResponse.data);
        } else {
          console.warn(
            "Failed to load total practice tests:",
            totalTestsResponse.error
          );
          // Don't set error here, just use default value
        }
      } catch (err) {
        setError("An error occurred while loading your profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const completedTests = user?.practiceTestsTaken || 0;
  const totalTests = totalPracticeTests > 0 ? totalPracticeTests : 10;
  const xpPercent = totalTests > 0 ? (completedTests / totalTests) * 100 : 0;
  const accuracy = user?.accuracy !== undefined ? user.accuracy : 0;
  const confidence = user?.confidence !== undefined ? user.confidence : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[300px] md:min-h-[400px] flex items-center justify-center p-4">
        <LoadingSpinner
          variant="student"
          size="xl"
          text="Loading your dashboard..."
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-tathir-cream rounded-xl border-2 border-tathir-brown shadow-lg p-4 md:p-6 mx-2 md:mx-0">
        <EmptyState
          title="Something went wrong"
          description={error}
          variant="student"
          icon={<span className="text-4xl md:text-6xl">⚠️</span>}
          action={{
            label: "Try Again",
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-tathir-cream rounded-xl border-2 border-tathir-brown shadow-lg p-4 md:p-6 mx-2 md:mx-0">
        <EmptyState
          title="No user data found"
          description="Unable to load your profile information."
          variant="student"
          icon={<FaUser />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${user.displayName || "Student"}!`}
        description="Track your progress, review performance, and continue your IBA preparation journey."
        variant="student"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button
              variant="primary"
              icon={<FaChartLine />}
              className="w-full sm:w-auto"
            >
              View Progress
            </Button>
            <Button
              variant="secondary"
              icon={<FaTrophy />}
              className="w-full sm:w-auto"
            >
              Leaderboard
            </Button>
          </div>
          {/* Student Grade Card */}
          <div className="flex justify-center sm:justify-end">
            <StudentGradeCard user={user} />
          </div>
        </div>
      </PageHeader>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Tests Completed"
          value={completedTests}
          subtitle={`Out of ${totalTests} available`}
          icon={<FaChartLine />}
          variant="student"
          trend={
            completedTests > 0
              ? {
                  value: Math.round(xpPercent),
                  isPositive: true,
                  label: "completion",
                }
              : undefined
          }
        />
        <StatsCard
          title="Accuracy Rate"
          value={`${accuracy.toFixed(1)}%`}
          subtitle="Overall performance"
          icon={<FaTrophy />}
          variant="student"
          trend={
            accuracy > 75
              ? {
                  value: 15,
                  isPositive: true,
                  label: "vs avg",
                }
              : undefined
          }
        />
        <StatsCard
          title="Confidence Level"
          value={`${confidence.toFixed(1)}%`}
          subtitle="Self-assessment score"
          icon={<FaUser />}
          variant="student"
        />
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Progress Tracker - Compact card version */}
        <div className="lg:col-span-1 grid gap-4">
          <ProgressTracker
            completedTests={completedTests}
            totalTests={totalTests}
            xpPercent={xpPercent}
          />

          {/* Performance Stats */}
          <PerformanceStats
            accuracy={`${accuracy.toFixed(2)}%`}
            confidence={`${confidence.toFixed(2)}%`}
            timePerQuestion="0m 41s"
          />
        </div>

        {/* Right Column - Leaderboard and Performance Stats stacked */}
        <div className="lg:col-span-1 space-y-4">
          {/* Leaderboard */}
          <LeaderboardSection />
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
