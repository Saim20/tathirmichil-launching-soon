import { DocumentData } from "firebase/firestore";
import { ApiResponse, getDocumentById, validateRequiredFields, safeApiCall } from "./base";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Question } from "./questions";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

/**
 * Comprehensive Question interface - contains a title and multiple questions
 */
export interface ComprehensiveQuestion {
    id: string | null;
    title: string;
    category: string;
    subCategory: string;
    questions: Question[];
    totalQuestions: number;
}

/**
 * Input type for creating comprehensive questions (without auto-generated fields)
 */
export interface CreateComprehensiveQuestion {
    title: string;
    category: string;
    subCategory: string;
    random: number; // Optional random field for shuffling
    questions: Omit<Question, 'id' | 'category' | 'subCategory'>[];
}

// ============================================================================
// DATA TRANSFORMERS
// ============================================================================

const transformComprehensiveQuestion = (data: DocumentData, id: string): ComprehensiveQuestion => {
    validateRequiredFields(data, ['title', 'category', 'questions'], 'Comprehensive Question');
    
    // Transform nested questions
    const questions: Question[] = (data.questions || []).map((q: any, index: number) => ({
        id: q.id || `${id}_${index}`,
        title: q.title,
        options: q.options || [],
        answer: q.answer,
        explanation: q.explanation || '',
        category: data.category || '',
        subCategory: data.subCategory || '',
        imageUrl: q.imageUrl || undefined,
    }));
    
    return {
        id,
        title: data.title,
        category: data.category,
        subCategory: data.subCategory || '',
        questions,
        totalQuestions: questions.length,
    };
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Create a new comprehensive question
 */
export async function createComprehensiveQuestion(
    comprehensiveQuestionData: CreateComprehensiveQuestion
): Promise<ApiResponse<string>> {
    return safeApiCall(async () => {
        // Validate required fields
        validateRequiredFields(comprehensiveQuestionData, ['title', 'category', 'questions'], 'Comprehensive Question');
        
        // Validate that questions array is not empty
        if (!comprehensiveQuestionData.questions || comprehensiveQuestionData.questions.length === 0) {
            throw new Error('Comprehensive question must have at least one question');
        }
        
        // Validate each question in the array
        comprehensiveQuestionData.questions.forEach((question, index) => {
            validateRequiredFields(question, ['title', 'options', 'answer'], `Question ${index + 1}`);
            
            // Validate that options array has at least 2 options
            if (!question.options || question.options.length < 2) {
                throw new Error(`Question ${index + 1} must have at least 2 options`);
            }
            
            // Validate that answer is one of the options
            if (!question.options.includes(question.answer)) {
                throw new Error(`Question ${index + 1}: Answer must be one of the provided options`);
            }
        });
        
        const dataToSave = {
            ...comprehensiveQuestionData,
            totalQuestions: comprehensiveQuestionData.questions.length,
        };
        
        const comprehensiveQuestionsRef = collection(db, 'comprehensive-questions');
        const docRef = await addDoc(comprehensiveQuestionsRef, dataToSave);
        return docRef.id;
    }, 'Failed to create comprehensive question');
}

/**
 * Get comprehensive question by ID
 */
export async function getComprehensiveQuestionById(id: string): Promise<ApiResponse<ComprehensiveQuestion>> {
    return getDocumentById('comprehensive-questions', id, transformComprehensiveQuestion);
}

/**
 * Get all comprehensive questions
 */
export async function getAllComprehensiveQuestions(): Promise<ApiResponse<ComprehensiveQuestion[]>> {
    return safeApiCall(async () => {
        const comprehensiveQuestionsRef = collection(db, 'comprehensive-questions');
        const snapshot = await getDocs(comprehensiveQuestionsRef);
        return snapshot.docs.map(doc => transformComprehensiveQuestion(doc.data(), doc.id));
    }, 'Failed to fetch all comprehensive questions');
}

/**
 * Update comprehensive question by ID
 */
export async function updateComprehensiveQuestion(
    id: string, 
    comprehensiveQuestionData: Partial<CreateComprehensiveQuestion>
): Promise<ApiResponse<void>> {
    return safeApiCall(async () => {
        // Prepare update data
        const updateData: any = {
            ...comprehensiveQuestionData,
        };

        // Strip undefined fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
            // For each question, remove undefined fields
            if (key === 'questions' && Array.isArray(updateData.questions)) {
                updateData.questions = updateData.questions.map((question: any) => {
                    const cleanedQuestion: any = { ...question };
                    Object.keys(cleanedQuestion).forEach(qKey => {
                        if (cleanedQuestion[qKey] === undefined) {
                            delete cleanedQuestion[qKey];
                        }
                    });
                    return cleanedQuestion;
                });
            }
        });
        
        
        // If questions are being updated, recalculate totalQuestions
        if (comprehensiveQuestionData.questions) {
            if (comprehensiveQuestionData.questions.length === 0) {
                throw new Error('Comprehensive question must have at least one question');
            }
            
            // Validate each question if updating questions
            comprehensiveQuestionData.questions.forEach((question, index) => {
                validateRequiredFields(question, ['title', 'options', 'answer'], `Question ${index + 1}`);
                
                if (!question.options || question.options.length < 2) {
                    throw new Error(`Question ${index + 1} must have at least 2 options`);
                }
                
                if (!question.options.includes(question.answer)) {
                    throw new Error(`Question ${index + 1}: Answer must be one of the provided options`);
                }
            });
            
            updateData.totalQuestions = comprehensiveQuestionData.questions.length;
        }
        
        // Validate required fields if they are being updated
        const fieldsToValidate = ['title', 'category'].filter(
            field => updateData[field] !== undefined
        );
        
        if (fieldsToValidate.length > 0) {
            validateRequiredFields(updateData, fieldsToValidate, 'Comprehensive Question update');
        }
        
        const comprehensiveQuestionRef = doc(collection(db, 'comprehensive-questions'), id);
        await updateDoc(comprehensiveQuestionRef, updateData);
    }, 'Failed to update comprehensive question');
}

export async function deleteComprehensiveQuestion(id: string): Promise<ApiResponse<void>> {
    return safeApiCall(async () => {
        const comprehensiveQuestionRef = doc(collection(db, 'comprehensive-questions'), id);
        await updateDoc(comprehensiveQuestionRef, { deleted: true });
    }, 'Failed to delete comprehensive question');
}
