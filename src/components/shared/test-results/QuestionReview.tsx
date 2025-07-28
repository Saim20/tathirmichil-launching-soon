import { CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { QuestionStats } from "@/lib/apis/live-test-leaderboard";
import { formatTime } from "./TestStats";
import { useState, useEffect } from "react";
import { processContent } from "@/lib/utils/contentProcessor";

interface QuestionWithAnswer {
  id: string;
  title: string;
  options: string[];
  answer: string;
  userAnswer: number | null;
  timeTaken: number;
  isCorrect: boolean;
  explanation: string;
  category: string;
  subCategory: string;
  imageUrl?: string;
}

interface QuestionReviewProps {
  questions: QuestionWithAnswer[];
  questionStats?: QuestionStats[];
  style: {
    questionBox: string;
    correctAnswer: string;
    wrongAnswer: string;
    notAttempted: string;
    normalOption: string;
    explanation: string;
  };
}

export default function QuestionReview({ questions, questionStats, style }: QuestionReviewProps) {
  // Create a quick lookup for question stats
  const statsMap = questionStats?.reduce((acc, stat) => {
    acc[stat.questionId] = stat;
    return acc;
  }, {} as Record<string, QuestionStats>) || {};

  // State for processed content
  const [processedQuestions, setProcessedQuestions] = useState<{
    [key: string]: {
      title: string;
      options: string[];
      explanation: string;
    }
  }>({});
  
  const [isProcessing, setIsProcessing] = useState(true);

  // Process all question content on mount
  useEffect(() => {
    const processAllQuestions = async () => {
      setIsProcessing(true);
      const processed: typeof processedQuestions = {};
      
      try {
        for (const question of questions) {
          const [processedTitle, processedOptions, processedExplanation] = await Promise.all([
            processContent(question.title),
            Promise.all(question.options.map(opt => processContent(opt))),
            processContent(question.explanation)
          ]);
          
          processed[question.id] = {
            title: processedTitle,
            options: processedOptions,
            explanation: processedExplanation
          };
        }
        
        setProcessedQuestions(processed);
      } catch (error) {
        console.error("Error processing question content:", error);
        // Fallback to original content
        questions.forEach(question => {
          processed[question.id] = {
            title: question.title,
            options: question.options,
            explanation: question.explanation
          };
        });
        setProcessedQuestions(processed);
      } finally {
        setIsProcessing(false);
      }
    };

    processAllQuestions();
  }, [questions]);

  if (isProcessing) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {questions.map((_, index) => (
          <div key={index} className={`${style.questionBox} p-4 sm:p-6 lg:p-8 animate-pulse`}>
            <div className="h-6 bg-tathir-beige/20 rounded mb-4"></div>
            <div className="h-24 bg-tathir-beige/10 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-tathir-beige/10 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {questions.map((question, index) => {
        // Calculate correctness here to ensure accuracy regardless of how the data was processed
        const correctAnswerIndex = typeof question.answer === 'string'
          ? question.options.indexOf(question.answer)
          : (typeof question.answer === 'number' ? question.answer : -1);
        
        const isCorrect = question.userAnswer !== null && question.userAnswer === correctAnswerIndex;
        const questionStat = statsMap[question.id];
        const processedQuestion = processedQuestions[question.id];
        
        return (
          <div key={question.id} className={`${style.questionBox} p-4 sm:p-6 lg:p-8`}>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-minecraft text-tathir-maroon">Question {index + 1}</h3>
              <div className="flex items-center gap-4">
                {question.userAnswer !== null ? (
                  <>
                    <span className="flex items-center text-tathir-maroon">
                      <Clock className="text-tathir-cream mr-2" />
                      {formatTime(question.timeTaken)}
                    </span>
                    {isCorrect ? (
                      <CheckCircle className="text-tathir-light-green text-xl sm:text-2xl" />
                    ) : (
                      <XCircle className="text-tathir-maroon text-xl sm:text-2xl" />
                    )}
                  </>
                ) : (
                  <span className="text-tathir-cream font-minecraft">Not attempted</span>
                )}
              </div>
            </div>

            {/* Question Statistics */}
            {questionStat && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-tathir-brown/20 rounded-lg">
                <div className="flex items-center gap-2 text-tathir-cream">
                  <Users className="text-tathir-light-green" />
                  <span className="font-minecraft text-sm sm:text-base text-tathir-brown">
                    {questionStat.correctCount} out of {questionStat.totalAttempts} students got this right 
                    ({questionStat.correctPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}
            
            <div className="mb-4 sm:mb-6">
              {/* Question Title with HTML/Markdown support */}
              <div className="mb-4 font-minecraft text-xl sm:text-md lg:text-lg p-2 sm:p-3">
                <div 
                  dangerouslySetInnerHTML={{ __html: processedQuestion?.title || question.title }}
                  className="prose prose-invert max-w-none [&>*]:text-current [&_strong]:font-bold [&_em]:italic [&_code]:bg-tathir-maroon/20 [&_code]:text-current [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-tathir-maroon/20 [&_pre]:text-current [&_pre]:p-3 [&_pre]:rounded [&_blockquote]:border-l-4 [&_blockquote]:border-current [&_blockquote]:pl-4 [&_blockquote]:opacity-80 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
                />
              </div>
              
              {/* Question Image */}
              {question.imageUrl && (
                <div className="mb-4 flex justify-center">
                  <img 
                    src={question.imageUrl} 
                    alt="Question illustration"
                    className="max-w-full h-auto rounded-lg shadow-md border border-tathir-beige/20"
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                    onError={(e) => {
                      console.error("Failed to load question image:", question.imageUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Options with HTML/Markdown support */}
              <div className="space-y-2 sm:space-y-3">
                {(processedQuestion?.options || question.options).map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-3 sm:p-4 ${
                      question.userAnswer === null
                        ? optionIndex === correctAnswerIndex
                          ? style.notAttempted
                          : style.normalOption
                        : optionIndex === question.userAnswer && optionIndex === correctAnswerIndex
                          ? style.correctAnswer
                          : optionIndex === question.userAnswer
                          ? style.wrongAnswer
                          : optionIndex === correctAnswerIndex
                          ? style.correctAnswer
                          : style.normalOption
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="w-8 sm:w-10 font-minecraft flex-shrink-0">{String.fromCharCode(65 + optionIndex)}.</span>
                      <div className="flex-1">
                        <div 
                          dangerouslySetInnerHTML={{ __html: option }}
                          className="prose max-w-none [&>*]:text-current [&_strong]:font-bold [&_em]:italic [&_code]:bg-black/10 [&_code]:text-current [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-black/10 [&_pre]:text-current [&_pre]:p-2 [&_pre]:rounded [&_blockquote]:border-l-4 [&_blockquote]:border-current [&_blockquote]:pl-3 [&_blockquote]:opacity-80 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expandable explanation dropdown with HTML/Markdown support */}
            <details className={`mt-4 sm:mt-6 p-0 ${style.explanation}`}>
              <summary className="cursor-pointer font-minecraft mb-2 sm:mb-3 text-lg sm:text-xl px-4 py-3 rounded bg-tathir-brown/30 hover:bg-tathir-brown/40 transition">
              Explanation
              </summary>
              <div className="px-4 pb-4 pt-2">
                <div 
                  dangerouslySetInnerHTML={{ __html: processedQuestion?.explanation || question.explanation }}
                  className="prose prose-invert max-w-none [&>*]:text-tathir-cream [&_strong]:text-tathir-cream [&_em]:text-tathir-cream [&_code]:bg-tathir-maroon/20 [&_code]:text-tathir-cream [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-tathir-maroon/20 [&_pre]:text-tathir-cream [&_pre]:p-3 [&_pre]:rounded [&_blockquote]:border-l-4 [&_blockquote]:border-tathir-cream [&_blockquote]:pl-4 [&_blockquote]:text-tathir-cream/90 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
                />
              </div>
            </details>

            <div className="mt-4 sm:mt-6 text-sm sm:text-base text-tathir-cream">
              <span className="mr-4 font-minecraft">Category: {question.category}</span>
              <span className="font-minecraft">Subcategory: {question.subCategory}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
} 