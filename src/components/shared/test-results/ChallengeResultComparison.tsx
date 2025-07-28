import { CheckCircle, XCircle, Clock, Trophy, User } from "lucide-react";
import { formatTime } from "./TestStats";
import { ResultCategoryScore } from "@/lib/models/test-result";
import { bloxat } from "@/components/fonts";
import { InfoCard } from "@/components/shared/data/InfoCard";
import { Badge } from "@/components/shared/ui/Badge";
import { calculateCorrectAnswers, calculateTotalQuestions, calculateTotalAttempted } from "@/lib/utils/test-result-utils";
import { useState, useEffect } from "react";
import { processContent } from "@/lib/utils/contentProcessor";

interface UserResult {
  userId: string;
  userName: string;
  totalCorrect: number;
  totalScore: number;
  totalAttempted?: number;
  timeTaken: number;
  categoryScores: {
    [key: string]: ResultCategoryScore;
  };
  answers: {
    [questionId: string]: {
      selected: number | null;
      timeTaken: number;
    };
  };
}

interface ComparisonProps {
  creatorResult: UserResult;
  invitedResult: UserResult;
  questions: any[];
  style: {
    questionBox: string;
    correctAnswer: string;
    wrongAnswer: string;
    notAttempted: string;
    normalOption: string;
    progressBar: string;
    progressFill: string;
  };
}

function getProgressBarColor(percentage: number) {
  if (percentage >= 75) return "bg-tathir-light-green";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export default function ChallengeResultComparison({
  creatorResult,
  invitedResult,
  questions,
  style,
}: ComparisonProps) {
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
            Promise.all(question.options.map((opt: string) => processContent(opt))),
            processContent(question.explanation || '')
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
            explanation: question.explanation || ''
          };
        });
        setProcessedQuestions(processed);
      } finally {
        setIsProcessing(false);
      }
    };

    processAllQuestions();
  }, [questions]);

  // Calculate correct answers properly handling negative marking
  const creatorCorrect = calculateCorrectAnswers(creatorResult as any);
  const invitedCorrect = calculateCorrectAnswers(invitedResult as any);
  const creatorTotal = calculateTotalQuestions(creatorResult as any);
  const invitedTotal = calculateTotalQuestions(invitedResult as any);
  
  // Determine winner
  const tie = creatorCorrect === invitedCorrect;
  const winner = creatorCorrect > invitedCorrect ? creatorResult : invitedCorrect > creatorCorrect ? invitedResult : null;

  // Compare categories
  const allCategories = new Set([
    ...Object.keys(creatorResult.categoryScores),
    ...Object.keys(invitedResult.categoryScores),
  ]);

  if (isProcessing) {
    return (
      <div className="space-y-6">
        <InfoCard
          title="Loading Challenge Results"
          variant="admin"
          content={
            <div className="p-4 animate-pulse">
              <div className="h-32 bg-tathir-brown/20 rounded"></div>
            </div>
          }
        />
        {questions.map((_, index) => (
          <InfoCard
            key={index}
            title={`Question ${index + 1}`}
            variant="admin"
            content={
              <div className="p-4 animate-pulse">
                <div className="h-6 bg-tathir-brown/20 rounded mb-4"></div>
                <div className="h-16 bg-tathir-brown/10 rounded mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-32 bg-tathir-brown/10 rounded"></div>
                  <div className="h-32 bg-tathir-brown/10 rounded"></div>
                </div>
              </div>
            }
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full">
      {/* Summary comparison */}
      <div className="mb-4">
        <InfoCard
          title="Challenge Comparison"
          variant="admin"
          content={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Creator */}
              <div className="text-center">
                <InfoCard
                  title="Creator"
                  variant="student"
                  className="mb-2"
                  content={
                    <>
                      <h3 className={`${bloxat.className} text-lg md:text-xl font-bold text-tathir-dark-green mb-3 truncate`}>
                        {creatorResult.userName}
                      </h3>
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center justify-between text-tathir-brown text-sm md:text-base">
                          <span>Total Score:</span>
                          <span className="font-bold text-yellow-600">
                            {creatorResult.totalScore.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-tathir-brown text-sm md:text-base">
                          <span>Correct:</span>
                          <span className="font-bold text-tathir-light-green">
                            {creatorCorrect}/{creatorTotal}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-tathir-brown text-sm md:text-base">
                          <span>Time:</span>
                          <span>{formatTime(creatorResult.timeTaken)}</span>
                        </div>
                      </div>
                    </>
                  }
                />
                {winner?.userId === creatorResult.userId && !tie && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-tathir-light-green">
                    <Trophy className="animate-bounce" />
                    <span className="font-bold">Winner</span>
                  </div>
                )}
              </div>

              {/* VS */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-tathir-brown/20 rounded-full p-3 md:p-4 flex items-center justify-center">
                  <span className="text-2xl md:text-4xl text-tathir-dark-green font-minecraft">VS</span>
                </div>
                {tie && (
                  <div className="mt-2 text-tathir-brown font-bold">
                    It's a tie!
                  </div>
                )}
              </div>

              {/* Invited */}
              <div className="text-center">
                <InfoCard
                  title="Challenger"
                  variant="student"
                  className="mb-2"
                  content={
                    <>
                      <h3 className={`${bloxat.className} text-lg md:text-xl font-bold text-tathir-dark-green mb-3 truncate`}>
                        {invitedResult.userName}
                      </h3>
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center justify-between text-tathir-brown text-sm md:text-base">
                          <span>Total Score:</span>
                          <span className="font-bold text-yellow-600">
                            {invitedResult.totalScore.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-tathir-brown text-sm md:text-base">
                          <span>Correct:</span>
                          <span className="font-bold text-tathir-light-green">
                            {invitedCorrect}/{invitedTotal}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-tathir-brown text-sm md:text-base">
                          <span>Time:</span>
                          <span>{formatTime(invitedResult.timeTaken)}</span>
                        </div>
                      </div>
                    </>
                  }
                />
                {winner?.userId === invitedResult.userId && !tie && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-tathir-light-green">
                    <Trophy className="animate-bounce" />
                    <span className="font-bold">Winner</span>
                  </div>
                )}
              </div>
            </div>
          }
        />
      </div>

      {/* Category comparison */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-minecraft text-tathir-dark-green mb-3 md:mb-4">Category Comparison</h2>
        <div className="space-y-3 md:space-y-4">
          {Array.from(allCategories).map((category) => {
            const creatorCat = creatorResult.categoryScores[category] || { score: 0, total: 0 };
            const invitedCat = invitedResult.categoryScores[category] || { score: 0, total: 0 };
            
            const creatorPercentage = (creatorCat.score / creatorCat.total) * 100 || 0;
            const invitedPercentage = (invitedCat.score / invitedCat.total) * 100 || 0;
            
            return (
              <InfoCard
                key={category}
                title={category}
                variant="admin"
                content={
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {/* Creator's score */}
                    <InfoCard
                      title={creatorResult.userName}
                      variant="student"
                      icon={<User className="text-tathir-light-green" />}
                      content={
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-tathir-brown text-sm md:text-base">
                              {creatorCat.score}/{creatorCat.total} ({creatorPercentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className={style.progressBar}>
                            <div
                              className={`${style.progressFill} ${getProgressBarColor(creatorPercentage)}`}
                              style={{ width: `${creatorPercentage}%` }}
                            />
                          </div>
                        </>
                      }
                    />
                    
                    {/* Invited's score */}
                    <InfoCard
                      title={invitedResult.userName}
                      variant="student"
                      icon={<User className="text-tathir-brown" />}
                      content={
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-tathir-brown text-sm md:text-base">
                              {invitedCat.score}/{invitedCat.total} ({invitedPercentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className={style.progressBar}>
                            <div
                              className={`${style.progressFill} ${getProgressBarColor(invitedPercentage)}`}
                              style={{ width: `${invitedPercentage}%` }}
                            />
                          </div>
                        </>
                      }
                    />
                  </div>
                }
              />
            );
          })}
        </div>
      </div>

      {/* Question by question comparison */}
      <div>
        <h2 className="text-xl md:text-2xl font-minecraft text-tathir-dark-green mb-3 md:mb-4">Question Comparison</h2>
        <div className="space-y-4 md:space-y-6">
          {questions.map((question, index) => {
            const creatorAnswer = creatorResult.answers[question.id] || { selected: null, timeTaken: 0 };
            const invitedAnswer = invitedResult.answers[question.id] || { selected: null, timeTaken: 0 };
            
            const correctAnswerIndex = question.options.indexOf(question.answer);
            const creatorIsCorrect = creatorAnswer.selected === correctAnswerIndex;
            const invitedIsCorrect = invitedAnswer.selected === correctAnswerIndex;

            return (
              <InfoCard
                key={question.id}
                title={`Question ${index + 1}`}
                variant="admin"
                content={
                  <>
                    <div className="mb-3 md:mb-4">
                      <div className="font-minecraft text-lg md:text-xl lg:text-2xl p-2 text-tathir-dark-green break-words">
                        <div 
                          dangerouslySetInnerHTML={{ __html: processedQuestions[question.id]?.title || question.title }}
                          className="prose max-w-none [&>*]:text-current [&_strong]:font-bold [&_em]:italic [&_code]:bg-tathir-cream/20 [&_code]:text-current [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-tathir-cream/20 [&_pre]:text-current [&_pre]:p-3 [&_pre]:rounded [&_blockquote]:border-l-4 [&_blockquote]:border-current [&_blockquote]:pl-4 [&_blockquote]:opacity-80 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
                        />
                      </div>
                    </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                  {/* Creator's answer */}
                  <InfoCard
                    title={creatorResult.userName}
                    variant="student"
                    icon={<User className="text-tathir-success" />}
                    content={
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          {creatorAnswer.selected !== null ? (
                            <div className="ml-auto flex items-center gap-2">
                              <span className="text-tathir-brown flex items-center gap-1 text-sm md:text-base">
                                <Clock className="text-tathir-brown" />
                                {formatTime(creatorAnswer.timeTaken)}
                              </span>
                              {creatorIsCorrect ? (
                                <CheckCircle className="text-tathir-success text-lg md:text-xl" />
                              ) : (
                                <XCircle className="text-tathir-error text-lg md:text-xl" />
                              )}
                            </div>
                          ) : (
                            <span className="ml-auto text-tathir-brown text-sm md:text-base">Not attempted</span>
                          )}
                        </div>

                        {creatorAnswer.selected !== null ? (
                          <div className={`p-2 md:p-3 ${creatorIsCorrect ? style.correctAnswer : style.wrongAnswer}`}>
                            <div className="flex items-center">
                              <span className="w-6 md:w-8 font-minecraft text-sm md:text-base">
                                {String.fromCharCode(65 + creatorAnswer.selected)}.
                              </span>
                              <span className={`${creatorIsCorrect ?'':'text-tathir-cream'} text-sm md:text-base break-words`}>
                                {question.options[creatorAnswer.selected]}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={`p-2 md:p-3 ${style.notAttempted}`}>
                            <span className="font-minecraft text-sm md:text-base">No answer selected</span>
                          </div>
                        )}
                      </>
                    }
                  />

                  {/* Invited's answer */}
                  <InfoCard
                    title={invitedResult.userName}
                    variant="student"
                    icon={<User className="text-tathir-brown" />}
                    content={
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          {invitedAnswer.selected !== null ? (
                            <div className="ml-auto flex items-center gap-2">
                              <span className="text-tathir-brown flex items-center gap-1 text-sm md:text-base">
                                <Clock className="text-tathir-brown" />
                                {formatTime(invitedAnswer.timeTaken)}
                              </span>
                              {invitedIsCorrect ? (
                                <CheckCircle className="text-tathir-success text-lg md:text-xl" />
                              ) : (
                                <XCircle className="text-tathir-error text-lg md:text-xl" />
                              )}
                            </div>
                          ) : (
                            <span className="ml-auto text-tathir-brown text-sm md:text-base">Not attempted</span>
                          )}
                        </div>

                        {invitedAnswer.selected !== null ? (
                          <div className={`p-2 md:p-3 ${invitedIsCorrect ? style.correctAnswer : style.wrongAnswer}`}>
                            <div className="flex items-center">
                              <span className="w-6 md:w-8 font-minecraft text-sm md:text-base">
                                {String.fromCharCode(65 + invitedAnswer.selected)}.
                              </span>
                              <span className={`${invitedIsCorrect?'':'text-tathir-cream'} text-sm md:text-base break-words`}>
                                {question.options[invitedAnswer.selected]}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={`p-2 md:p-3 ${style.notAttempted}`}>
                            <span className="font-minecraft text-sm md:text-base">No answer selected</span>
                          </div>
                        )}
                      </>
                    }
                  />
                </div>

                {/* Correct answer if both got it wrong */}
                {(!creatorIsCorrect || !invitedIsCorrect) && (
                  <InfoCard
                    title="Correct Answer"
                    variant="student"
                    className="mt-3 md:mt-4"
                    content={
                      <>
                        <div className={`p-2 md:p-3 ${style.correctAnswer}`}>
                          <div className="flex items-center">
                            <span className="w-6 md:w-8 font-minecraft text-sm md:text-base">
                              {String.fromCharCode(65 + correctAnswerIndex)}.
                            </span>
                            <span className="font-minecraft text-sm md:text-base break-words">{question.answer}</span>
                          </div>
                        </div>
                        {question.explanation && (
                          <div className="mt-3">
                            <h4 className="font-minecraft mb-2 text-tathir-cream text-sm md:text-base">Explanation</h4>
                            <div 
                              dangerouslySetInnerHTML={{ __html: processedQuestions[question.id]?.explanation || question.explanation }}
                              className="prose prose-invert max-w-none [&>*]:text-tathir-cream [&_strong]:text-tathir-cream [&_em]:text-tathir-cream [&_code]:bg-tathir-maroon/20 [&_code]:text-tathir-cream [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-tathir-maroon/20 [&_pre]:text-tathir-cream [&_pre]:p-3 [&_pre]:rounded [&_blockquote]:border-l-4 [&_blockquote]:border-tathir-cream [&_blockquote]:pl-4 [&_blockquote]:text-tathir-cream/90 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
                            />
                          </div>
                        )}
                      </>
                    }
                  />
                )}
                  </>
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
