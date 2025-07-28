"use client";

import { useEffect, useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserAssessmentTestResult, getAssessmentTestById } from "@/lib/apis/tests";
import { AuthContext } from "@/lib/auth/auth-provider";
import BaseResultPage from "@/components/shared/test-results/BaseResultPage";
import { AssessmentTestResult } from "@/lib/models/test-result";
import { FaClipboardList } from "react-icons/fa";
import { processTestResult } from "@/lib/utils/result-utils";

export default function AssessmentResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const [result, setResult] = useState<AssessmentTestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const auth = useContext(AuthContext);

  useEffect(() => {
    async function fetchResult() {
      try {
        setLoading(true);
        setError(null);

        const resultResponse = await getUserAssessmentTestResult(id as string);
        console.log("Assessment result data:", resultResponse.data);
        
        if (!resultResponse.success || !resultResponse.data) {
          setError(resultResponse.error || "Result not found");
          setLoading(false);
          return;
        }

        const data = resultResponse.data;
        
        // Get the test details to get all questions
        const testResponse = await getAssessmentTestById(data.testId);
        if (!testResponse.success || !testResponse.data) {
          setError(testResponse.error || "Test not found");
          setLoading(false);
          return;
        }

        const test = testResponse.data;

        // Process the test result to get questions with answers
        // Skip calculations if database already has accuracy/confidence
        const hasAccuracyData = data.accuracy !== undefined && data.confidence !== undefined;
        console.log("Has accuracy data from DB:", hasAccuracyData, "accuracy:", data.accuracy, "confidence:", data.confidence);
        
        const processedData = await processTestResult(test.orderedQuestions, data.answers, {
          questionsOnly: hasAccuracyData // Only fetch questions, don't calculate anything
        });
        
        console.log("Processed data:", { 
          accuracy: processedData.accuracy, 
          confidence: processedData.confidence,
          totalQuestions: processedData.totalQuestions,
          totalCorrect: processedData.totalCorrect
        });
        
        setQuestions(processedData.questions);

        // Format the result data - prefer database values over calculated ones
        const finalAccuracy = data.accuracy !== undefined ? data.accuracy : processedData.accuracy;
        const finalConfidence = data.confidence !== undefined ? data.confidence : processedData.confidence;
        
        console.log("Final values:", { accuracy: finalAccuracy, confidence: finalConfidence });
        
        const formattedResult: AssessmentTestResult = {
          id: data.id,
          testId: data.testId,
          totalScore: data.totalScore,
          totalCorrect: data.totalCorrect || processedData.totalCorrect,
          timeTaken: data.timeTaken || 0,
          submittedAt: data.submittedAt,
          answers: data.answers,
          categoryScores: data.categoryScores || {},
          displayName: data.displayName || auth?.user?.displayName || "Unknown User",
          email: data.email || auth?.user?.email || "unknown@email.com",
          accuracy: finalAccuracy,
          confidence: finalConfidence
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
  }, [id, auth?.user]);

  const handleApplyToJoin = () => {
    router.push('/form');
  };

  const headerContent = (
    <div className="text-center">
      <p className="text-tathir-cream mb-4 text-lg">
        Ready to take your preparation to the next level?
      </p>
      <button
        onClick={handleApplyToJoin}
        className="bg-tathir-light-green text-tathir-dark-green px-6 py-3 rounded-xl font-bold text-lg hover:bg-tathir-cream transition-colors duration-300 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <FaClipboardList className="text-xl" />
        Apply to Join Personal Batch
      </button>
      <p className="text-tathir-cream-light text-sm mt-3">
        Get personalized coaching and structured preparation plan
      </p>
    </div>
  );

  return (
    <BaseResultPage
      result={result}
      loading={loading}
      error={error}
      questions={questions}
      backLink="/test/assessment"
      showConfidence
      showAccuracy
      headerContent={headerContent}
    />
  );
}
