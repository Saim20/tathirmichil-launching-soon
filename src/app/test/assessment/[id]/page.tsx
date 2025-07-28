"use client";

import { useContext, useEffect, useState } from "react";
import {
  sendTestAnswersToDatabase,
  getTestAnswersFromRTDB,
  getAssessmentTestById,
  AssessmentTest,
  fetchTestQuestions,
  convertFlattenedAnswersToComprehensive,
} from "@/lib/apis/tests";
import { ComprehensiveQuestionWithTimer, QuestionWithTimer } from "@/lib/apis/questions";
import { AuthContext } from "@/lib/auth/auth-provider";
import { useParams, useRouter } from "next/navigation";
import TestUI from "@/components/TestUI";
import { getFontClassName } from "@/components/fonts";
import { getServerTime, returnFromTest } from "@/lib/helpers/test-helpers";

export default function AssessmentTestPage() {
  const testId = useParams().id as string;
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionWithTimer[]>([]);
  const [test, setTest] = useState<AssessmentTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(600);
  const [font, setFont] = useState(getFontClassName("timesNewRoman"));
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext)!;
  const [tabSwitchCount, setTabSwitchCount] = useState(0);;

  useEffect(() => {
    async function fetchTestAndQuestions() {
      setLoading(true);
      setError(null);

      const testResponse = await getAssessmentTestById(testId);

      if (testResponse.success && testResponse.data) {
        const test = testResponse.data;
        
        try {
          const resultResponse = await getTestAnswersFromRTDB(
            test.id!,
            user!.uid!,
            'assessment'
          );
          
          if (!resultResponse.success) {
            throw new Error(resultResponse.error || "Failed to get test answers");
          }
          
          const result = resultResponse.data!;
          
          // If the test is locked, redirect to results page
          if (result.locked) {
            router.push(`/test/assessment/result/${test.id}`);
            return;
          }
          
          // Fetch questions using the new utility function
          const questionsResponse = await fetchTestQuestions(test.orderedQuestions);
          
          if (!questionsResponse.success || !questionsResponse.data) {
            throw new Error(questionsResponse.error || "Failed to load test questions");
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
          let remainingTime = test.time;
          
          if (result.answers && result.startedAt) {
            // Restore previous answers
            flattenedQuestions.forEach((question) => {
              const answer = result.answers?.find((ans: any) => ans.id === question.id);
              if (answer) {
                question.selected = answer.selected ?? null;
                question.timeSelected = answer.timeTaken;
              }
            });
            remainingTime = Math.floor(
              (test.time * 1000 - (serverTime.getTime() - result.startedAt.getTime())) / 1000
            );
          } else {
            await sendTestAnswersToDatabase(
              {
                testId: test.id!,
                questionsToSync: flattenedQuestions,
                previousQuestions: [],
                uid: user!.uid!,
                type: "assessment",
                startingTime: serverTime,
                tabSwitchCount: 0,
              }
            );
          }
          setRemainingTime(remainingTime);
          setTest(test);
          setQuestions(flattenedQuestions);
          setCurrentQuestionIndex(0);
        } catch (questionError) {
          console.error("Error loading questions:", questionError);
          setError("Failed to load test questions");
        }
      } else {
        setError(testResponse.error || "Failed to load assessment test");
      }
      
      setLoading(false);
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
        handleSubmit();
        clearInterval(examTimer);
      } else {
        setRemainingTime((prevTime) => prevTime - 1);
      }
    }, 1000);

    return () => clearInterval(examTimer);
  }, [remainingTime]);

  async function handleSubmit() {
    try {

      // Lock the test and save final answers
      await sendTestAnswersToDatabase({
        testId: test!.id!,
        questionsToSync: questions,
        previousQuestions: [],
        uid: user!.uid!,
        type: "assessment",
        lockTest: true,
        tabSwitchCount,
      });

      // Evaluate the test
      const comprehensiveAnswers = convertFlattenedAnswersToComprehensive(questions);
      const response = await fetch("/student/api/evaluate-assessment-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await user!.getIdToken()}`,
        },
        body: JSON.stringify({
          testId: test!.id!,
          answers: comprehensiveAnswers,
          timeTaken: test!.time - remainingTime,
          tabSwitchCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate test');
      }

      returnFromTest(test!.id!, true, router);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert("There was an error submitting your test. Please try again.");
    }
  }

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
    sendTestAnswersToDatabase(
      {
        testId: test!.id!,
        questionsToSync: updatedQuestions,
        previousQuestions: questions,
        uid: user!.uid!,
        type: "assessment",
        tabSwitchCount,
      }
    );
    setQuestions(updatedQuestions);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-tathir-beige">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tathir-dark-green mx-auto mb-4"></div>
          <p className="text-tathir-brown">Loading assessment test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-tathir-beige">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-tathir-maroon mb-2">Assessment Test Error</h2>
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
          <p className="text-tathir-brown">No questions available for this test.</p>
        </div>
      </div>
    );
  }

  return (
    <TestUI
      className="mt-25 mb-10"
      handleSubmit={handleSubmit}
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
