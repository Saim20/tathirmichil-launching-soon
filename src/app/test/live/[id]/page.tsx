"use client";

import { useContext, useEffect, useState } from "react";
import {
  sendTestAnswersToDatabase,
  LiveTest,
  getTestAnswersFromRTDB,
  getLiveTestById,
  fetchTestQuestions,
} from "@/lib/apis/tests";
import { ComprehensiveQuestionWithTimer, QuestionWithTimer } from "@/lib/apis/questions";
import { AuthContext } from "@/lib/auth/auth-provider";
import { useParams, useRouter } from "next/navigation";
import TestUI from "@/components/TestUI";
import { getFontClassName } from "@/components/fonts";
import { returnFromTest, getServerTime } from "@/lib/helpers/test-helpers";

export default function LiveTestPage() {
  const testId = useParams().id as string;
  const [questions, setQuestions] = useState<QuestionWithTimer[]>([]);
  const [test, setTest] = useState<LiveTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(600); // Set exam duration in seconds
  const [font, setFont] = useState(getFontClassName("timesNewRoman"));
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext)!;
  const [isLocked, setIsLocked] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchTestAndQuestions() {
      setLoading(true);
      setError(null);

      try {
        const testResponse = await getLiveTestById(testId);

        if (!testResponse.success || !testResponse.data) {
          setError(testResponse.error || "Failed to load test");
          setLoading(false);
          return;
        }

        const test = testResponse.data;
        const resultResponse = await getTestAnswersFromRTDB(
          test.id!,
          user!.uid!,
          "live"
        );

        if (!resultResponse.success || !resultResponse.data) {
          setError(resultResponse.error || "Failed to load test answers");
          setLoading(false);
          return;
        }

        const result = resultResponse.data;

        // ! If the test is locked, do not show the test
        if (result.locked) {
          alert("You have already taken this test.");
          returnFromTest(test!.id!,false,router);
          return;
        }

        // * If the test is not locked, show the test
        // Fetch questions using the new utility function
        const questionsResponse = await fetchTestQuestions(test.orderedQuestions);
        
        if (!questionsResponse.success || !questionsResponse.data) {
          setError(questionsResponse.error || "Failed to load test questions");
          setLoading(false);
          return;
        }

        // Filter questions based on test's category and subCategory if specified
        const filteredQuestions = questionsResponse.data.filter((questionItem) => {
          if (questionItem.type === 'comprehensive') {
            const compData = (questionItem as ComprehensiveQuestionWithTimer).comprehensiveData;
            if (!compData) return true; // Include if no data to filter on
            
            // Check if comprehensive question matches test filters
            if (test.category && compData.category !== test.category) {
              return false;
            }
            if (test.subCategory && compData.subCategory !== test.subCategory) {
              return false;
            }
            return true;
          } else {
            const question = questionItem as QuestionWithTimer;
            
            // Check if regular question matches test filters
            if (test.category && question.category !== test.category) {
              return false;
            }
            if (test.subCategory && question.subCategory !== test.subCategory) {
              return false;
            }
            return true;
          }
        });

        // Flatten comprehensive questions into individual questions
        const flattenedQuestions: QuestionWithTimer[] = [];
        filteredQuestions.forEach((questionItem) => {
          if (questionItem.type === 'comprehensive') {
            // For comprehensive questions, flatten each sub-question
            const compData = (questionItem as ComprehensiveQuestionWithTimer).comprehensiveData;
            if (compData && compData.questions) {
              compData.questions.forEach((subQuestion: any, index: number) => {
                flattenedQuestions.push({
                  ...subQuestion,
                  id: `${questionItem.id}_${index}`,
                  time: 0,
                  timeSelected: null,
                  selected: null,
                  type: 'comprehensive',
                  parentId: questionItem.id // Track parent for submission
                });
              });
            }
          } else {
            flattenedQuestions.push(questionItem as QuestionWithTimer);
          }
        });

        const serverTime = await getServerTime();
        console.log("serverTime", serverTime);
        const remainingTime = Math.floor(
          (test.time * 1000 -
            (serverTime.getTime() - test.startsAt.getTime())) /
            1000
        );

        if (result.answers && result.startedAt) {
          flattenedQuestions.forEach((question) => {
            const answer = result.answers?.find(
              (ans: any) => ans.id === question.id
            );
            if (answer) {
              question.selected = answer.selected ?? null;
              question.timeSelected = answer.timeTaken;
            }
          });
        } else {
          sendTestAnswersToDatabase({
            testId: test.id!,
            questionsToSync: flattenedQuestions,
            previousQuestions: [],
            uid: user!.uid!,
            type: "live",
            tabSwitchCount: 0,
          });
        }
        setIsLocked(false);
        setRemainingTime(remainingTime);
        setTest(test);
        setQuestions(flattenedQuestions);
        setCurrentQuestionIndex(0);
      } catch (err) {
        console.error("Error fetching test and questions:", err);
        setError("An unexpected error occurred while loading the test");
      } finally {
        setLoading(false);
      }
    }

    fetchTestAndQuestions();
  }, []);

  useEffect(() => {
    if (questions.length === 0) return;

    const timer = setInterval(() => {
      setQuestions((prevQuestions) =>
        prevQuestions.map((question, index) =>
          index === currentQuestionIndex
            ? { ...question, time: question.time + 1 }
            : question
        )
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  useEffect(() => {
    const examTimer = setInterval(() => {
      if (remainingTime <= 0) {
        alert("Time is up!");
        sendTestAnswersToDatabase({
          testId: test!.id!,
          questionsToSync: questions,
          previousQuestions: [],
          uid: user!.uid!,
          type: "live",
          lockTest: true,
        });
        clearInterval(examTimer);
        returnFromTest(test!.id!,false,router);
      } else {
        setRemainingTime((prevTime) => prevTime - 1);
      }
    }, 1000);

    return () => clearInterval(examTimer);
  }, [remainingTime]);

  function handleNextQuestion() {
    if (currentQuestionIndex! < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex! + 1);
    }
  }

  function handlePreviousQuestion() {
    if (currentQuestionIndex! > 0) {
      setCurrentQuestionIndex(currentQuestionIndex! - 1);
    }
  }

  function handleJumpToQuestion(index: number) {
    setCurrentQuestionIndex(index);
  }

  function handleOptionSelect(optionIndex: number | null) {
    const updatedQuestions = questions.map((q, index) =>
      index === currentQuestionIndex
        ? {
            ...q,
            selected: optionIndex,
            timeSelected: q.time,
          }
        : q
    );
    sendTestAnswersToDatabase({
      testId: test!.id!,
      questionsToSync: updatedQuestions,
      previousQuestions: questions,
      uid: user!.uid!,
      type: "live",
      tabSwitchCount,
    });
    setQuestions(updatedQuestions);
  }

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    // Trigger useEffect by updating a dependency or calling fetchTestAndQuestions directly
    window.location.reload(); // Simple retry by reloading
  };

  if (loading || isLocked) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-tathir-dark-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-tathir-dark-green font-medium">Loading test...</p>
          <p className="text-sm text-tathir-brown mt-2">Please wait while we prepare your test</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Test</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={retryFetch}
            className="px-6 py-2 bg-tathir-dark-green text-white rounded-lg hover:bg-tathir-dark-green transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-tathir-cream to-tathir-beige">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Questions Available</h3>
          <p className="text-gray-600">This test doesn't have any questions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <TestUI
      handleSubmit={async () => {
        // Handle test submission logic here
        // For example, send the answers to the server
        await sendTestAnswersToDatabase({
          testId: test!.id!,
          questionsToSync: questions,
          previousQuestions: [],
          uid: user!.uid!,
          type: "live",
          lockTest: true,
          tabSwitchCount,
        });
        alert("Test submitted successfully!");
        returnFromTest(test!.id!,false,router);
      }} // Replace with the actual submit logic if needed
      questions={questions}
      currentQuestionIndex={currentQuestionIndex!}
      remainingTime={remainingTime}
      font={font}
      handleJumpToQuestion={handleJumpToQuestion}
      handleOptionSelect={handleOptionSelect}
      handlePreviousQuestion={handlePreviousQuestion}
      handleNextQuestion={handleNextQuestion}
      setFont={setFont}
      onTabSwitchCountChange={setTabSwitchCount}
    />
  );
}
