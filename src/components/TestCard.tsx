import {
  Test,
  AssessmentTest,
  LiveTest,
  getUserPracticeTestResult,
  getUserLiveTestResult,
  getUserAssessmentTestResult,
  OrderedQuestion,
} from "@/lib/apis/tests";
import { humanReadableDate } from "@/lib/helpers/time";
import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaQuestionCircle,
  FaHourglassHalf,
  FaCalendarAlt,
  FaTrophy,
  FaExclamationTriangle,
  FaPlay,
} from "react-icons/fa";
import { bloxat } from "@/components/fonts";
import { InfoCard } from "@/components/shared/data/InfoCard";
import { Button } from "@/components/shared/ui/Button";

type BaseTest = Test & {
  orderedQuestions: OrderedQuestion[];
  time: number;
};

type TestType = "practice" | "assessment" | "live";

interface BaseTestCardProps {
  test: BaseTest;
  type: TestType;
}

const TestCard: React.FC<BaseTestCardProps> = ({ test, type }) => {
  // Helper to calculate total question count including comprehensive questions
  const getTotalQuestionCount = (orderedQuestions: OrderedQuestion[]): number => {
    // For UI purposes, we'll show the number of ordered questions
    // This represents the number of question "groups" rather than individual parts
    // Each comprehensive question is counted as one group, regardless of how many parts it contains
    return orderedQuestions.length;
  };

  // State for test status and results
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
  const [timeTaken, setTimeTaken] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Calculate timing information
  const startsAt = type === "live" ? (test as LiveTest).startsAt : null;
  const timeInSeconds = test.time;
  const endsAt =
    type === "live" && startsAt
      ? new Date(startsAt.getTime() + timeInSeconds * 1000)
      : null;

  const duration = `${Math.floor(timeInSeconds / 60)} minutes ${
    timeInSeconds % 60
  } seconds`;

  // Update running status for timed tests
  useEffect(() => {
    if (type !== "live" || !startsAt) return;

    const updateRunningStatus = () => {
      const now = new Date();
      setIsRunning(now >= startsAt && now <= (endsAt as Date));
    };

    updateRunningStatus();
    const interval = setInterval(updateRunningStatus, 1000);
    return () => clearInterval(interval);
  }, [type, startsAt, endsAt]);

  // Fetch test results
  useEffect(() => {
    async function fetchTestResult() {
      let resultResponse: any = null;

      try {
        switch (type) {
          case "practice":
            resultResponse = await getUserPracticeTestResult(test.id);
            break;
          case "assessment":
            resultResponse = await getUserAssessmentTestResult(test.id);
            break;
          case "live":
            resultResponse = await getUserLiveTestResult(test.id);
            break;
        }

        // Handle the API response format
        if (resultResponse && resultResponse.success && resultResponse.data) {
          const result = resultResponse.data;
          setSubmittedAt(
            result.submittedAt ? new Date(result.submittedAt) : null
          );
          setTimeTaken(result.timeTaken || null);
          setTotalScore(result.totalScore <= 0 ? 0 : result.totalScore);

          const categoryScores = result.categoryScores || {};
          const calculatedScore = Object.keys(categoryScores).reduce(
            (acc, key) => acc + categoryScores[key].score,
            0
          );
          setScore(calculatedScore);
          setTotalScore(result.totalScore < 0 ? 0 : result.totalScore);
        } else {
          // No test result found or API error - reset to defaults
          setSubmittedAt(null);
          setTimeTaken(null);
          setTotalScore(null);
          setScore(null);
        }
      } catch (error) {
        console.error("Error fetching test result:", error);
        // Reset to defaults on error
        setSubmittedAt(null);
        setTimeTaken(null);
        setTotalScore(null);
        setScore(null);
      }
    }

    fetchTestResult();
  }, [test.id, type]);

  const isAttempted = submittedAt !== null;
  const scorePercentage =
    totalScore && score !== null ? Math.round((score / totalScore) * 100) : 0;

  const handleClick = () => {
    if (isAttempted) {
      window.location.href += `/result/${test.id}`;
    } else if (type === "live" && !isRunning) {
      return;
    } else {
      window.location.href += `/${test.id}`;
    }
  };

  const renderTimingInfo = () => {
    if (type !== "live" || !startsAt) return null;

    // if (type === "assessment") {
    //   return (
    //     <div className="tathir-glass p-3 rounded-lg flex items-center gap-2 border-2 border-tathir-cream">
    //       <FaCalendarAlt className="text-tathir-cream" />
    //       <div>
    //         <p
    //           className={`text-sm ${
    //             isRunning
    //               ? "text-tathir-success font-bold"
    //               : "text-tathir-cream"
    //           }`}
    //         >
    //           <strong>{isRunning ? "Ongoing Test" : "Starts At"}:</strong>{" "}
    //           {humanReadableDate(startsAt)}
    //         </p>
    //         <p className="text-sm text-tathir-cream/80">
    //           <strong>Ends At:</strong> {humanReadableDate(endsAt as Date)}
    //         </p>
    //       </div>
    //     </div>
    //   );
    // }

    return (
      <div className="tathir-glass p-3 rounded-lg flex items-center gap-2 border-2 border-tathir-cream">
        <FaCalendarAlt className="text-tathir-cream" />
        <p
          className={`text-sm ${
            isRunning ? "text-tathir-success font-bold" : "text-tathir-cream"
          }`}
        >
          <strong>{isRunning ? "Ongoing Test" : "Starts At"}:</strong>{" "}
          {humanReadableDate(startsAt)}
        </p>
      </div>
    );
  };

  const statusBadge = isAttempted
    ? "Attempted"
    : "Not Attempted";

  const statusIcon = isAttempted
    ? <FaCheckCircle className="text-tathir-light-green" />
    : <FaHourglassHalf className="text-tathir-brown/60" />;

  const cardContent = (
    <div className="space-y-4">
      {/* Test Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-tathir-brown">
          <FaClock />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-tathir-brown">
          <FaQuestionCircle />
          <span>{getTotalQuestionCount(test.orderedQuestions)} questions</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {statusIcon}
        <span className={`text-sm font-medium ${
          isAttempted ? 'text-tathir-light-green' : 'text-tathir-brown/60'
        }`}>
          {statusBadge}
        </span>
      </div>

      {/* Results Section */}
      {isAttempted && submittedAt && (
        <div className="space-y-3 p-4 bg-tathir-beige/50 rounded-lg border border-tathir-brown/20">
          {timeTaken && (
            <div className="flex items-center gap-2 text-sm text-tathir-brown">
              <FaHourglassHalf />
              <span>
                Time taken: {`${Math.floor(timeTaken / 60)} minutes ${timeTaken % 60} seconds`}
              </span>
            </div>
          )}

          {totalScore !== null && score !== null && scorePercentage !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaTrophy className="text-tathir-dark-green" />
                  <span className="text-sm font-medium text-tathir-dark-green">Score</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-lg font-bold text-tathir-dark-green ${bloxat.className}`}>
                    {score}
                  </span>
                  <span className="text-sm text-tathir-brown/60">
                    / {totalScore} ({scorePercentage}%)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-2 overflow-hidden rounded-full bg-tathir-brown/20">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      scorePercentage >= 75
                        ? "bg-tathir-light-green"
                        : scorePercentage >= 50
                        ? "bg-tathir-maroon"
                        : "bg-tathir-brown"
                    }`}
                    style={{ width: `${scorePercentage <= 0 ? 0 : scorePercentage}%` }}
                  />
                </div>
                <div className="text-right text-xs font-medium text-tathir-brown">
                  {scorePercentage}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Test Timing */}
      {type !== "practice" && renderTimingInfo() && (
        <div className="p-3 bg-tathir-cream rounded-lg border border-tathir-brown/20">
          {renderTimingInfo()}
        </div>
      )}
    </div>
  );

  return (
    <InfoCard
      title={test.title}
      variant="student"
      className="group relative overflow-hidden"
      icon={statusIcon}
      content={cardContent}
      actions={{
        primary: {
          label: isAttempted ? "View Result" : "Take Test",
          onClick: handleClick,
          loading: false
        }
      }}
    />
  );
};

export default TestCard;
