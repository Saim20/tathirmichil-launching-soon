import { CheckCircle, Clock, Percent } from "lucide-react";
import { formatTime } from "./TestStats";
import { ResultCategoryScore } from "@/lib/models/test-result";

interface CategoryAnalysisProps {
  categoryScores: {
    [key: string]: {
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      time: number;
      attempted: number;
    };
  };
  style: {
    categoryCard: string;
    progressBar: string;
    progressFill: string;
  };
}

function getProgressBarColor(percentage: number) {
  if (percentage >= 75) return "bg-tathir-light-green";
  if (percentage >= 50) return "bg-tathir-cream";
  return "bg-tathir-maroon";
}

export default function CategoryAnalysis({ categoryScores, style }: CategoryAnalysisProps) {
  console.log(categoryScores);
  
  return (
    <div className="space-y-8">
      {Object.entries(categoryScores).map(([category, data]) => {
        const attemptedPercentage = data.totalQuestions > 0 ? (data.attempted / data.totalQuestions) * 100 : 0;
        const accuracyPercentage = data.totalQuestions > 0 ? (data.score / data.totalQuestions) * 100 : 0;
        
        return (
          <div key={category} className={style.categoryCard}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-minecraft text-tathir-maroon mb-2">{category}</h3>
                <div className="flex items-center gap-4 text-tathir-brown">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="text-tathir-light-green" />
                    Score: {data.score}/{data.totalQuestions}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="text-tathir-cream" />
                    Time: {formatTime(data.time)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-tathir-maroon">
                  {isNaN(accuracyPercentage) ? '0.0' : accuracyPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-tathir-brown">
                  {data.attempted}/{data.totalQuestions} attempted
                </div>
              </div>
            </div>

            <div className={style.progressBar}>
              <div
                className={`${style.progressFill} ${getProgressBarColor(accuracyPercentage)}`}
                style={{ width: `${accuracyPercentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
} 