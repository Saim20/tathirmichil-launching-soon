import { collection, getDocs, query, where, Timestamp, doc, getDoc, DocumentData, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { ApiResponse, safeApiCall, timestampToDate, validateRequiredFields } from "./base";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface UserProfile {
  uid: string;
  displayName?: string;
  batch?: string;
  email: string;
  updatedAt?: Date;
  role?: string;
  // NOTE: coins field removed - now managed in RTDB
  // coins?: number;
  confidence?: number;
  accuracy?: number;
  isPassed?: boolean;
  totalTestsTaken?: number; // Legacy field for all tests combined
  practiceTestsTaken?: number; // Specific field for practice tests only
  isSubscribed?: boolean; // Optional field for subscription status
  purchasedVideos?: string[]; // Array of purchased video IDs
  profilePictureUrl?: string; // Profile picture URL
  grade?: string; // Student grade (A, B, C, D, F)
  gradeUpdatedAt?: Date; // When the grade was last updated
  approvalStatus?: 'accepted' | 'rejected' | 'unsure'; // Admin approval status for personal batch
  approvalUpdatedAt?: Date; // When the approval status was last updated
}

// ============================================================================
// CONSTANTS
// ============================================================================

const USERS_UPDATED_AT_KEY = "cached_users_last_updated_at";
const STUDENT_PROFILE_KEY = "studentProfile";

// ============================================================================
// DATA TRANSFORMERS
// ============================================================================

export const transformUser = (data: DocumentData, uid: string): UserProfile => {
  const isSubscribed = data.subStatus === "active";
  return {
    uid,
    displayName: data.displayName || "",
    email: data.email || "",
    batch: data.batch,
    updatedAt: data.updatedAt ? timestampToDate(data.updatedAt) : undefined,
    role: data.role || "",
    // NOTE: coins field removed - now managed in RTDB
    // coins: data.coins || 0,
    confidence: data.confidence || 0,
    accuracy: data.accuracy || 0,
    isPassed: data.isPassed || false,
    totalTestsTaken: data.totalTestsTaken || 0,
    practiceTestsTaken: data.practiceTestsTaken || 0,
    isSubscribed: isSubscribed,
    purchasedVideos: data.purchasedVideos || [],
    profilePictureUrl: data.profilePictureUrl || "",
    grade: data.grade || undefined,
    gradeUpdatedAt: data.gradeUpdatedAt ? timestampToDate(data.gradeUpdatedAt) : undefined,
    approvalStatus: data.approvalStatus || undefined,
    approvalUpdatedAt: data.approvalUpdatedAt ? timestampToDate(data.approvalUpdatedAt) : undefined,
  };
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all users with optional incremental updates based on lastUpdatedAt
 */
export async function getAllUsers(lastUpdatedAt?: Date): Promise<ApiResponse<Map<string, UserProfile>>> {
  return safeApiCall(async () => {
    // Build query: fetch only users updated after lastUpdatedAt if provided
    let usersQuery;
    
    if (lastUpdatedAt) {
      usersQuery = query(
        collection(db, "users"),
        where("updatedAt", ">", Timestamp.fromDate(lastUpdatedAt))
      );
    } else {
      usersQuery = query(
        collection(db, "users"),
      );
    }

    const snapshot = await getDocs(usersQuery);
    const users = snapshot.docs.map(doc =>
      transformUser(doc.data(), doc.id)
    );

    const usersMap = new Map<string, UserProfile>();
    users.forEach(user => usersMap.set(user.uid, user));

    return usersMap;
  }, 'Failed to get all users');
}

/**
 * Get current user profile with caching
 */
export async function getDefaultUser(useCache: boolean = true): Promise<ApiResponse<UserProfile | null>> {
  return safeApiCall(async () => {
    if (!auth.currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    // Try cache first if enabled
    if (useCache && typeof window !== 'undefined') {
      try {
        const cachedUser = localStorage.getItem(STUDENT_PROFILE_KEY);
        if (cachedUser) {
          return JSON.parse(cachedUser);
        }
      } catch (error) {
        console.warn('Failed to parse cached student profile:', error);
      }
    }

    // Fetch from Firestore
    const userDoc = await getDoc(doc(collection(db, 'users'), auth.currentUser.uid));

    if (!userDoc.exists()) {
      return null;
    }

    const userData = transformUser(userDoc.data(), userDoc.id);

    // Update cache
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(userData));
      } catch (error) {
        console.warn('Failed to cache student profile:', error);
      }
    }

    return userData;
  }, 'Failed to get user profile');
}

/**
 * Get user by UID with optional caching
 */
export async function getUserByUid(uid: string, useCache: boolean = false): Promise<ApiResponse<UserProfile>> {
  return safeApiCall(async () => {
    if (useCache) {
      const cachedUsersResponse = await getAllUsers();
      if (cachedUsersResponse.success && cachedUsersResponse.data) {
        const user = cachedUsersResponse.data.get(uid);
        if (user) {
          return user;
        }
      }
    }

    const userDoc = await getDoc(doc(collection(db, 'users'), uid));
    if (!userDoc.exists()) {
      throw new Error(`User with UID ${uid} not found`);
    }

    return transformUser(userDoc.data(), userDoc.id);
  }, 'Failed to get user by UID');
}

/**
 * Update user grade in Firestore
 */
export async function updateUserGrade(uid: string, grade: string): Promise<ApiResponse<void>> {
  return safeApiCall(async () => {
    if (!uid || !grade) {
      throw new Error('UID and grade are required');
    }

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      grade,
      gradeUpdatedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }, 'Failed to update user grade');
}

/**
 * Get total practice tests count from data collection
 */
export async function getTotalPracticeTests(): Promise<ApiResponse<number>> {
  return safeApiCall(async () => {
    const dataDoc = await getDoc(doc(collection(db, 'data'), 'test'));
    
    if (!dataDoc.exists()) {
      throw new Error('Test data document not found');
    }
    
    const data = dataDoc.data();
    return data.totalPracticeTests || 0;
  }, 'Failed to get total practice tests count');
}
