import { BaseTestResult } from "@/lib/models/test-result";
import { CheckCircle, Clock, Target, TrendingUp, AlertTriangle, Eye, Star } from "lucide-react";
import { calculateCorrectAnswers, calculateTotalQuestions, calculateTotalAttempted } from "@/lib/utils/test-result-utils";

interface TestStatsProps {
  result: BaseTestResult;
  style: {
    statBox: string;
  };
  showConfidence?: boolean;
  showAccuracy?: boolean;
  showTabSwitchCount?: boolean;
  additionalStats?: Array<{
    icon: React.ReactNode;
    value: string | number;
    label: string;
  }>;
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

export default function TestStats({ result, style, showConfidence, showAccuracy, showTabSwitchCount, additionalStats }: TestStatsProps) {
  // Calculate values using utility functions to handle negative marking correctly
  const totalCorrect = calculateCorrectAnswers(result);
  const totalQuestions = calculateTotalQuestions(result);
  const totalAttempted = calculateTotalAttempted(result);

  console.log(result);
  
  
  const defaultStats = [
    {
      icon: <Star className="text-yellow-400 text-2xl" />,
      value: result.totalScore.toFixed(2),
      label: "Total Score"
    },
    {
      icon: <CheckCircle className="text-green-200/60 text-2xl" />,
      value: `${totalCorrect} / ${totalAttempted > 0 ? totalAttempted : totalQuestions}`,
      label: "Correct Answers"
    },
    {
      icon: <Clock className="text-tathir-cream text-2xl" />,
      value: formatTime(result.timeTaken),
      label: "Time Taken"
    }
  ];

  if (showAccuracy) {
    const accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
    defaultStats.push({
      icon: <Target className="text-tathir-cream-light text-2xl" />,
      value: `${accuracy.toFixed(1)}%`,
      label: "Accuracy"
    });
  }

  if (showConfidence) {
    const confidence = totalQuestions > 0 ? (totalAttempted / totalQuestions) * 100 : 0;
    defaultStats.push({
      icon: <TrendingUp className="text-tathir-beige text-2xl" />,
      value: `${confidence.toFixed(1)}%`,
      label: "% Attempted"
    });
  }

  if (showTabSwitchCount && result.tabSwitchCount !== undefined) {
    const tabSwitchCount = result.tabSwitchCount;
    const getTabSwitchIcon = () => {
      if (tabSwitchCount === 0) return <Eye className="text-green-400 text-2xl" />;
      return <AlertTriangle className="text-red-400 text-2xl" />;
    };

    defaultStats.push({
      icon: getTabSwitchIcon(),
      value: tabSwitchCount.toString(),
      label: "Tab Switches"
    });
  }

  const allStats = [...defaultStats, ...(additionalStats || [])];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 p-6 border-b-2 border-tathir-brown">
      {allStats.map((stat, index) => (
        <div key={index} className={`${style.statBox} p-4 text-center`}>
          <div className="flex items-center justify-center mb-2">
            {stat.icon}
          </div>
          <div className="text-2xl font-bold text-tathir-beige">{stat.value}</div>
          <div className="text-sm text-tathir-cream-light">{stat.label}</div>
        </div>
      ))}
    </div>
  );
} 