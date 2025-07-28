/**
 * Base API utilities for consistent error handling and common patterns
 */
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  limit, 
  orderBy, 
  Query, 
  query, 
  startAfter,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from "firebase/firestore";
import { db } from "../firebase/firebase";

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Standard pagination options
 */
export interface PaginationOptions {
  limitToFetch?: number;
  lastItem?: any;
}

/**
 * Base error class for API operations
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Wrapper for safe API operations with consistent error handling
 */
export async function safeApiCall<T>(
  operation: () => Promise<T>,
  errorMessage = "An error occurred"
): Promise<ApiResponse<T>> {
  try {
    const data = await operation();
    return {
      data,
      error: null,
      success: true
    };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return {
      data: null,
      error: error instanceof Error ? error.message : errorMessage,
      success: false
    };
  }
}

/**
 * Get a single document with consistent error handling
 */
export async function getDocumentById<T>(
  collectionName: string,
  id: string,
  transform: (data: DocumentData, id: string) => T
): Promise<ApiResponse<T>> {
  return safeApiCall(async () => {
    const docRef = doc(collection(db, collectionName), id);
    const docSnapshot = await getDoc(docRef);
    
    if (!docSnapshot.exists()) {
      throw new ApiError(`${collectionName} with ID ${id} not found`, 'NOT_FOUND', 404);
    }
    
    return transform(docSnapshot.data(), docSnapshot.id);
  }, `Failed to fetch ${collectionName} by ID`);
}

/**
 * Get paginated collection with consistent patterns
 */
export async function getPaginatedCollection<T>(
  collectionName: string,
  transform: (data: DocumentData, id: string) => T,
  options: PaginationOptions & {
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
  } = {}
): Promise<ApiResponse<T[]>> {
  return safeApiCall(async () => {
    const {
      limitToFetch = 10,
      lastItem = null,
      orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;
    
    const collectionRef = collection(db, collectionName);
    
    let queryRef: Query;
    if (lastItem) {
      queryRef = query(
        collectionRef,
        orderBy(orderByField, orderDirection),
        limit(limitToFetch),
        startAfter(lastItem)
      );
    } else {
      queryRef = query(
        collectionRef,
        orderBy(orderByField, orderDirection),
        limit(limitToFetch)
      );
    }
    
    const snapshot = await getDocs(queryRef);
    return snapshot.docs.map(doc => transform(doc.data(), doc.id));
  }, `Failed to fetch ${collectionName} collection`);
}

/**
 * Transform Firestore timestamp to Date
 */
export function timestampToDate(timestamp: any): Date {
  return timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
}

/**
 * Validate required fields in data object
 */
export function validateRequiredFields(
  data: any,
  requiredFields: string[],
  context = "Data validation"
): void {
  const missingFields = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null
  );
  
  if (missingFields.length > 0) {
    throw new ApiError(
      `${context}: Missing required fields: ${missingFields.join(', ')}`,
      'VALIDATION_ERROR',
      400
    );
  }
}

/**
 * Common data transformers
 */
export const transformers = {
  /**
   * Standard document transformer with createdAt/updatedAt handling
   */
  withTimestamps: <T extends Record<string, any>>(
    data: DocumentData,
    id: string,
    additionalFields: Partial<T> = {}
  ): T & { id: string; createdAt: Date; updatedAt?: Date } => ({
    id,
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: data.updatedAt ? timestampToDate(data.updatedAt) : undefined,
    ...additionalFields
  } as T & { id: string; createdAt: Date; updatedAt?: Date }),
  
  /**
   * Transformer for test-like entities with time-based fields
   */
  withTestFields: <T extends Record<string, any>>(
    data: DocumentData,
    id: string,
    additionalFields: Partial<T> = {}
  ): T & { id: string; title: string; time: number; questions: string[]; comprehensiveQuestions?: string[]; createdAt: Date } => ({
    id,
    title: data.title || "Untitled",
    time: data.time,
    questions: data.questions || [],
    comprehensiveQuestions: data.comprehensiveQuestions || undefined,
    createdAt: timestampToDate(data.createdAt),
    ...additionalFields
  } as T & { id: string; title: string; time: number; questions: string[]; comprehensiveQuestions?: string[]; createdAt: Date })
};
