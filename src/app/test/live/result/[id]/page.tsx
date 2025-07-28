"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserLiveTestResult, getLiveTestById } from "@/lib/apis/tests";
import { getLiveTestLeaderboardWithStats, getUserPositionInLeaderboard, LiveTestLeaderboardEntry, QuestionStats } from "@/lib/apis/live-test-leaderboard";
import BaseResultPage from "@/components/shared/test-results/BaseResultPage";
import LiveTestLeaderboard from "@/components/student/LiveTestLeaderboard";
import { Trophy, Users } from "lucide-react";
import { LiveTestResult } from "@/lib/models/test-result";
import { processTestResult } from "@/lib/utils/result-utils";

export default function LiveResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState<LiveTestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LiveTestLeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<{ rank: number; percentile: number; totalParticipants: number } | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        setLoading(true);
        setError(null);

        const resultResponse = await getUserLiveTestResult(id as string);
        console.log("[LiveResultPage] Raw result response:", resultResponse);
        
        if (!resultResponse.success || !resultResponse.data) {
          setError(resultResponse.error || "Result not found");
          setLoading(false);
          return;
        }

        const data = resultResponse.data;
        console.log("[LiveResultPage] Raw result data:", data);

        // Get the test details to get all questions
        const testResponse = await getLiveTestById(data.testId);
        if (!testResponse.success || !testResponse.data) {
          setError(testResponse.error || "Test not found");
          setLoading(false);
          return;
        }

        const test = testResponse.data;

        // Process the test result to get questions with answers
        // Live tests don't need accuracy/confidence calculations, just fetch questions for display
        const processedData = await processTestResult(test.orderedQuestions, data.answers, {
          questionsOnly: true
        });
        
        setQuestions(processedData.questions);

        // Format the result data
        const formattedResult: LiveTestResult = {
          id: data.id,
          testId: data.testId,
          totalScore: data.totalScore,
          totalCorrect: data.totalCorrect || 0, // Use database value or 0
          timeTaken: data.timeTaken || 0,
          submittedAt: data.submittedAt,
          answers: data.answers,
          categoryScores: data.categoryScores || {},
          displayName: data.displayName || "Unknown User",
          email: data.email || "unknown@email.com",
          rank: data.rank || null,
          percentile: data.percentile || null
        };

        console.log("[LiveResultPage] Formatted result:", formattedResult);

        setResult(formattedResult);

        // Fetch leaderboard data and question statistics in one call
        try {
          const leaderboardResponse = await getLiveTestLeaderboardWithStats(id as string);
          if (leaderboardResponse.success && leaderboardResponse.data) {
            setLeaderboardData(leaderboardResponse.data.entries);
            setQuestionStats(leaderboardResponse.data.questionStats);
            console.log("[LiveResultPage] Leaderboard data:", leaderboardResponse.data.entries);
            console.log("[LiveResultPage] Question stats:", leaderboardResponse.data.questionStats);
            
            // Get user position if we have user ID from the result
            if (data.userId) {
              try {
                const positionResponse = await getUserPositionInLeaderboard(id as string, data.userId);
                if (positionResponse.success && positionResponse.data) {
                  setUserPosition(positionResponse.data);
                  console.log("[LiveResultPage] User position:", positionResponse.data);
                }
              } catch (positionError) {
                console.warn("[LiveResultPage] Failed to fetch user position:", positionError);
              }
            }
          }
        } catch (statsError) {
          console.warn("[LiveResultPage] Failed to fetch leaderboard data:", statsError);
          // Don't fail the entire page if leaderboard data can't be fetched
        }
      } catch (error) {
        console.error("Error fetching result:", error);
        setError("An unexpected error occurred while loading the result");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [id]);

  const additionalStats = [
    {
      icon: <Trophy className="text-yellow-400 text-2xl" />,
      value: result?.rank ? `#${result.rank}` : "-",
      label: "Rank"
    },
    {
      icon: <Users className="text-tathir-cream text-2xl" />,
      value: result?.percentile ? `${result.percentile}th` : "-",
      label: "Percentile"
    }
  ];

  return (
    <BaseResultPage
      result={result}
      loading={loading}
      error={error}
      questions={questions}
      questionStats={questionStats}
      backLink="/test/live"
      additionalStats={additionalStats}
      showLeaderboard={true}
      leaderboardComponent={<LiveTestLeaderboard testId={id as string} leaderboardData={leaderboardData} userPosition={userPosition} />}
    />
  );
} 