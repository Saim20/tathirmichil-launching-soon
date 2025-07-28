"use client";

import { useEffect, useState } from "react";
import { ChallengeTest, getChallengeTestById, fetchTestQuestions, convertFlattenedAnswersToComprehensive } from "@/lib/apis/tests";
import { ComprehensiveQuestionWithTimer, QuestionWithTimer } from "@/lib/apis/questions";
import { getFontClassName } from "@/components/fonts";
import TestUI from "@/components/TestUI";
import { auth } from "@/lib/firebase/firebase";
import { useParams, useRouter } from "next/navigation";
import { returnFromTest } from "@/lib/helpers/test-helpers";

export default function ChallengeTestPage() {
  const testId = useParams().id as string;
  const [questions, setQuestions] = useState<QuestionWithTimer[]>([]);
  const [test, setTest] = useState<ChallengeTest | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(600); // Set exam duration in seconds (e.g., 10 minutes = 600 seconds)
  const [font, setFont] = useState(getFontClassName("timesNewRoman"));
  const router = useRouter();

  useEffect(() => {
    async function fetchTestAndQuestions(testId: string) {
      setLoading(true);
      try {
        // Check if the test ID is already stored in local storage
        const { restored } = restoreLocally(testId);
        if (restored) {
          // if should be submitted, submit the test
          setLoading(false);
          return;
        }
        
        const testResponse = await getChallengeTestById(testId);

        if (testResponse.success && testResponse.data) {
          const test = testResponse.data;
          
          // Fetch questions using the new utility function
          const questionsResponse = await fetchTestQuestions(test.orderedQuestions);
          
          if (!questionsResponse.success || !questionsResponse.data) {
            console.error('Failed to load test questions:', questionsResponse.error);
            setLoading(false);
            return;
          }


          // Convert the mixed question types to a flattened format for the UI
          const flattenedQuestions: QuestionWithTimer[] = [];
          
          questionsResponse.data.forEach((questionItem) => {
            
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
              // Regular questions can be used as-is
              flattenedQuestions.push(questionItem as QuestionWithTimer);
            }
          });

          const remainingTime = (test.time - (new Date().getTime() - new Date(test.startTime).getTime()) / 1000).toFixed(0);
          setRemainingTime(Number(remainingTime));
          setStartTime(test.startTime);
          setTest(test);
          setQuestions(flattenedQuestions);
          setCurrentQuestionIndex(0);
        } else {
          console.error('Failed to load challenge test:', testResponse.error);
          // Handle test loading failure - could redirect or show error
        }
      } catch (error) {
        console.error('Error fetching test and questions:', error);
      } finally {
        setLoading(false);
      }
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
      const remainingTime = (test.time - (new Date().getTime() - new Date(startTime).getTime()) / 1000).toFixed(0);
      setRemainingTime(Number(remainingTime));
      setFont(font);

      return { restored: true };
    }
    return { restored: false };
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
      const comprehensiveAnswers = convertFlattenedAnswersToComprehensive(questions);

      const response = await fetch("/student/api/submit-challenge-test", {
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
        returnFromTest(test?.id!, false, router);
      } else {
        alert("Error submitting test. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Error submitting test. Please try again.");
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        No questions available for this test.
      </div>
    );
  }

  // Calculate end time and check if exam is over
  const endTime = test ? new Date(new Date(test.startTime).getTime() + test.time * 1000) : null;
  const isOver = endTime ? new Date() > endTime : false;

  if (test && isOver) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-xl font-bold">
        Exam is over.
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

