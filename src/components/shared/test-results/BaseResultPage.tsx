import { useState } from "react";
import { BarChart3, List, Trophy } from "lucide-react";
import { arial } from "@/components/fonts";
import { BaseTestResult, ResultCategoryScore } from "@/lib/models/test-result";
import { QuestionStats } from "@/lib/apis/live-test-leaderboard";
import { ResultStyles } from "./styles";
import TestStats from "./TestStats";
import CategoryAnalysis from "./CategoryAnalysis";
import QuestionReview from "./QuestionReview";
import { LoadingState, ErrorState, NotFoundState } from "./ResultStates";
import { InfoCard } from "@/components/shared/data/InfoCard";
import { Button } from "@/components/shared/ui/Button";

interface BaseResultPageProps {
  result: BaseTestResult | null;
  loading: boolean;
  error: string | null;
  questions: any[];
  questionStats?: QuestionStats[];
  backLink: string;
  showConfidence?: boolean;
  showAccuracy?: boolean;
  additionalStats?: Array<{
    icon: React.ReactNode;
    value: string | number;
    label: string;
  }>;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  showLeaderboard?: boolean;
  leaderboardComponent?: React.ReactNode;
}

export default function BaseResultPage({
  result,
  loading,
  error,
  questions,
  questionStats,
  backLink,
  showConfidence,
  showAccuracy,
  additionalStats,
  headerContent,
  footerContent,
  showLeaderboard,
  leaderboardComponent
}: BaseResultPageProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'questions' | 'leaderboard'>('analysis');

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} backLink={backLink} />;
  }

  if (!result) {
    return <NotFoundState backLink={backLink} />;
  }

  return (
    <div className="min-h-screen pb-2 pt-2 px-0 md:px-6 w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full">
        <InfoCard
          title="Test Result"
          variant="admin"
          className="mb-4 md:mb-6"
          content={
            <>
              {/* Header */}
              <div className="px-4 md:px-6 py-6 md:py-8">
                {headerContent || (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold text-tathir-dark-green font-minecraft">Test Result</h1>
                    <p className="mt-2 text-sm md:text-base text-tathir-brown">
                      Completed on {((result.submittedAt as any).toDate ? (result.submittedAt as any).toDate() : result.submittedAt).toLocaleDateString()} at{" "}
                      {((result.submittedAt as any).toDate ? (result.submittedAt as any).toDate() : result.submittedAt).toLocaleTimeString()}
                    </p>
                    <p className="mt-1 text-sm md:text-base text-tathir-brown">
                      By {result.displayName} ({result.email})
                    </p>
                  </>
                )}
              </div>

              {/* Stats */}
              <TestStats
                result={result}
                style={ResultStyles}
                showConfidence={showConfidence}
                showAccuracy={showAccuracy}
                additionalStats={additionalStats}
              />

              {/* Tabs */}
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 border-b-2 border-tathir-brown px-4 md:px-6 pt-4">
                <Button
                  variant={activeTab === 'analysis' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('analysis')}
                  icon={<BarChart3 />}
                  className={`rounded-b-none ${activeTab === 'analysis' ? 'border-b-4 border-b-tathir-light-green' : ''}`}
                >
                  Performance Analysis
                </Button>
                <Button
                  variant={activeTab === 'questions' ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab('questions')}
                  icon={<List />}
                  className={`rounded-b-none ${activeTab === 'questions' ? 'border-b-4 border-b-tathir-light-green' : ''}`}
                >
                  Question Review
                </Button>
                {showLeaderboard && (
                  <Button
                    variant={activeTab === 'leaderboard' ? 'primary' : 'secondary'}
                    onClick={() => setActiveTab('leaderboard')}
                    icon={<Trophy />}
                    className={`rounded-b-none ${activeTab === 'leaderboard' ? 'border-b-4 border-b-tathir-light-green' : ''}`}
                  >
                    Leaderboard
                  </Button>
                )}
              </div>

              {/* Tab Content */}
              <div className="pt-4 overflow-x-auto tathir-scrollbar">
                {activeTab === 'analysis' ? (
                  <CategoryAnalysis categoryScores={result.categoryScores} style={ResultStyles} />
                ) : activeTab === 'questions' ? (
                  <QuestionReview questions={questions} questionStats={questionStats} style={ResultStyles} />
                ) : (
                  leaderboardComponent || <div>Leaderboard not available</div>
                )}
              </div>

              {/* Footer */}
              {footerContent && (
                <div className="mt-6 md:mt-8 border-t border-tathir-brown pt-4 md:pt-6 p-3 sm:p-4 md:p-6">
                  {footerContent}
                </div>
              )}
            </>
          }
        />
      </div>
    </div>
  );
}