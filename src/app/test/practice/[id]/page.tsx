"use client";

import { useEffect, useState } from "react";
import {
  getPracticeTestById,
  Test,
  fetchTestQuestions,
  convertFlattenedAnswersToComprehensive,
} from "@/lib/apis/tests";
import {
  ComprehensiveQuestionWithTimer,
  QuestionWithTimer,
} from "@/lib/apis/questions";
import { getFontClassName } from "@/components/fonts";
import TestUI from "@/components/TestUI";
import { auth } from "@/lib/firebase/firebase";
import { useParams, useRouter } from "next/navigation";
import { returnFromTest } from "@/lib/helpers/test-helpers";
import { processTestQuestions } from "@/lib/utils/test-question-utils";

export default function DiagnosticTestPage() {
  const testId = useParams().id as string;
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionWithTimer[]>([]);
  const [test, setTest] = useState<Test | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(600); // Set exam duration in seconds (e.g., 10 minutes = 600 seconds)
  const [font, setFont] = useState(getFontClassName("timesNewRoman"));

  useEffect(() => {
    async function fetchTestAndQuestions(testId: string) {
      setLoading(true);
      setError(null);

      // Check if the test ID is already stored in local storage
      const { restored } = restoreLocally(testId);
      if (restored) {
        // if should be submitted, submit the test
        setLoading(false);
        return;
      }

      const testResponse = await getPracticeTestById(testId);

      if (testResponse.success && testResponse.data) {
        const test = testResponse.data;

        try {
          // Fetch questions using the new utility function
          const questionsResponse = await fetchTestQuestions(
            test.orderedQuestions
          );

          if (!questionsResponse.success || !questionsResponse.data) {
            throw new Error(
              questionsResponse.error || "Failed to load test questions"
            );
          }

          // Process questions: filter by category/subcategory and flatten
          const flattenedQuestions = processTestQuestions(
            questionsResponse.data,
            test
          );

          setRemainingTime(test.time);
          setStartTime(new Date());
          setTest(test);
          setQuestions(flattenedQuestions);
          setCurrentQuestionIndex(0);
        } catch (questionError) {
          console.error("Error loading questions:", questionError);
          setError("Failed to load test questions");
        }
      } else {
        setError(testResponse.error || "Failed to load test");
      }

      setLoading(false);
    }

    fetchTestAndQuestions(testId);
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
        handleSubmit();
      } else {
        setRemainingTime((prevTime) => prevTime - 1);
      }
    }, 1000);

    return () => clearInterval(examTimer);
  }, [remainingTime]);

  function handleNextQuestion() {
    if (currentQuestionIndex! < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex! + 1);
      storeLocally(questions, currentQuestionIndex! + 1);
    }
  }

  function handlePreviousQuestion() {
    if (currentQuestionIndex! > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex! - 1);
      storeLocally(questions, currentQuestionIndex! - 1);
    }
  }

  function handleJumpToQuestion(index: number) {
    setCurrentQuestionIndex(index);
    storeLocally(questions, index);
  }

  function storeLocally(
    questionsToStore: QuestionWithTimer[],
    currentIndex: number,
    fontToStore: string = font
  ) {
    // Save the current state of the questions to local storage
    if (!test?.id) return;

    const testData = {
      currentQuestionIndex: currentIndex,
      questions: questionsToStore,
      startTime: startTime,
      font: fontToStore,
      test,
    };
    localStorage.setItem(test.id!, JSON.stringify(testData));
  }

  function restoreLocally(testIdToRestore: string): {
    restored: boolean;
    remainingTime: number;
  } {
    // Restore the state from local storage
    const storedData = localStorage.getItem(testIdToRestore);

    if (storedData) {
      const { currentQuestionIndex, questions, test, startTime, font } =
        JSON.parse(storedData);
      setTest(test);
      setCurrentQuestionIndex(currentQuestionIndex);
      setQuestions(questions);
      setStartTime(new Date(startTime));
      const currentTime = new Date();
      const timeElapsed = Math.floor(
        (currentTime.getTime() - new Date(startTime).getTime()) / 1000
      );
      const remainingTime =
        test.time - timeElapsed < 0 ? 0 : test.time - timeElapsed;
      setRemainingTime(remainingTime);
      setFont(font);
      console.log(font);

      return { restored: true, remainingTime };
    }
    return { restored: false, remainingTime: 0 };
  }

  function handleOptionSelect(optionIndex: number | null) {
    const questionsToStore = questions.map((q, index) =>
      index === currentQuestionIndex
        ? {
            ...q,
            selected: optionIndex,
            timeSelected: q.time,
          }
        : q
    );
    setQuestions(questionsToStore);
    storeLocally(questionsToStore, currentQuestionIndex!);
  }

  const handleSubmit = async () => {
    try {
      const comprehensiveAnswers =
        convertFlattenedAnswersToComprehensive(questions);
      console.log("Submitting answers:", comprehensiveAnswers);

      const response = await fetch("/student/api/submit-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
        },
        body: JSON.stringify({
          testId: test?.id,
          answers: comprehensiveAnswers,
          timeTaken: test!.time - remainingTime,
          tabSwitchCount,
        }),
      });

      if (response.ok) {
        alert("Test submitted successfully!");
        localStorage.removeItem(test?.id!);
        returnFromTest(test?.id!, true, router);
      } else {
        console.log("Error submitting test:", response.statusText);

        alert("Error submitting test. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Error submitting test. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-tathir-beige">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tathir-dark-green mx-auto mb-4"></div>
          <p className="text-tathir-brown">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-tathir-beige">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-tathir-maroon mb-2">
            Test Load Error
          </h2>
          <p className="text-tathir-brown mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-tathir-dark-green text-white rounded hover:bg-opacity-90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-tathir-beige">
        <div className="text-center">
          <p className="text-tathir-brown">
            No questions available for this test.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TestUI
      questions={questions}
      currentQuestionIndex={currentQuestionIndex!}
      remainingTime={remainingTime}
      font={font}
      handleJumpToQuestion={handleJumpToQuestion}
      handleOptionSelect={handleOptionSelect}
      handlePreviousQuestion={handlePreviousQuestion}
      handleNextQuestion={handleNextQuestion}
      setFont={setFont}
      handleSubmit={handleSubmit}
      onTabSwitchCountChange={setTabSwitchCount}
    />
  );
}
