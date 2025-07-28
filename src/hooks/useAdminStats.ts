import { useState, useEffect, useCallback } from 'react';
import { getCoinStatsRealtime } from '@/lib/apis/leaderboard-rtdb';
import { CoinLeaderboardStats } from '@/lib/apis/leaderboard-rtdb';
import { UserProfile } from '@/lib/apis/users';
import { isValidDate, toSafeDate } from '@/lib/utils/date-utils';

export interface AdminDashboardStats {
  // User Statistics
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  
  // User Categories
  subscribedUsers: number;
  passedUsers: number;
  adminUsers: number;
  studentsWithGrades: number;
  
  // Test Performance
  usersWithTests: number;
  averageAccuracy: number;
  averageConfidence: number;
  totalTestsTaken: number;
  
  // Approval Status
  pendingApprovals: number;
  acceptedUsers: number;
  rejectedUsers: number;
  
  // Coin Statistics (from RTDB)
  coinStats?: CoinLeaderboardStats;
}

interface UseAdminStatsReturn {
  stats: AdminDashboardStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAdminStats(users: UserProfile[]): UseAdminStatsReturn {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = useCallback(async () => {
    if (users.length === 0) {
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate date boundaries
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate user statistics
      let totalUsers = users.length;
      let activeUsers = 0;
      let newUsersToday = 0;
      let newUsersThisWeek = 0;
      let newUsersThisMonth = 0;
      let subscribedUsers = 0;
      let passedUsers = 0;
      let adminUsers = 0;
      let studentsWithGrades = 0;
      let usersWithTests = 0;
      let totalAccuracy = 0;
      let totalConfidence = 0;
      let totalTestsTaken = 0;
      let accuracyCount = 0;
      let confidenceCount = 0;
      let pendingApprovals = 0;
      let acceptedUsers = 0;
      let rejectedUsers = 0;

      users.forEach(user => {
        // Activity (users with updated profile or tests taken)
        if (user.totalTestsTaken && user.totalTestsTaken > 0) {
          activeUsers++;
        }

        // New user calculations
        if (user.updatedAt) {
          const userDate = toSafeDate(user.updatedAt);
          if (userDate) {
            if (userDate >= todayStart) newUsersToday++;
            if (userDate >= weekStart) newUsersThisWeek++;
            if (userDate >= monthStart) newUsersThisMonth++;
          }
        }

        // User categories
        if (user.isSubscribed) subscribedUsers++;
        if (user.isPassed) passedUsers++;
        if (user.role === 'admin') adminUsers++;
        if (user.grade) studentsWithGrades++;

        // Test performance
        if (user.totalTestsTaken && user.totalTestsTaken > 0) {
          usersWithTests++;
          totalTestsTaken += user.totalTestsTaken;
        }
        
        if (user.accuracy && user.accuracy > 0) {
          totalAccuracy += user.accuracy;
          accuracyCount++;
        }
        
        if (user.confidence && user.confidence > 0) {
          totalConfidence += user.confidence;
          confidenceCount++;
        }

        // Approval status
        const approvalStatus = user.approvalStatus;
        if (!approvalStatus || approvalStatus === 'unsure') {
          pendingApprovals++;
        } else if (approvalStatus === 'accepted') {
          acceptedUsers++;
        } else if (approvalStatus === 'rejected') {
          rejectedUsers++;
        }
      });

      // Get coin statistics from RTDB
      let coinStats: CoinLeaderboardStats | undefined;
      try {
        const coinResponse = await getCoinStatsRealtime();
        if (coinResponse.success && coinResponse.data) {
          coinStats = coinResponse.data;
        }
      } catch (coinError) {
        console.warn('Failed to fetch coin statistics:', coinError);
      }

      const calculatedStats: AdminDashboardStats = {
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        subscribedUsers,
        passedUsers,
        adminUsers,
        studentsWithGrades,
        usersWithTests,
        averageAccuracy: accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0,
        averageConfidence: confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0,
        totalTestsTaken,
        pendingApprovals,
        acceptedUsers,
        rejectedUsers,
        coinStats
      };

      setStats(calculatedStats);
    } catch (err) {
      console.error('Error calculating admin stats:', err);
      setError('Failed to calculate statistics');
    } finally {
      setLoading(false);
    }
  }, [users]);

  const refresh = useCallback(async () => {
    await calculateStats();
  }, [calculateStats]);

  // Calculate stats when users change
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return {
    stats,
    loading,
    error,
    refresh
  };
}
