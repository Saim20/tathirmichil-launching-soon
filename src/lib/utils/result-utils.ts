import { getQuestionById } from "@/lib/apis/questions";
import { getComprehensiveQuestionById } from "@/lib/apis/comprehensive-questions";
import { AnswerDetail, AnswerMap } from "@/lib/models/test-result";
import { OrderedQuestion } from "@/lib/apis/test-types";

export interface QuestionWithAnswer {
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

export interface ProcessedResultData {
  questions: QuestionWithAnswer[];
  totalCorrect: number;
  totalQuestions: number;
  accuracy: number;
  confidence: number;
}

/**
 * Process test result data and fetch all questions with their answers
 */
export async function processTestResult(
  orderedQuestions: OrderedQuestion[],
  answers: AnswerDetail[] | AnswerMap,
  options?: {
    skipCalculations?: boolean; // Skip accuracy/confidence calculations if data exists
    questionsOnly?: boolean; // Only fetch questions, don't calculate anything
  }
): Promise<ProcessedResultData> {
  console.log("[processTestResult] Input:", { 
    orderedQuestionsCount: orderedQuestions.length, 
    answersType: Array.isArray(answers) ? 'array' : 'object',
    answersKeys: Object.keys(answers || {}),
    options 
  });

  // Convert answers to map format if it's an array
  const answersMap = Array.isArray(answers)
    ? answers.reduce((acc: AnswerMap, answer: AnswerDetail) => {
        acc[answer.id] = {
          selected: answer.selected,
          timeTaken: answer.timeTaken
        };
        return acc;
      }, {} as AnswerMap)
    : answers;

  console.log("[processTestResult] Processed answersMap:", Object.keys(answersMap).slice(0, 5), "...");

  // Process each ordered question
  const processedQuestions: QuestionWithAnswer[] = [];
  
  for (const orderedQuestion of orderedQuestions) {
    if (orderedQuestion.type === 'question') {
      // Handle regular question
      const questionResponse = await getQuestionById(orderedQuestion.id);
      if (questionResponse.success && questionResponse.data) {
        const question = questionResponse.data;
        const answer = answersMap[orderedQuestion.id];
        
        // Handle both string and number answer formats
        let correctAnswerIndex: number;
        if (typeof question.answer === 'string') {
          correctAnswerIndex = question.options.indexOf(question.answer);
        } else {
          correctAnswerIndex = question.answer;
        }

        // Only calculate correctness if we need to (not skipping calculations)
        let isCorrect = false;
        if (!options?.skipCalculations && !options?.questionsOnly) {
          // Only calculate when we actually need the result
          isCorrect = answer?.selected !== undefined && answer?.selected !== null
            ? answer.selected === correctAnswerIndex
            : false;
        }

        console.log(`[processTestResult] Regular Q ${orderedQuestion.id}: answer=${answer?.selected}, correct=${correctAnswerIndex}, isCorrect=${isCorrect}, skipping=${options?.skipCalculations || options?.questionsOnly}`);

        processedQuestions.push({
          id: question.id || orderedQuestion.id,
          title: question.title,
          options: question.options,
          answer: question.answer,
          userAnswer: answer?.selected ?? null,
          timeTaken: answer?.timeTaken ?? 0,
          isCorrect,
          explanation: question.explanation,
          category: question.category,
          subCategory: question.subCategory,
          imageUrl: question.imageUrl
        });
      }
    } else if (orderedQuestion.type === 'comprehensive') {
      // Handle comprehensive question
      const comprehensiveResponse = await getComprehensiveQuestionById(orderedQuestion.id);
      if (comprehensiveResponse.success && comprehensiveResponse.data) {
        const comprehensive = comprehensiveResponse.data;
        
        // Add each sub-question from the comprehensive question
        for (const subQuestion of comprehensive.questions) {
          if (!subQuestion.id) continue; // Skip if no ID
          
          const answer = answersMap[subQuestion.id];
          
          // Handle both string and number answer formats for sub-questions
          let correctAnswerIndex: number;
          if (typeof subQuestion.answer === 'string') {
            correctAnswerIndex = subQuestion.options.indexOf(subQuestion.answer);
          } else {
            correctAnswerIndex = subQuestion.answer;
          }

          // Only calculate correctness if we need to (not skipping calculations)
          let isCorrect = false;
          if (!options?.skipCalculations && !options?.questionsOnly) {
            // Only calculate when we actually need the result
            isCorrect = answer?.selected !== undefined && answer?.selected !== null
              ? answer.selected === correctAnswerIndex
              : false;
          }

          console.log(`[processTestResult] Comprehensive SubQ ${subQuestion.id}: answer=${answer?.selected}, correct=${correctAnswerIndex}, isCorrect=${isCorrect}, skipping=${options?.skipCalculations || options?.questionsOnly}`);

          processedQuestions.push({
            id: subQuestion.id,
            title: `${comprehensive.title} - ${subQuestion.title}`,
            options: subQuestion.options,
            answer: subQuestion.answer,
            userAnswer: answer?.selected ?? null,
            timeTaken: answer?.timeTaken ?? 0,
            isCorrect,
            explanation: subQuestion.explanation,
            category: subQuestion.category,
            subCategory: subQuestion.subCategory,
            imageUrl: subQuestion.imageUrl
          });
        }
      }
    }
  }

  // Calculate statistics - return 0s if skipping calculations
  const totalQuestions = processedQuestions.length;
  const totalCorrect = options?.skipCalculations || options?.questionsOnly 
    ? 0 
    : processedQuestions.filter(q => q.isCorrect).length;
  const attemptedCount = options?.skipCalculations || options?.questionsOnly 
    ? 0 
    : processedQuestions.filter(q => q.userAnswer !== null).length;
  
  console.log("[processTestResult] Statistics:", { 
    totalQuestions, 
    totalCorrect, 
    attemptedCount,
    skipCalculations: options?.skipCalculations,
    questionsOnly: options?.questionsOnly
  });
  
  // Only calculate if not skipping calculations
  const accuracy = options?.skipCalculations || options?.questionsOnly 
    ? 0 
    : (totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0);
  const confidence = options?.skipCalculations || options?.questionsOnly 
    ? 0 
    : (totalQuestions > 0 ? (attemptedCount / totalQuestions) * 100 : 0);

  console.log("[processTestResult] Final result:", { accuracy, confidence });

  return {
    questions: processedQuestions,
    totalCorrect,
    totalQuestions,
    accuracy,
    confidence
  };
}

/**
 * Calculate category scores from processed questions with enhanced tracking
 */
export function calculateCategoryScores(questions: QuestionWithAnswer[]): { [key: string]: { score: number; total: number; time: number; attempted: number } } {
  const categoryScores: { [key: string]: { score: number; total: number; time: number; attempted: number } } = {};

  for (const question of questions) {
    const category = question.category;
    
    if (!categoryScores[category]) {
      categoryScores[category] = { score: 0, total: 0, time: 0, attempted: 0 };
    }

    categoryScores[category].total += 1;
    categoryScores[category].time += question.timeTaken;
    
    if (question.userAnswer !== null) {
      categoryScores[category].attempted += 1;
    }
    
    if (question.isCorrect) {
      categoryScores[category].score += 1;
    }
  }

  return categoryScores;
}
