"use client";

import React, { useState, useEffect, useContext } from 'react';
import { 
  FaTrophy, 
  FaMedal, 
  FaAward, 
  FaUsers, 
  FaFilter, 
  FaSpinner,
  FaChartLine,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCoins
} from 'react-icons/fa';
import { AuthContext } from '@/lib/auth/auth-provider';
import { 
  getCoinLeaderboardRealtime, 
  getStudentCountRealtime,
  subscribeToLeaderboard,
  CoinLeaderboardEntry,
  CoinLeaderboardStats 
} from '@/lib/apis/leaderboard-rtdb';
import { bloxat } from '@/components/fonts';

interface LeaderboardComponentProps {
  initialTestId?: string;
  maxEntries?: number;
}

type SortField = 'rank' | 'coins';
type SortDirection = 'asc' | 'desc';

const Leaderboard: React.FC<LeaderboardComponentProps> = ({
  initialTestId,
  maxEntries = 50
}) => {
  const authContext = useContext(AuthContext);
  const currentUserId = authContext?.user?.uid;

  const [entries, setEntries] = useState<CoinLeaderboardEntry[]>([]);
  const [stats, setStats] = useState<CoinLeaderboardStats | null>(null);
  const [availableTests, setAvailableTests] = useState<Array<{ id: string; participantCount: number }>>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>(initialTestId || 'all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Real-time subscription for leaderboard updates
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToLeaderboard(
      (data) => {
        // Transform the real-time data to match our interface
        const transformedEntries: CoinLeaderboardEntry[] = data.entries.map(entry => ({
          id: entry.id,
          userId: entry.userId,
          displayName: entry.displayName,
          profilePictureUrl: entry.profilePictureUrl,
          coins: entry.coins,
          rank: entry.rank,
          badge: entry.badge,
          batch: entry.batch
        }));

        const transformedStats: CoinLeaderboardStats = {
          totalParticipants: data.stats.totalParticipants,
          averageCoins: data.stats.averageCoins,
          topCoins: data.stats.topCoins,
          totalCoinsInCirculation: data.stats.totalCoinsInCirculation,
          lastUpdated: data.stats.lastUpdated
        };

        setEntries(transformedEntries);
        setStats(transformedStats);
        setLoading(false);
      },
      maxEntries
    );

    return () => {
      unsubscribe();
    };
  }, [maxEntries]);

  // Load available tests on mount
  useEffect(() => {
    loadAvailableTests();
  }, []);

  const loadAvailableTests = async () => {
    try {
      const response = await getStudentCountRealtime();
      if (response.success && response.data) {
        // For coin leaderboard, we don't need test filtering
        // but we can show total student count
        setAvailableTests([{ id: 'all', participantCount: response.data }]);
      }
    } catch (err) {
      console.error('Failed to load student count:', err);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    let aValue, bValue;
    switch (sortField) {
      case 'rank':
        aValue = a.rank;
        bValue = b.rank;
        break;
      case 'coins':
        aValue = a.coins;
        bValue = b.coins;
        break;
      default:
        return 0;
    }
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="text-yellow-400 text-2xl" />;
      case 2:
        return <FaMedal className="text-gray-400 text-2xl" />;
      case 3:
        return <FaAward className="text-amber-600 text-2xl" />;
      default:
        return <span className={`text-tathir-cream font-bold text-xl ${bloxat.className}`}>#{rank}</span>;
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <FaSort className="opacity-50" />;
    }
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const currentUserEntry = sortedEntries.find(entry => entry.userId === currentUserId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-tathir-cream">
          <FaSpinner className="animate-spin text-2xl" />
          <span className="text-lg font-medium">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border-2 border-red-600 rounded-lg p-6 text-center">
        <p className="text-red-300 text-lg">{error}</p>
        <button 
          onClick={() => setLoading(true)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-0">
        <h2 className={`text-3xl font-bold text-tathir-brown ${bloxat.className}`}>
          Coin Leaderboard
        </h2>
        <p className="text-tathir-cream-light text-base">
          See who has earned the most Michilcoins!
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-tathir-dark-green border-2 border-tathir-maroon rounded-lg p-4 text-center
                         shadow-[4px_4px_0_0_rgba(90,58,43,0.5)] hover:shadow-[6px_6px_0_0_rgba(90,58,43,0.5)] 
                         transition-all duration-300">
            <FaUsers className="text-tathir-cream text-2xl mx-auto mb-2" />
            <div className={`text-2xl font-bold text-tathir-cream ${bloxat.className}`}>
              {stats.totalParticipants}
            </div>
            <div className="text-sm text-tathir-cream-light">Total Students</div>
          </div>
          
          <div className="bg-tathir-dark-green border-2 border-tathir-maroon rounded-lg p-4 text-center
                         shadow-[4px_4px_0_0_rgba(90,58,43,0.5)] hover:shadow-[6px_6px_0_0_rgba(90,58,43,0.5)] 
                         transition-all duration-300">
            <FaCoins className="text-yellow-400 text-2xl mx-auto mb-2" />
            <div className={`text-2xl font-bold text-tathir-cream ${bloxat.className}`}>
              {stats.averageCoins}
            </div>
            <div className="text-sm text-tathir-cream-light">Average Coins</div>
          </div>
          
          <div className="bg-tathir-dark-green border-2 border-tathir-maroon rounded-lg p-4 text-center
                         shadow-[4px_4px_0_0_rgba(90,58,43,0.5)] hover:shadow-[6px_6px_0_0_rgba(90,58,43,0.5)] 
                         transition-all duration-300">
            <FaTrophy className="text-yellow-400 text-2xl mx-auto mb-2" />
            <div className={`text-2xl font-bold text-tathir-cream ${bloxat.className}`}>
              {stats.topCoins}
            </div>
            <div className="text-sm text-tathir-cream-light">Top Coins</div>
          </div>
          
          <div className="bg-tathir-dark-green border-2 border-tathir-maroon rounded-lg p-4 text-center
                         shadow-[4px_4px_0_0_rgba(90,58,43,0.5)] hover:shadow-[6px_6px_0_0_rgba(90,58,43,0.5)] 
                         transition-all duration-300">
            <FaChartLine className="text-tathir-cream text-2xl mx-auto mb-2" />
            <div className={`text-2xl font-bold text-tathir-cream ${bloxat.className}`}>
              {stats.totalCoinsInCirculation.toLocaleString()}
            </div>
            <div className="text-sm text-tathir-cream-light">Total Circulation</div>
          </div>
        </div>
      )}

      {/* Current User Highlight */}
      {currentUserEntry && (
        <div className="bg-tathir-dark-green border-2 border-tathir-light-green rounded-lg p-4 \
                       shadow-[4px_4px_0_0_rgba(110,162,74,0.5)] flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 mb-2 sm:mb-0">
            <FaAward className="text-tathir-light-green text-xl" />
            <span className="text-tathir-cream font-bold text-lg">Your Position</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getRankIcon(currentUserEntry.rank)}
              <div className="w-10 h-10 rounded-full bg-tathir-cream flex items-center justify-center overflow-hidden">
                {currentUserEntry.profilePictureUrl ? (
                  <img 
                    src={currentUserEntry.profilePictureUrl} 
                    alt={currentUserEntry.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-tathir-dark-green font-bold text-sm">
                    {currentUserEntry.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="text-tathir-cream font-bold">{currentUserEntry.displayName}</div>
                <div className="text-tathir-cream-light text-sm">
                  {currentUserEntry.coins} Michilcoins
                  {currentUserEntry.badge && (
                    <span className="ml-2 text-xs bg-tathir-light-green text-tathir-dark-green px-2 py-1 rounded">
                      {currentUserEntry.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right ml-2">
              <div className={`text-xl font-bold text-tathir-light-green ${bloxat.className}`}>
                #{currentUserEntry.rank}
              </div>
              <div className="text-tathir-cream-light text-sm">Rank</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-tathir-dark-green border-2 border-tathir-maroon rounded-lg shadow-[4px_4px_0_0_rgba(90,58,43,0.5)] w-full">
        {/* Table Header */}
        <div className="hidden md:block bg-tathir-maroon px-8 py-6 border-b-2 border-tathir-brown w-full">
          <div className="grid grid-cols-[80px_1fr_180px_180px] gap-8 items-center text-base w-full">
            <div className="text-center">
              <button
                onClick={() => handleSort('rank')}
                className="flex items-center gap-1 text-tathir-cream font-bold hover:text-tathir-light-green transition-colors"
              >
                Rank {getSortIcon('rank')}
              </button>
            </div>
            <div className="text-tathir-cream font-bold">Player</div>
            <div className="text-center">
              <button
                onClick={() => handleSort('coins')}
                className="flex items-center gap-1 text-tathir-cream font-bold hover:text-tathir-light-green transition-colors"
              >
                Coins {getSortIcon('coins')}
              </button>
            </div>
            <div className="text-center text-tathir-cream font-bold">Batch</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="w-full">
          {sortedEntries.length === 0 ? (
            <div className="p-8 text-center">
              <FaTrophy className="text-tathir-cream text-4xl mx-auto mb-4" />
              <p className="text-tathir-cream-light text-lg">No leaderboard data available</p>
              <p className="text-tathir-cream text-sm mt-2">
                Earn coins to see your ranking!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`w-full bg-tathir-dark-green rounded-lg border-b border-tathir-brown hover:bg-tathir-cream/5 transition-colors px-2 py-3 md:px-8 md:py-6 ${entry.userId === currentUserId ? 'bg-tathir-light-green/10' : ''}`}
                >
                  {/* Mobile layout: stacked */}
                  <div className="flex flex-col md:hidden gap-2 p-2">
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                      <div className="w-8 h-8 rounded-full bg-tathir-cream flex items-center justify-center overflow-hidden">
                        {entry.profilePictureUrl ? (
                          <img 
                            src={entry.profilePictureUrl} 
                            alt={entry.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-tathir-dark-green font-bold text-sm">
                            {entry.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-tathir-cream font-bold">{entry.displayName}</span>
                        {entry.userId === currentUserId && (
                          <span className="ml-2 text-xs bg-tathir-light-green text-tathir-dark-green px-2 py-1 rounded">YOU</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs ml-11">
                      <span className="font-bold text-tathir-cream">{entry.coins.toLocaleString()} <span className="text-tathir-cream-light">coins</span></span>
                      <span className={`px-2 py-1 rounded-full font-medium ${entry.batch ? 'bg-tathir-light-green text-white border border-tathir-light-green' : 'bg-tathir-brown text-tathir-cream-light border border-tathir-brown'}`}>{entry.batch || 'No Batch'}</span>
                    </div>
                  </div>
                  {/* Desktop layout: grid */}
                  <div className="hidden md:grid grid-cols-[80px_1fr_180px_180px] gap-8 items-center w-full">
                    <div className="text-center">{getRankIcon(entry.rank)}</div>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-tathir-cream flex items-center justify-center overflow-hidden">
                          {entry.profilePictureUrl ? (
                            <img 
                              src={entry.profilePictureUrl} 
                              alt={entry.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-tathir-dark-green font-bold text-sm">
                              {entry.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className={`text-tathir-cream font-bold ${entry.userId === currentUserId ? 'text-tathir-light-green' : ''}`}>
                            {entry.displayName}
                            {entry.userId === currentUserId && (
                              <span className="ml-2 text-xs bg-tathir-light-green text-tathir-dark-green px-2 py-1 rounded">YOU</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold text-tathir-cream ${bloxat.className}`}>{entry.coins.toLocaleString()}</div>
                      <div className="text-tathir-cream-light text-xs sm:text-sm">Michilcoins</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${entry.batch ? 'bg-tathir-light-green text-white border border-tathir-light-green' : 'bg-tathir-brown text-tathir-cream-light border border-tathir-brown'}`}>{entry.batch || 'No Batch'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Load More Button (if needed) */}
      {entries.length >= maxEntries && (
        <div className="text-center">
          <button
            onClick={() => {
              // Implement load more functionality
              console.log('Load more entries');
            }}
            className="px-6 py-3 bg-tathir-cream text-tathir-dark-green font-bold rounded-lg 
                     border-2 border-tathir-maroon hover:bg-tathir-light-green hover:text-tathir-cream
                     transition-all duration-300 shadow-[4px_4px_0_0_rgba(90,58,43,0.5)]
                     hover:shadow-[6px_6px_0_0_rgba(90,58,43,0.5)] active:scale-95"
          >
            Load More Results
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
