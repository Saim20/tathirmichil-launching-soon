import { BaseTestResult } from "@/lib/models/test-result";

/**
 * Calculate the actual number of correct answers from test result data
 * This handles both new data (with totalAttempted) and legacy data (without totalAttempted)
 */
export function calculateCorrectAnswers(result: BaseTestResult): number {
  // If we have the direct correct answers count, use it
  if (result.totalCorrect && !isScoreWithNegativeMarking(result)) {
    return result.totalCorrect;
  }

  // If we have totalAttempted, use the formula: (totalScore + totalAttempted * 0.25) / 1.25
  if (result.totalAttempted !== undefined) {
    const calculatedCorrect = (result.totalScore + result.totalAttempted * 0.25) / 1.25;
    return Math.round(calculatedCorrect);
  }

  // Fallback: calculate from category scores
  const totalCorrectFromCategories = Object.values(result.categoryScores).reduce(
    (sum, category) => sum + category.correctAnswers, 
    0
  );

  if (totalCorrectFromCategories > 0) {
    return totalCorrectFromCategories;
  }

  // Last resort: if totalCorrect seems to be a raw score with negative marking, try to calculate
  if (result.totalCorrect && isScoreWithNegativeMarking(result)) {
    const totalAttemptedFromCategories = Object.values(result.categoryScores).reduce(
      (sum, category) => sum + category.attempted, 
      0
    );
    
    if (totalAttemptedFromCategories > 0) {
      const calculatedCorrect = (result.totalCorrect + totalAttemptedFromCategories * 0.25) / 1.25;
      return Math.round(calculatedCorrect);
    }
  }

  // Fallback to stored value
  return result.totalCorrect || 0;
}

/**
 * Calculate the total number of questions attempted
 */
export function calculateTotalAttempted(result: BaseTestResult): number {
  // If we have totalAttempted, use it
  if (result.totalAttempted !== undefined) {
    return result.totalAttempted;
  }

  // Calculate from category scores
  return Object.values(result.categoryScores).reduce(
    (sum, category) => sum + category.attempted, 
    0
  );
}

/**
 * Calculate the total number of questions in the test
 */
export function calculateTotalQuestions(result: BaseTestResult): number {
  return Object.values(result.categoryScores).reduce(
    (sum, category) => sum + category.totalQuestions, 
    0
  );
}

/**
 * Check if the score appears to include negative marking
 * This is a heuristic check - if totalCorrect is not a whole number or if it's negative
 */
function isScoreWithNegativeMarking(result: BaseTestResult): boolean {
  if (!result.totalCorrect) return false;
  
  // If the score is not a whole number, it likely includes negative marking
  if (result.totalCorrect !== Math.floor(result.totalCorrect)) {
    return true;
  }

  // If the score is negative, it definitely includes negative marking
  if (result.totalCorrect < 0) {
    return true;
  }

  // Check if the score seems inconsistent with category data
  const totalCorrectFromCategories = Object.values(result.categoryScores).reduce(
    (sum, category) => sum + category.correctAnswers, 
    0
  );

  // If category data shows correct answers but totalCorrect is different, 
  // totalCorrect might be a score with negative marking
  if (totalCorrectFromCategories > 0 && Math.abs(result.totalCorrect - totalCorrectFromCategories) > 1) {
    return true;
  }

  return false;
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(result: BaseTestResult): number {
  const totalCorrect = calculateCorrectAnswers(result);
  const totalAttempted = calculateTotalAttempted(result);
  
  if (totalAttempted === 0) return 0;
  
  return (totalCorrect / totalAttempted) * 100;
}

/**
 * Calculate attempt percentage (confidence)
 */
export function calculateAttemptPercentage(result: BaseTestResult): number {
  const totalAttempted = calculateTotalAttempted(result);
  const totalQuestions = calculateTotalQuestions(result);
  
  if (totalQuestions === 0) return 0;
  
  return (totalAttempted / totalQuestions) * 100;
}
