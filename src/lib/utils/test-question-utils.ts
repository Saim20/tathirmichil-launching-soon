import { ComprehensiveQuestionWithTimer, QuestionWithTimer, QuestionOrComprehensiveWithTimer } from "../apis/questions";
import { Test } from "../apis/test-types";

/**
 * Filters questions and comprehensive questions based on a test's category and subcategory.
 * This utility function ensures that only questions matching the test's filters are included.
 * 
 * @param questions - Array of questions to filter
 * @param test - Test object containing category and subcategory filters
 * @returns Filtered array of questions
 */
export function filterQuestionsByTestCategories(
  questions: QuestionOrComprehensiveWithTimer[], 
  test: Test
): QuestionOrComprehensiveWithTimer[] {
  // If no category filters are set, return all questions
  if (!test.category && !test.subCategory) {
    return questions;
  }

  return questions.filter((questionItem) => {
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
}

/**
 * Flattens comprehensive questions into individual questions while preserving parent relationship.
 * 
 * @param questions - Array of questions that may include comprehensive questions
 * @returns Array of flattened QuestionWithTimer objects
 */
export function flattenQuestionsForTest(questions: QuestionOrComprehensiveWithTimer[]): QuestionWithTimer[] {
  const flattenedQuestions: QuestionWithTimer[] = [];
  
  questions.forEach((questionItem) => {
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

  return flattenedQuestions;
}

/**
 * Utility function that combines filtering and flattening for test questions.
 * This is the main function to use in test-taking pages.
 * 
 * @param questions - Array of questions from the API
 * @param test - Test object containing category and subcategory filters
 * @returns Array of filtered and flattened QuestionWithTimer objects
 */
export function processTestQuestions(
  questions: QuestionOrComprehensiveWithTimer[], 
  test: Test
): QuestionWithTimer[] {
  const filteredQuestions = filterQuestionsByTestCategories(questions, test);
  return flattenQuestionsForTest(filteredQuestions);
}
