import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { safeApiCall, ApiResponse } from './base';

// Leaderboard entry interface
export interface LiveTestLeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  totalCorrect: number;
  totalScore: number;
  timeTaken: number;
  accuracy: number;
  rank?: number;
  percentile?: number;
  submittedAt: Date;
}

// Question statistics interface
export interface QuestionStats {
  questionId: string;
  totalAttempts: number;
  correctCount: number;
  correctPercentage: number;
}

// Enhanced cached leaderboard interface with question stats
export interface CachedLeaderboard {
  testId: string;
  entries: LiveTestLeaderboardEntry[];
  questionStats: QuestionStats[];
  createdAt: Date;
  updatedAt: Date;
  participantCount: number;
}

/**
 * Get live test leaderboard (cached version)
 */
export async function getLiveTestLeaderboard(testId: string): Promise<ApiResponse<LiveTestLeaderboardEntry[]>> {
  return safeApiCall(async () => {
    // Get cached leaderboard - it should already exist from evaluation
    const cachedLeaderboard = await getCachedLeaderboard(testId);
    if (cachedLeaderboard) {
      return cachedLeaderboard.entries;
    }

    // If no cached leaderboard exists, return empty array
    // This shouldn't happen if the test was properly evaluated
    console.warn(`No cached leaderboard found for test ${testId}`);
    return [];
  }, 'Failed to get live test leaderboard');
}

/**
 * Generate live test leaderboard from results
 */
async function generateLiveTestLeaderboard(testId: string): Promise<LiveTestLeaderboardEntry[]> {
  // Get all results for this test
  const resultsRef = collection(db, 'live-test-user-results');
  const q = query(resultsRef, where('testId', '==', testId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return [];
  }

  const results: LiveTestLeaderboardEntry[] = [];
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    
    // Calculate correct answers, handling legacy data with negative marking
    let totalCorrect = data.totalCorrect || 0;
    const totalScore = data.totalScore || 0;
    const totalAttempted = data.totalAttempted;
    
    // If we have totalAttempted, we can calculate the correct answers more accurately
    if (totalAttempted !== undefined && totalAttempted > 0) {
      // Use the formula: (totalScore + totalAttempted * 0.25) / 1.25
      const calculatedCorrect = (totalScore + totalAttempted * 0.25) / 1.25;
      totalCorrect = Math.round(calculatedCorrect);
    } else if (data.categoryScores) {
      // Fallback: sum up correct answers from category scores
      const correctFromCategories = Object.values(data.categoryScores).reduce(
        (sum: number, category: any) => sum + (category.correctAnswers || 0), 
        0
      );
      if (correctFromCategories > 0) {
        totalCorrect = correctFromCategories;
      }
    }
    
    results.push({
      id: doc.id,
      userId: data.userId,
      displayName: data.displayName || 'Unknown User',
      email: data.email || 'unknown@email.com',
      totalCorrect: totalCorrect,
      totalScore: totalScore,
      timeTaken: data.timeTaken || 0,
      accuracy: data.accuracy || 0,
      submittedAt: data.submittedAt?.toDate() || new Date(),
    });
  });

  // Sort by ranking criteria:
  // 1. Total score (with negative marking, higher is better)
  // 2. Total correct answers (higher is better)
  // 3. Accuracy (higher is better)
  // 4. Time taken (lower is better)
  results.sort((a, b) => {
    // First by total score (higher is better)
    if (a.totalScore !== b.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // Then by total correct answers (higher is better)
    if (a.totalCorrect !== b.totalCorrect) {
      return b.totalCorrect - a.totalCorrect;
    }
    // Then by accuracy (higher is better)
    if (Math.abs(a.accuracy - b.accuracy) > 0.01) {
      return b.accuracy - a.accuracy;
    }
    // Finally by time taken (lower is better)
    return a.timeTaken - b.timeTaken;
  });

  // Add ranks and percentiles
  results.forEach((entry, index) => {
    entry.rank = index + 1;
    // Calculate percentile: (rank from bottom / total) * 100
    entry.percentile = Math.round(((results.length - index) / results.length) * 100);
  });

  console.log('[GENERATE_LEADERBOARD] Final sorted results:', results.map(r => ({ 
    userId: r.userId, 
    displayName: r.displayName, 
    totalScore: r.totalScore,
    totalCorrect: r.totalCorrect, 
    accuracy: r.accuracy, 
    timeTaken: r.timeTaken, 
    rank: r.rank, 
    percentile: r.percentile 
  })));

  return results;
}

/**
 * Get cached leaderboard if it exists
 */
async function getCachedLeaderboard(testId: string): Promise<CachedLeaderboard | null> {
  try {
    const leaderboardRef = doc(db, 'live-test-leaderboards', testId);
    const leaderboardDoc = await getDoc(leaderboardRef);
    
    if (!leaderboardDoc.exists()) {
      return null;
    }

    const data = leaderboardDoc.data();
    return {
      testId: data.testId,
      entries: data.entries || [],
      questionStats: data.questionStats || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      participantCount: data.participantCount || 0,
    };
  } catch (error) {
    console.error('Error getting cached leaderboard:', error);
    return null;
  }
}

/**
 * Cache leaderboard for future use and update user results with rank/percentile
 */
async function cacheLeaderboard(testId: string, entries: LiveTestLeaderboardEntry[], questionStats: QuestionStats[]): Promise<void> {
  try {
    const leaderboardRef = doc(db, 'live-test-leaderboards', testId);
    
    const cacheData: any = {
      testId,
      entries,
      questionStats,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      participantCount: entries.length,
    };

    await setDoc(leaderboardRef, cacheData);
    
    // Update each user's result with their rank and percentile
    const updatePromises = entries.map(async (entry) => {
      try {
        const userResultQuery = query(
          collection(db, 'live-test-user-results'),
          where('testId', '==', testId),
          where('userId', '==', entry.userId)
        );
        
        const userResultSnapshot = await getDocs(userResultQuery);
        
        if (!userResultSnapshot.empty) {
          const userResultDoc = userResultSnapshot.docs[0];
          await updateDoc(userResultDoc.ref, {
            rank: entry.rank,
            percentile: entry.percentile,
            updatedAt: Timestamp.now()
          });
          console.log(`[CACHE_LEADERBOARD] Updated user ${entry.userId} with rank ${entry.rank}, percentile ${entry.percentile}`);
        }
      } catch (error) {
        console.error(`[CACHE_LEADERBOARD] Error updating user ${entry.userId}:`, error);
      }
    });
    
    await Promise.all(updatePromises);
    console.log(`[CACHE_LEADERBOARD] Updated ${entries.length} user results with ranks and percentiles`);
    
  } catch (error) {
    console.error('Error caching leaderboard:', error);
    // Don't throw error as this is not critical
  }
}

/**
 * Get current user's position in leaderboard
 */
export async function getUserPositionInLeaderboard(testId: string, userId: string): Promise<ApiResponse<{
  rank: number;
  percentile: number;
  totalParticipants: number;
}>> {
  return safeApiCall(async () => {
    const leaderboard = await getLiveTestLeaderboard(testId);
    
    if (!leaderboard.success || !leaderboard.data) {
      throw new Error('Failed to get leaderboard');
    }

    const userEntry = leaderboard.data.find((entry: LiveTestLeaderboardEntry) => entry.userId === userId);
    
    if (!userEntry) {
      throw new Error('User not found in leaderboard');
    }

    return {
      rank: userEntry.rank || 0,
      percentile: userEntry.percentile || 0,
      totalParticipants: leaderboard.data.length,
    };
  }, 'Failed to get user position in leaderboard');
}

/**
 * Get question statistics for a live test (how many people got each question right)
 */
export async function getLiveTestQuestionStats(testId: string): Promise<ApiResponse<QuestionStats[]>> {
  return safeApiCall(async () => {
    // Get from cached leaderboard
    const cachedLeaderboard = await getCachedLeaderboard(testId);
    if (cachedLeaderboard && cachedLeaderboard.questionStats) {
      return cachedLeaderboard.questionStats;
    }

    // If not cached, return empty array (should not happen after evaluation)
    console.warn(`No cached question stats found for test ${testId}`);
    return [];
  }, 'Failed to get question statistics');
}

/**
 * Generate and cache leaderboard during test evaluation with question statistics
 * This should be called from evaluateLiveTestAdmin after all users are evaluated
 */
export async function generateLeaderboardOnEvaluation(testId: string, questionStats: QuestionStats[]): Promise<ApiResponse<void>> {
  return safeApiCall(async () => {
    const leaderboard = await generateLiveTestLeaderboard(testId);
    await cacheLeaderboard(testId, leaderboard, questionStats);
  }, 'Failed to generate leaderboard during evaluation');
}

/**
 * Get live test leaderboard with question statistics (cached version)
 */
export async function getLiveTestLeaderboardWithStats(testId: string): Promise<ApiResponse<{
  entries: LiveTestLeaderboardEntry[];
  questionStats: QuestionStats[];
}>> {
  return safeApiCall(async () => {
    // Get cached leaderboard - it should already exist from evaluation
    const cachedLeaderboard = await getCachedLeaderboard(testId);
    if (cachedLeaderboard) {
      return {
        entries: cachedLeaderboard.entries,
        questionStats: cachedLeaderboard.questionStats
      };
    }

    // If no cached leaderboard exists, return empty arrays
    // This shouldn't happen if the test was properly evaluated
    console.warn(`No cached leaderboard found for test ${testId}`);
    return {
      entries: [],
      questionStats: []
    };
  }, 'Failed to get live test leaderboard with stats');
}
