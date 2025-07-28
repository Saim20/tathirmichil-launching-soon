import { adminDb } from "../firebase/firebase-admin";
import { CoinUserData } from "./coin-rtdb";
import { CoinLeaderboardStats, getBadgeForRank, LeaderboardCache } from "./leaderboard-rtdb";

/**
 * Update leaderboard cache (admin function for optimization)
 */
export async function updateLeaderboardCacheAdmin(limitResults: number = 100): Promise<void> {
  try {
    const snapshot = await adminDb.ref('coins').once('value');
    if (!snapshot.exists()) {
      return;
    }
    const coinData = snapshot.val();
    const users: CoinUserData[] = Object.values(coinData);
    // Create top performers cache
    const topPerformers = users
      .filter(user => user.coins > 0)
      .sort((a, b) => (b.coins || 0) - (a.coins || 0))
      .slice(0, limitResults)
      .map((user, index) => ({
        id: user.uid,
        userId: user.uid,
        displayName: user.displayName || 'Anonymous Student',
        profilePictureUrl: user.profilePictureUrl,
        coins: user.coins || 0,
        rank: index + 1,
        badge: getBadgeForRank(index + 1),
        batch: user.batch
      }));
    // Calculate statistics
    const totalCoins = users.reduce((sum, user) => sum + (user.coins || 0), 0);
    const stats: CoinLeaderboardStats = {
      totalParticipants: users.length,
      averageCoins: users.length > 0 ? Math.round(totalCoins / users.length) : 0,
      topCoins: topPerformers.length > 0 ? Math.max(...topPerformers.map(entry => entry.coins)) : 0,
      totalCoinsInCirculation: totalCoins,
      lastUpdated: Date.now()
    };
    // Update cache
    const cacheData: LeaderboardCache = {
      entries: topPerformers,
      stats,
      lastUpdated: Date.now()
    };
    await adminDb.ref('leaderboard/cache').set(cacheData);
    console.log('[LEADERBOARD_RTDB_ADMIN] Updated leaderboard cache');
  } catch (error) {
    console.error('Failed to update leaderboard cache (admin):', error);
    throw error;
  }
}