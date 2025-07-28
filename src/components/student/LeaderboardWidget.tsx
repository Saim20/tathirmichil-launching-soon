"use client";

import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaAward, FaSpinner, FaEye, FaCoins } from 'react-icons/fa';
import Link from 'next/link';
import { subscribeToLeaderboard, CoinLeaderboardEntry } from '@/lib/apis/leaderboard-rtdb';
import { bloxat } from '@/components/fonts';

const LeaderboardWidget: React.FC = () => {
  const [topPerformers, setTopPerformers] = useState<CoinLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setupRealtimeSubscription = () => {
    setLoading(true);
    setError(null);

    // Use real-time subscription for the widget
    const unsubscribe = subscribeToLeaderboard(
      (data) => {
        // Only keep the fields needed for the widget
        const transformedEntries: CoinLeaderboardEntry[] = data.entries.slice(0, 5).map(entry => ({
          id: entry.id,
          userId: entry.userId,
          displayName: entry.displayName,
          profilePictureUrl: entry.profilePictureUrl,
          batch: entry.batch,
          coins: entry.coins,
          rank: entry.rank,
          badge: entry.badge
        }));

        setTopPerformers(transformedEntries);
        setLoading(false);
      },
      5 // Only get top 5
    );

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = setupRealtimeSubscription();
    return () => {
      unsubscribe();
    };
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="text-yellow-400 text-lg" />;
      case 2:
        return <FaMedal className="text-gray-400 text-lg" />;
      case 3:
        return <FaAward className="text-amber-600 text-lg" />;
      default:
        return <span className={`text-tathir-cream font-bold text-sm ${bloxat.className}`}>#{rank}</span>;
    }
  };


  if (loading) {
    return (
      <div 
        className="bg-tathir-dark-green border-2 border-tathir-maroon rounded-lg p-6"
        style={{ boxShadow: '4px 4px 0 0 rgb(from var(--color-tathir-maroon) r g b / 0.5)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <FaCoins className="text-yellow-400 text-2xl" />
          <h3 className={`text-xl font-bold text-tathir-cream ${bloxat.className}`}>
            Top Earners
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-tathir-cream">
            <FaSpinner className="animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-tathir-dark-green border-2 border-tathir-maroon rounded-lg p-6 
                     shadow-[4px_4px_0_0_rgba(90,58,43,0.5)]">
        <div className="flex items-center gap-3 mb-4">
          <FaCoins className="text-yellow-400 text-2xl" />
          <h3 className={`text-xl font-bold text-tathir-cream ${bloxat.className}`}>
            Top Earners
          </h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-300">{error}</p>
          <button 
            onClick={setupRealtimeSubscription}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-tathir-dark-green border-2 border-tathir-maroon rounded-lg p-4 \
                   shadow-[4px_4px_0_0_rgba(90,58,43,0.5)] hover:shadow-[6px_6px_0_0_rgba(90,58,43,0.5)]\
                   transition-all duration-300 w-full max-w-xl mx-auto sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex items-center gap-3">
          <FaCoins className="text-yellow-400 text-2xl sm:text-3xl" />
          <h3 className={`text-lg sm:text-xl font-bold text-tathir-cream ${bloxat.className}`}>
            Top Earners
          </h3>
        </div>
        <Link 
          href="/student/leaderboards"
          className="text-tathir-light-green hover:text-tathir-cream transition-colors \
                     flex items-center gap-1 text-xs sm:text-sm font-medium"
        >
          <FaEye />
          View All
        </Link>
      </div>

      {/* Top Performers List */}
      {topPerformers.length === 0 ? (
        <div className="text-center py-6">
          <FaCoins className="text-tathir-cream/50 text-3xl mx-auto mb-2" />
          <p className="text-tathir-cream-light">No recent coin data available</p>
          <p className="text-tathir-cream/70 text-xs sm:text-sm mt-1">Earn coins to see rankings!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topPerformers.map((performer, index) => (
            <div
              key={performer.id}
              className="flex flex-col sm:flex-row items-center justify-between p-3 bg-tathir-cream/5 rounded-lg \
                         border border-tathir-brown/30 hover:bg-tathir-cream/10 transition-colors gap-2"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {getRankIcon(performer.rank)}
                <div className="w-8 h-8 rounded-full bg-tathir-cream flex items-center justify-center overflow-hidden">
                  {performer.profilePictureUrl ? (
                    <img 
                      src={performer.profilePictureUrl} 
                      alt={performer.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-tathir-dark-green font-bold text-xs">
                      {performer.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-tathir-cream font-medium text-xs sm:text-sm">
                    {performer.displayName}
                  </div>
                  <div className="text-tathir-cream-light text-xs">
                    {performer.batch || 'No Batch'}
                  </div>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto">
                <div className={`text-tathir-light-green font-bold text-xs sm:text-sm ${bloxat.className}`}>
                  {performer.coins.toLocaleString()}
                </div>
                <div className="text-tathir-cream-light text-xs">
                  Michilcoins
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-tathir-brown/30">
        <Link
          href="/student/leaderboards"
          className="block w-full text-center py-2 bg-tathir-cream/10 text-tathir-cream \
                     rounded-lg hover:bg-tathir-cream/20 transition-colors border border-tathir-cream/30\
                     hover:border-tathir-cream/50 font-medium text-xs sm:text-sm"
        >
          View Full Leaderboard
        </Link>
      </div>
    </div>
  );
};

export default LeaderboardWidget;
