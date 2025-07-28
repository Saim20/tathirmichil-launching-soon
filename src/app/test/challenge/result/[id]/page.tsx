"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getChallengeTestById } from "@/lib/apis/tests";
import BaseResultPage from "@/components/shared/test-results/BaseResultPage";
import { ChallengeTestResult } from "@/lib/models/test-result";
import { FaUser, FaTrophy, FaMedal } from "react-icons/fa";
import { auth } from "@/lib/firebase/firebase";
import Link from "next/link";
import ChallengeResultComparison from "@/components/shared/test-results/ChallengeResultComparison";
import { calculateChallengeStats } from "@/lib/helpers/challenge-helpers";
import { processTestResult } from "@/lib/utils/result-utils";

export default function ChallengeResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState<ChallengeTestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [creatorResult, setCreatorResult] = useState<any>(null);
  const [invitedResult, setInvitedResult] = useState<any>(null);
  const [showComparison, setShowComparison] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setError("You must be logged in to view results.");
        setLoading(false);
        return;
      }
      setUserId(user.uid);

      try {
        const challengeResponse = await getChallengeTestById(id as string);
        if (!challengeResponse.success || !challengeResponse.data) {
          setError(challengeResponse.error || "Challenge test not found");
          setLoading(false);
          return;
        }

        const challenge = challengeResponse.data;
        console.log("Fetched challenge:", challenge);
        
        // Get both users' results
        const creator = challenge.results[challenge.createdBy];
        const invited = challenge.results[challenge.invitedUser];
        
        if (!creator || !invited) {
          setError("Both users must complete the test to view comparison");
          setLoading(false);
          return;
        }

        // Get the user's result
        const userResult = challenge.results[user.uid];
        if (!userResult) {
          setError("No result found for this user");
          setLoading(false);
          return;
        }

        // Determine winner
        let winner = null;
        const creatorScore = creator.totalCorrect;
        const invitedScore = invited.totalCorrect;
        
        if (creatorScore > invitedScore) {
          winner = challenge.createdBy;
        } else if (invitedScore > creatorScore) {
          winner = challenge.invitedUser;
        }

        // Format result data for the current user
        const formattedResult: ChallengeTestResult = {
          ...userResult,
          id: id as string,
          testId: id as string,
          createdBy: challenge.createdBy,
          createdByName: challenge.createdByName,
          invitedUser: challenge.invitedUser,
          invitedName: challenge.invitedName,
          status: challenge.status
        };

        setResult(formattedResult);
        
        // Set creator and invited results for comparison component
        setCreatorResult({
          userId: challenge.createdBy,
          userName: challenge.createdByName,
          totalCorrect: creator.totalCorrect,
          totalScore: creator.totalScore,
          timeTaken: creator.timeTaken,
          categoryScores: creator.categoryScores,
          answers: creator.answers
        });
        
        setInvitedResult({
          userId: challenge.invitedUser,
          userName: challenge.invitedName,
          totalCorrect: invited.totalCorrect,
          totalScore: invited.totalScore,
          timeTaken: invited.timeTaken,
          categoryScores: invited.categoryScores,
          answers: invited.answers
        });

        // Fetch all questions from the test with answers
        // Challenge tests don't need accuracy/confidence calculations, just fetch questions for display
        const processedData = await processTestResult(challenge.orderedQuestions, userResult.answers, {
          questionsOnly: true
        });
        
        setQuestions(processedData.questions);
      } catch (error) {
        console.error("Error fetching result:", error);
        setError("An unexpected error occurred while loading the result");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id]);

  // Calculate challenge stats
  const stats = result ? calculateChallengeStats({
    createdBy: result.createdBy,
    invitedUser: result.invitedUser,
    results: {
      [result.createdBy]: creatorResult,
      [result.invitedUser]: invitedResult
    }
  }) : null;
  
  const isUserWinner = stats?.winner === userId;
  const isTie = stats?.isTie;
  
  const headerContent = result && (
    <>
      <div className="flex w-full flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-tathir-beige font-minecraft">Challenge Result</h1>
          <p className="mt-2 text-sm md:text-base text-tathir-cream-light">
            Completed on {(
              result.submittedAt && typeof (result.submittedAt as any).toDate === "function"
                ? (result.submittedAt as any).toDate()
                : result.submittedAt
            ).toLocaleDateString()} at{" "}
            {(
              result.submittedAt && typeof (result.submittedAt as any).toDate === "function"
                ? (result.submittedAt as any).toDate()
                : result.submittedAt
            ).toLocaleTimeString()}
          </p>
        </div>
        
        {stats?.hasAllResults && (
          <div className={`p-2 rounded-lg w-full md:w-auto ${
            isUserWinner 
              ? "bg-tathir-cream-light border-2 border-tathir-light-green"
              : isTie
                ? "bg-tathir-cream border-2 border-tathir-cream"
                : "bg-tathir-maroon border-2 border-tathir-maroon"
          }`}>
            {isUserWinner && (
              <div className="flex items-center justify-center md:justify-start gap-2">
                <FaTrophy className="text-tathir-dark-green text-2xl md:text-3xl animate-bounce" />
                <span className="text-tathir-dark-green text-base md:text-lg font-bold">You Won!</span>
              </div>
            )}
            {isTie && (
              <div className="flex items-center justify-center md:justify-start gap-2">
                <FaMedal className="text-tathir-dark-green text-2xl md:text-3xl" />
                <span className="text-tathir-dark-green text-base md:text-lg font-bold">Tie!</span>
              </div>
            )}
            {!isUserWinner && !isTie && (
              <div className="flex items-center justify-center md:justify-start gap-2">
                <FaMedal className="text-tathir-dark-green text-2xl md:text-3xl" />
                <span className="text-tathir-dark-green text-base md:text-lg font-bold">Challenge Lost</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex flex-col md:flex-row flex-wrap items-start md:items-center gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <FaUser className="text-tathir-light-green" />
          <span className="text-tathir-cream-light text-sm md:text-base">
            Creator: {result.createdByName}
          </span>
          {stats?.hasAllResults && (
            <span className="ml-1 text-tathir-light-green text-sm md:text-base">
              {stats.creatorStats?.score}/{stats.creatorStats?.total}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <FaUser className="text-tathir-cream" />
          <span className="text-tathir-cream-light text-sm md:text-base">
            Invited: {result.invitedName}
          </span>
          {stats?.hasAllResults && (
            <span className="ml-1 text-tathir-light-green text-sm md:text-base">
              {stats.invitedStats?.score}/{stats.invitedStats?.total}
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap space-x-0 space-y-2 md:space-y-0 md:space-x-4">
        <button 
          onClick={() => setShowComparison(false)}
          className={`w-full md:w-auto px-4 py-2 rounded-t-lg font-minecraft transition ${
            !showComparison 
              ? "bg-tathir-cream text-tathir-dark-green border-b-2 border-tathir-cream" 
              : "bg-tathir-dark-green/50 text-tathir-cream hover:bg-tathir-dark-green/80"
          }`}
        >
          My Results
        </button>
        <button 
          onClick={() => setShowComparison(true)}
          className={`w-full md:w-auto px-4 py-2 rounded-t-lg font-minecraft transition ${
            showComparison 
              ? "bg-tathir-cream text-tathir-dark-green border-b-2 border-tathir-cream" 
              : "bg-tathir-dark-green/50 text-tathir-cream hover:bg-tathir-dark-green/80"
          }`}
        >
          Compare Results
        </button>
      </div>
    </>
  );

  const footerContent = (
    <div className="flex w-full justify-between">
      <Link
        href="/test/challenge"
        className="w-full md:w-auto px-4 py-2 bg-tathir-dark-green text-tathir-cream rounded-lg hover:bg-tathir-maroon transition text-center"
      >
        Back to Challenges
      </Link>
    </div>
  );

  // Make sure the styles are made available for the comparison view
  interface ResultStyles {
    questionBox: string;
    correctAnswer: string;
    wrongAnswer: string;
    notAttempted: string;
    normalOption: string;
    explanation: string;
    progressBar: string;
    progressFill: string;
  }

  const resultStyles: ResultStyles = {
    questionBox: "bg-tathir-cream rounded-lg shadow-lg p-4 md:p-6",
    correctAnswer: "bg-tathir-light-green border-2 border-tathir-light-green text-tathir-dark-green rounded-md p-2 md:p-3",
    wrongAnswer: "bg-tathir-maroon border-2 border-tathir-maroon text-tathir-dark-green rounded-md p-2 md:p-3",
    notAttempted: "bg-tathir-cream border-2 border-tathir-cream text-tathir-dark-green rounded-md p-2 md:p-3",
    normalOption: "bg-tathir-beige border-2 border-tathir-beige text-tathir-dark-green rounded-md p-2 md:p-3",
    explanation: "bg-tathir-cream rounded-md text-tathir-dark-green p-3 md:p-4 text-sm md:text-base",
    progressBar: "h-2 bg-tathir-dark-green rounded-full overflow-hidden",
    progressFill: "h-full rounded-full"
  };

  if (showComparison && creatorResult && invitedResult) {
    const enhancedStyles: ResultStyles = {
      ...resultStyles,
      questionBox: resultStyles.questionBox + " min-w-0 w-full break-words", // min-w-0 prevents overflow
      correctAnswer: resultStyles.correctAnswer + " break-words",
      wrongAnswer: resultStyles.wrongAnswer + " break-words",
      notAttempted: resultStyles.notAttempted + " break-words",
      normalOption: resultStyles.normalOption + " break-words",
      explanation: resultStyles.explanation + " break-words"
    };

    return (
      <div className="min-h-screen pb-4 w-full overflow-x-hidden">
        <div className="bg-tathir-maroon rounded-xl shadow-xl text-tathir-cream p-4 md:p-6 mb-4 md:mb-6 w-full">
          {headerContent}
        </div>
        
        <div className="bg-tathir-maroon rounded-xl shadow-xl p-4 md:p-6 w-full overflow-x-auto">
          <div className="w-full">
            <ChallengeResultComparison
              creatorResult={creatorResult}
              invitedResult={invitedResult}
              questions={questions}
              style={enhancedStyles}
            />
          </div>
          
          <div className="mt-6 md:mt-8 border-t border-tathir-brown pt-4 md:pt-6">
            {footerContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <BaseResultPage
        result={result}
        loading={loading}
        error={error}
        questions={questions}
        backLink="/test/challenge"
        headerContent={headerContent}
        footerContent={footerContent}
      />
    </div>
  );
}
