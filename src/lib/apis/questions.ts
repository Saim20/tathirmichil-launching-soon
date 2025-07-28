import { DocumentData } from "firebase/firestore";
import { ApiResponse, getDocumentById, validateRequiredFields, safeApiCall } from "./base";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface Question {
    id: string | null;
    title: string;
    options: string[];
    answer: string;
    explanation: string;
    category: string;
    subCategory: string;
    imageUrl?: string; // Optional image URL for questions
    usedForPracticeTest?: boolean; // Track if question has been used in practice tests
}

export interface QuestionWithTimer extends Question {
    time: number; // Time taken for the question in seconds
    timeSelected: number | null;
    selected: number | null; // Index of the selected option
    type: 'question' | 'comprehensive'; // Type of question, can be 'question' or 'comprehensive'
}

// Interface for comprehensive questions with timer functionality
export interface ComprehensiveQuestionWithTimer {
    id: string;
    time: number; // Total time taken for the comprehensive question
    subQuestionAnswers: {
        [subQuestionId: string]: {
            selected: number | null;
            timeTaken: number;
        };
    };
    type: 'comprehensive';
    comprehensiveData?: any; // The actual comprehensive question data
}

// Union type for questions with timer that can be either regular or comprehensive
export type QuestionOrComprehensiveWithTimer = QuestionWithTimer | ComprehensiveQuestionWithTimer;

// ============================================================================
// DATA TRANSFORMERS
// ============================================================================

const transformQuestion = (data: DocumentData, id: string): Question => {
    validateRequiredFields(data, ['title', 'options', 'answer', 'category'], 'Question');
    
    return {
        id,
        title: data.title,
        options: data.options || [],
        answer: data.answer,
        explanation: data.explanation || '',
        category: data.category,
        subCategory: data.subCategory || '',
        imageUrl: data.imageUrl || undefined,
    };
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get question by ID with error handling
 */
export async function getQuestionById(id: string): Promise<ApiResponse<Question>> {
    return getDocumentById('questions', id, transformQuestion);
}

/**
 * Get all questions from Firestore
 */
export async function getAllQuestions(): Promise<ApiResponse<Question[]>> {
    return safeApiCall(async () => {
        const questionsRef = collection(db, 'questions');
        const snapshot = await getDocs(questionsRef);
        return snapshot.docs.map(doc => transformQuestion(doc.data(), doc.id));
    }, 'Failed to fetch all questions');
}

/**
 * Update question by ID with error handling
 */
export async function updateQuestion(id: string, questionData: Partial<Question>): Promise<ApiResponse<void>> {
    return safeApiCall(async () => {
        // Remove id from update data to avoid conflicts
        const { id: _, ...updateData } = questionData;
        // Remove imageUrl if it is not provided
        if (updateData.imageUrl === undefined) {
            delete updateData.imageUrl;
        }
        
        // Validate required fields if they are being updated
        const fieldsToValidate = ['title', 'options', 'answer', 'category', 'subCategory'].filter(
            field => updateData[field as keyof typeof updateData] !== undefined
        );
        
        if (fieldsToValidate.length > 0) {
            validateRequiredFields(updateData, fieldsToValidate, 'Question update');
        }
        
        const questionRef = doc(collection(db, 'questions'), id);
        await updateDoc(questionRef, updateData);
    }, 'Failed to update question');
}