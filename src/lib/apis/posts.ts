import { collection, getDocs, query, where, orderBy, Firestore, Timestamp, DocumentData } from "firebase/firestore";
import { UserProfile } from "./users";
import { db } from "../firebase/firebase";
import { ApiResponse, safeApiCall, timestampToDate, validateRequiredFields } from "./base";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface Post {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  type: "everyone" | "batch" | "student";
  value?: string | null;
}

// ============================================================================
// DATA TRANSFORMERS
// ============================================================================

const transformPost = (data: DocumentData, id: string): Post => {
  validateRequiredFields(data, ['title', 'body', 'type'], 'Post');
  
  return {
    id,
    title: data.title,
    body: data.body,
    createdAt: timestampToDate(data.createdAt),
    type: data.type,
    value: data.value || null,
  };
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get student batch with caching and error handling
 */
export async function getStudentBatch(
  db: Firestore, 
  user: { uid: string; email: string }
): Promise<ApiResponse<string | null>> {
  return safeApiCall(async () => {
    validateRequiredFields(user, ['uid', 'email'], 'User data');
    
    // Try localStorage cache first
    if (typeof window !== "undefined") {
      const localProfile = localStorage.getItem("studentProfile");
      if (localProfile) {
        try {
          const profile = JSON.parse(localProfile);
          if (profile?.batch) {
            return profile.batch;
          }
        } catch (error) {
          console.warn('Failed to parse cached student profile:', error);
        }
      }
    }
    
    // Fallback: fetch from Firestore
    const userQuery = query(
      collection(db, "users"), 
      where("email", "==", user.email)
    );
    
    const docSnap = await getDocs(userQuery);
    if (docSnap.empty) {
      return null;
    }
    
    const userData = docSnap.docs[0].data();
    return userData.batch || null;
  }, 'Failed to get student batch');
}

/**
 * Get posts for student with improved error handling and performance
 */
export async function getPostsForStudent(user: UserProfile): Promise<ApiResponse<Post[]>> {
  return safeApiCall(async () => {
    validateRequiredFields(user, ['uid'], 'User profile');
    
    const postsRef = collection(db, "posts");
    const orderByClause = orderBy("createdAt", "desc");
    
    // Create optimized queries
    const queries = [
      // Posts for everyone
      query(postsRef, orderByClause, where('type', '==', 'everyone')),
      // Posts for specific student
      query(postsRef, orderByClause, where('type', '==', 'student'), where('value', '==', user.uid))
    ];
    
    // Add batch-specific query if user has a batch
    if (user.batch) {
      queries.push(
        query(postsRef, orderByClause, where('type', '==', 'batch'), where('value', '==', user.batch))
      );
    }
    
    // Execute all queries in parallel
    const snapshots = await Promise.all(queries.map(q => getDocs(q)));
    
    // Transform and combine results
    const allPosts: Post[] = [];
    snapshots.forEach(snapshot => {
      const posts = snapshot.docs.map(doc => transformPost(doc.data(), doc.id));
      allPosts.push(...posts);
    });
    
    // Sort by creation date (newest first) and remove duplicates
    const uniquePosts = allPosts
      .filter((post, index, self) => 
        index === self.findIndex(p => p.id === post.id)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return uniquePosts;
  }, 'Failed to get posts for student');
}
