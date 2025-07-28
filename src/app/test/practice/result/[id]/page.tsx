"use client";

import { useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserPracticeTestResult, getPracticeTestById } from "@/lib/apis/tests";
import BaseResultPage from "@/components/shared/test-results/BaseResultPage";
import { PracticeTestResult } from "@/lib/models/test-result";
import { processTestResult } from "@/lib/utils/result-utils";
import { AuthContext } from "@/lib/auth/auth-provider";

export default function PracticeResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState<PracticeTestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const authContext = useContext(AuthContext)

  useEffect(() => {
    async function fetchResult() {
      try {
        setLoading(true);
        setError(null);

        const resultResponse = await getUserPracticeTestResult(id as string);
        if (!resultResponse.success || !resultResponse.data) {
          setError(resultResponse.error || "Result not found");
          setLoading(false);
          return;
        }

        const data = resultResponse.data;

        // Get the test details to get all questions
        const testResponse = await getPracticeTestById(id as string);
        if (!testResponse.success || !testResponse.data) {
          setError(testResponse.error || "Test not found");
          setLoading(false);
          return;
        }

        const test = testResponse.data;

        // Process the test result to get questions with answers  
        // Practice tests don't need accuracy/confidence calculations, just fetch questions for display
        const processedData = await processTestResult(test.orderedQuestions, data.answers, {
          questionsOnly: true
        });
        
        setQuestions(processedData.questions);

        // Format the result data
        const formattedResult: PracticeTestResult = {
          id: data.id,
          testId: id as string,
          totalScore: data.totalScore,
          totalCorrect: data.totalCorrect || 0, // Use database value or 0
          timeTaken: data.timeTaken || 0,
          submittedAt: data.submittedAt,
          answers: data.answers,
          categoryScores: data.categoryScores || {},
          displayName: authContext?.userProfile?.displayName || "Practice User", // Default value since practice tests don't require user info
          email: authContext?.userProfile?.email || "practice@test.com" // Default value since practice tests don't require user info
        };

        setResult(formattedResult);
      } catch (error) {
        console.error("Error fetching result:", error);
        setError("An unexpected error occurred while loading the result");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [id]);

  return (
    <BaseResultPage
      result={result}
      loading={loading}
      error={error}
      questions={questions}
      backLink="/test/practice"
    />
  );
} 