import { ref, get, onValue, off } from 'firebase/database';
import { rtdb } from '../firebase/firebase';
import { ApiResponse, safeApiCall } from './base';
import { CoinUserData } from './coin-rtdb';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface CoinLeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  profilePictureUrl?: string;
  coins: number;
  rank: number;
  badge?: string;
  batch?: string; // Only batch, no lastActive or email
}

export interface CoinLeaderboardStats {
  totalParticipants: number;
  averageCoins: number;
  topCoins: number;
  totalCoinsInCirculation: number;
  lastUpdated: number;
}

export interface LeaderboardCache {
  entries: CoinLeaderboardEntry[];
  stats: CoinLeaderboardStats;
  lastUpdated: number;
}

// ============================================================================
// CLIENT-SIDE FUNCTIONS
// ============================================================================

/**
 * Get real-time coin leaderboard data from RTDB
 */
export async function getCoinLeaderboardRealtime(
  limitResults: number = 50
): Promise<ApiResponse<{ entries: CoinLeaderboardEntry[]; stats: CoinLeaderboardStats }>> {
  return safeApiCall(async () => {
    const coinsRef = ref(rtdb, 'coins');
    const snapshot = await get(coinsRef);
    
    if (!snapshot.exists()) {
      return {
        entries: [],
        stats: {
          totalParticipants: 0,
          averageCoins: 0,
          topCoins: 0,
          totalCoinsInCirculation: 0,
          lastUpdated: Date.now()
        }
      };
    }

    const coinData = snapshot.val();
    const users: CoinUserData[] = Object.values(coinData);
    
    // Sort by coins (descending) and create leaderboard entries
    const sortedUsers = users
      .sort((a, b) => (b.coins || 0) - (a.coins || 0))
      .slice(0, limitResults);

    const entries: CoinLeaderboardEntry[] = sortedUsers.map((user, index) => ({
      id: user.uid,
      userId: user.uid,
      displayName: user.displayName || 'Anonymous Student',
      profilePictureUrl: user.profilePictureUrl,
      coins: user.coins || 0,
      rank: index + 1,
      badge: getBadgeForRank(index + 1),
      batch: user.batch // Only batch
    }));

    // Calculate statistics
    const totalCoins = users.reduce((sum, user) => sum + (user.coins || 0), 0);
    const stats: CoinLeaderboardStats = {
      totalParticipants: users.length,
      averageCoins: users.length > 0 ? Math.round(totalCoins / users.length) : 0,
      topCoins: entries.length > 0 ? Math.max(...entries.map(entry => entry.coins)) : 0,
      totalCoinsInCirculation: totalCoins,
      lastUpdated: Date.now()
    };

    return { entries, stats };
  }, 'Failed to fetch real-time coin leaderboard');
}

/**
 * Get recent top coin earners (users who gained coins recently)
 */
export async function getRecentTopCoinEarnersRealtime(
  limitResults: number = 10,
  timeWindow: number = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
): Promise<ApiResponse<CoinLeaderboardEntry[]>> {
  return safeApiCall(async () => {
    const coinsRef = ref(rtdb, 'coins');
    const snapshot = await get(coinsRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const coinData = snapshot.val();
    const users: CoinUserData[] = Object.values(coinData);
    const cutoffTime = Date.now() - timeWindow;
    
    // Filter users who were active recently and have coins
    const recentUsers = users
      .filter(user => 
        user.coins > 0
      )
      .sort((a, b) => (b.coins || 0) - (a.coins || 0))
      .slice(0, limitResults);

    return recentUsers.map((user, index) => ({
      id: user.uid,
      userId: user.uid,
      displayName: user.displayName || 'Anonymous Student',
      profilePictureUrl: user.profilePictureUrl,
      coins: user.coins || 0,
      rank: index + 1,
      badge: getBadgeForRank(index + 1),
      batch: user.batch
    }));
  }, 'Failed to fetch recent top coin earners');
}

/**
 * Get user's position in coin leaderboard
 */
export async function getUserCoinPositionRealtime(
  userId: string
): Promise<ApiResponse<{
  rank: number;
  coins: number;
  totalStudents: number;
  percentile: number;
}>> {
  return safeApiCall(async () => {
    const coinsRef = ref(rtdb, 'coins');
    const snapshot = await get(coinsRef);
    
    if (!snapshot.exists()) {
      throw new Error('No coin data available');
    }

    const coinData = snapshot.val();
    const users: CoinUserData[] = Object.values(coinData);
    
    // Sort by coins (descending)
    const sortedUsers = users
      .sort((a, b) => (b.coins || 0) - (a.coins || 0))
      .map(user => ({
        userId: user.uid,
        coins: user.coins || 0
      }));

    const userIndex = sortedUsers.findIndex(user => user.userId === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found in leaderboard');
    }
    
    const rank = userIndex + 1;
    const totalStudents = sortedUsers.length;
    const percentile = Math.round(((totalStudents - rank) / totalStudents) * 100);
    
    return {
      rank,
      coins: sortedUsers[userIndex].coins,
      totalStudents,
      percentile
    };
  }, 'Failed to get user coin position');
}

/**
 * Subscribe to real-time leaderboard updates
 */
export function subscribeToLeaderboard(
  callback: (data: { entries: CoinLeaderboardEntry[]; stats: CoinLeaderboardStats }) => void,
  limitResults: number = 50
): () => void {
  const coinsRef = ref(rtdb, 'coins');
  
  const unsubscribe = onValue(coinsRef, (snapshot) => {
    try {
      if (!snapshot.exists()) {
        callback({
          entries: [],
          stats: {
            totalParticipants: 0,
            averageCoins: 0,
            topCoins: 0,
            totalCoinsInCirculation: 0,
            lastUpdated: Date.now()
          }
        });
        return;
      }

      const coinData = snapshot.val();
      const users: CoinUserData[] = Object.values(coinData);
      
      // Sort by coins (descending) and create leaderboard entries
      const sortedUsers = users
        .sort((a, b) => (b.coins || 0) - (a.coins || 0))
        .slice(0, limitResults);

      const entries: CoinLeaderboardEntry[] = sortedUsers.map((user, index) => ({
        id: user.uid,
        userId: user.uid,
        displayName: user.displayName || 'Anonymous Student',
        profilePictureUrl: user.profilePictureUrl,
        coins: user.coins || 0,
        rank: index + 1,
        badge: getBadgeForRank(index + 1),
        batch: user.batch // Only batch
      }));

      // Calculate statistics
      const totalCoins = users.reduce((sum, user) => sum + (user.coins || 0), 0);
      const stats: CoinLeaderboardStats = {
        totalParticipants: users.length,
        averageCoins: users.length > 0 ? Math.round(totalCoins / users.length) : 0,
        topCoins: entries.length > 0 ? Math.max(...entries.map(entry => entry.coins)) : 0,
        totalCoinsInCirculation: totalCoins,
        lastUpdated: Date.now()
      };

      callback({ entries, stats });
    } catch (error) {
      console.error('Error processing leaderboard update:', error);
    }
  });

  return () => off(coinsRef, 'value', unsubscribe);
}

// ============================================================================
// ADMIN-SIDE FUNCTIONS
// ============================================================================

/**
 * Get cached leaderboard data (for better performance)
 */
export async function getCachedLeaderboard(): Promise<ApiResponse<LeaderboardCache | null>> {
  return safeApiCall(async () => {
    const cacheRef = ref(rtdb, 'leaderboard/cache');
    const snapshot = await get(cacheRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    const cacheData = snapshot.val() as LeaderboardCache;
    
    // Check if cache is stale (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    if (cacheData.lastUpdated < fiveMinutesAgo) {
      return null; // Cache is stale
    }

    return cacheData;
  }, 'Failed to get cached leaderboard');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get badge for rank position
 */
export function getBadgeForRank(rank: number): string | undefined {
  switch (rank) {
    case 1:
      return '🥇 Champion';
    case 2:
      return '🥈 Runner-up';
    case 3:
      return '🥉 Third Place';
    default:
      if (rank <= 10) {
        return '🌟 Top 10';
      } else if (rank <= 25) {
        return '🔥 Top 25';
      } else if (rank <= 50) {
        return '⭐ Top 50';
      }
      return undefined;
  }
}

/**
 * Get total student count from RTDB
 */
export async function getStudentCountRealtime(): Promise<ApiResponse<number>> {
  return safeApiCall(async () => {
    const coinsRef = ref(rtdb, 'coins');
    const snapshot = await get(coinsRef);
    
    if (!snapshot.exists()) {
      return 0;
    }

    const coinData = snapshot.val();
    return Object.keys(coinData).length;
  }, 'Failed to get student count');
}

/**
 * Get coin statistics from RTDB
 */
export async function getCoinStatsRealtime(): Promise<ApiResponse<CoinLeaderboardStats>> {
  return safeApiCall(async () => {
    const coinsRef = ref(rtdb, 'coins');
    const snapshot = await get(coinsRef);
    
    if (!snapshot.exists()) {
      return {
        totalParticipants: 0,
        averageCoins: 0,
        topCoins: 0,
        totalCoinsInCirculation: 0,
        lastUpdated: Date.now()
      };
    }

    const coinData = snapshot.val();
    const users: CoinUserData[] = Object.values(coinData);
    const totalCoins = users.reduce((sum, user) => sum + (user.coins || 0), 0);
    const coinsArray = users.map(user => user.coins || 0);

    return {
      totalParticipants: users.length,
      averageCoins: users.length > 0 ? Math.round(totalCoins / users.length) : 0,
      topCoins: coinsArray.length > 0 ? Math.max(...coinsArray) : 0,
      totalCoinsInCirculation: totalCoins,
      lastUpdated: Date.now()
    };
  }, 'Failed to get coin statistics');
}
