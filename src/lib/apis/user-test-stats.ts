import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { safeApiCall, ApiResponse, timestampToDate } from './base';

// Interface for user live test statistics
export interface UserLiveTestStats {
    testId: string;
    testTitle?: string;
    totalScore: number;
    totalCorrect: number;
    timeTaken: number;
    accuracy: number;
    rank?: number;
    percentile?: number;
    submittedAt: Date;
    tabSwitchCount?: number;
    categoryScores: Record<string, {
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        time: number;
        attempted: number;
    }>;
}

/**
 * Get the latest live test result for a specific user
 */
export async function getUserLiveTestStats(userId: string): Promise<ApiResponse<UserLiveTestStats | null>> {
    return safeApiCall(async () => {
        const resultsRef = collection(db, 'live-test-user-results');
        const q = query(
            resultsRef,
            where('userId', '==', userId),
            orderBy('submittedAt', 'desc'), // Order by submission date
            limit(1)
        );

        const snapshot = await getDocs(q);

        console.log(snapshot.docs[0]?.data());
        

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        
        return {
            testId: data.testId,
            testTitle: data.testTitle, // If available
            totalScore: data.totalScore || 0,
            totalCorrect: data.totalCorrect || 0,
            timeTaken: data.timeTaken || 0,
            accuracy: data.accuracy || 0,
            rank: data.rank,
            percentile: data.percentile,
            submittedAt: data.submittedAt?.toDate() || new Date(),
            tabSwitchCount: data.tabSwitchCount || 0,
            categoryScores: data.categoryScores || {}
        };
    }, 'Failed to fetch user latest live test statistics');
}

/**
 * Get multiple live test results for a specific user (up to 5 most recent)
 */
export async function getUserLiveTestHistory(userId: string): Promise<ApiResponse<UserLiveTestStats[]>> {
    return safeApiCall(async () => {
        const resultsRef = collection(db, 'live-test-user-results');
        const q = query(
            resultsRef,
            where('userId', '==', userId),
            orderBy('submittedAt', 'desc'), // Order by submission date
            limit(5)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return [];
        }

        const results: UserLiveTestStats[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                testId: data.testId,
                testTitle: data.testTitle, // If available
                totalScore: data.totalScore || 0,
                totalCorrect: data.totalCorrect || 0,
                timeTaken: data.timeTaken || 0,
                accuracy: data.accuracy || 0,
                rank: data.rank,
                percentile: data.percentile,
                submittedAt: data.submittedAt?.toDate() || new Date(),
                tabSwitchCount: data.tabSwitchCount || 0,
                categoryScores: data.categoryScores || {}
            };
        });

        // Sort by submission date in descending order
        results.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
        return results;
    }, 'Failed to fetch user live test history');
}

/**
 * Get user performance summary from latest live test
 */
export async function getUserLiveTestSummary(userId: string): Promise<ApiResponse<{
    hasLatestTest: boolean;
    latestScore?: number;
    latestAccuracy?: number;
    latestRank?: number;
    latestPercentile?: number;
    latestCorrectAnswers?: number;
    latestTimeTaken?: number;
    latestSubmittedAt?: Date;
}>> {
    return safeApiCall(async () => {
        const stats = await getUserLiveTestStats(userId);

        if (!stats.success || !stats.data) {
            return {
                hasLatestTest: false
            };
        }

        const result = stats.data;

        return {
            hasLatestTest: true,
            latestScore: result.totalScore,
            latestAccuracy: result.accuracy,
            latestRank: result.rank,
            latestPercentile: result.percentile,
            latestCorrectAnswers: result.totalCorrect,
            latestTimeTaken: result.timeTaken,
            latestSubmittedAt: result.submittedAt
        };
    }, 'Failed to fetch user live test summary');
}


