"use client";

import React, { useState, useEffect, useContext } from 'react';
import { Trophy, Medal, Award, Loader2, Clock, User, Percent } from 'lucide-react';
import { getLiveTestLeaderboard, getUserPositionInLeaderboard, LiveTestLeaderboardEntry } from '@/lib/apis/live-test-leaderboard';
import { bloxat } from '@/components/fonts';
import { AuthContext } from '@/lib/auth/auth-provider';
import { InfoCard } from '@/components/shared/data/InfoCard';

interface LiveTestLeaderboardProps {
  testId: string;
  leaderboardData?: LiveTestLeaderboardEntry[];
  userPosition?: { rank: number; percentile: number; totalParticipants: number } | null;
}

const LiveTestLeaderboard: React.FC<LiveTestLeaderboardProps> = ({ testId, leaderboardData, userPosition }) => {
  const [leaderboard, setLeaderboard] = useState<LiveTestLeaderboardEntry[]>(leaderboardData || []);
  const [userPos, setUserPos] = useState<{ rank: number; percentile: number; totalParticipants: number } | null>(userPosition || null);
  const [loading, setLoading] = useState(!leaderboardData);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  useEffect(() => {
    // If data is already provided, don't fetch again
    if (leaderboardData) {
      setLeaderboard(leaderboardData);
      setUserPos(userPosition || null);
      setLoading(false);
      return;
    }
    
    // Only fetch if no data was provided
    loadLeaderboard();
  }, [testId, leaderboardData, userPosition]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const leaderboardResponse = await getLiveTestLeaderboard(testId);
      if (leaderboardResponse.success && leaderboardResponse.data) {
        setLeaderboard(leaderboardResponse.data);
        
        // Get user position if logged in
        if (user?.uid) {
          const positionResponse = await getUserPositionInLeaderboard(testId, user.uid);
          if (positionResponse.success && positionResponse.data) {
            setUserPos(positionResponse.data);
          }
        }
      } else {
        setError(leaderboardResponse.error || 'Failed to load leaderboard');
      }
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-400 text-base md:text-lg" />;
      case 2:
        return <Medal className="text-gray-400 text-base md:text-lg" />;
      case 3:
        return <Award className="text-amber-600 text-base md:text-lg" />;
      default:
        return <span className={`text-tathir-cream font-bold text-xs md:text-sm ${bloxat.className}`}>#{rank}</span>;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0:00";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRankSuffix = (rank: number) => {
    if (rank % 10 === 1 && rank % 100 !== 11) return 'st';
    if (rank % 10 === 2 && rank % 100 !== 12) return 'nd';
    if (rank % 10 === 3 && rank % 100 !== 13) return 'rd';
    return 'th';
  };

  if (loading) {
    return (
      <InfoCard
        title="Loading Leaderboard"
        variant="admin"
        icon={<Loader2 className="animate-spin text-lg md:text-xl text-tathir-dark-green" />}
        content={
          <div className="flex items-center justify-center py-3 md:py-4">
            <span className="text-tathir-brown text-sm md:text-base">Loading leaderboard...</span>
          </div>
        }
      />
    );
  }

  if (error) {
    return (
      <InfoCard
        title="Unable to load leaderboard"
        variant="admin"
        description={error}
        icon={<Trophy className="text-tathir-dark-green opacity-50" />}
      />
    );
  }

  return (
      <InfoCard
        title="Live Test Leaderboard"
        variant="admin"
        icon={<Trophy className="text-yellow-400" />}
        content={
          <div className="w-full max-w-full overflow-hidden">
            {/* User Position (if available) */}
            {userPos && (
            <div className="bg-tathir-brown/30 border border-tathir-brown rounded-lg p-3 md:p-4 mb-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getRankIcon(userPos.rank)}
                    <span className={`text-tathir-dark-green font-bold text-sm md:text-base truncate ${bloxat.className}`}>
                      Your Position: {userPos.rank}{getRankSuffix(userPos.rank)}
                    </span>
                  </div>
                </div>
                <div className="text-tathir-brown text-sm self-start sm:self-auto flex-shrink-0">
                  Top {userPos.percentile}%
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {leaderboard.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <Trophy className="text-tathir-brown/50 text-3xl md:text-4xl mx-auto mb-3 md:mb-4" />
              <p className="text-tathir-brown text-base md:text-lg">No participants yet</p>
            </div>
          ) : (
            <div className="space-y-3 w-full">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`p-3 md:p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md w-full max-w-full
                             ${entry.userId === user?.uid 
                               ? 'bg-tathir-maroon/30 border-tathir-maroon' 
                               : 'bg-tathir-cream/10 border-tathir-brown hover:bg-tathir-cream/20'}`}
                >
                  {/* Mobile Layout */}
                  <div className="block md:hidden">
                    {/* Rank and User Info - Stack vertically on very small screens */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          {getRankIcon(entry.rank || index + 1)}
                        </div>
                        <User className="text-tathir-brown text-sm flex-shrink-0" />
                        <span className={`text-tathir-dark-green font-semibold text-sm flex-1 min-w-0 ${bloxat.className}`}>
                          {entry.displayName || 'Anonymous'}
                        </span>
                      </div>
                      {entry.userId === user?.uid && (
                        <div className="flex justify-center">
                          <span className="text-xs bg-tathir-maroon text-tathir-cream px-3 py-1 rounded">
                            You
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats - Mobile Grid - Simplified */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-tathir-cream/20 rounded-lg p-2 text-center">
                        <div className="text-tathir-dark-green font-bold text-base leading-tight">
                          {entry.totalCorrect}
                        </div>
                        <div className="text-tathir-brown text-xs leading-tight">
                          Correct
                        </div>
                      </div>
                      <div className="bg-tathir-cream/20 rounded-lg p-2 text-center">
                        <div className="text-tathir-dark-green font-bold text-sm leading-tight">
                          {entry.accuracy.toFixed(1)}%
                        </div>
                        <div className="text-tathir-brown text-xs leading-tight">
                          Accuracy
                        </div>
                      </div>
                      <div className="bg-tathir-cream/20 rounded-lg p-2 text-center">
                        <div className="text-tathir-dark-green font-bold text-sm leading-tight">
                          {formatTime(entry.timeTaken)}
                        </div>
                        <div className="text-tathir-brown text-xs leading-tight">
                          Time
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex md:items-center md:justify-between min-w-0">
                    {/* Rank and User Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
                        {getRankIcon(entry.rank || index + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <User className="text-tathir-brown text-sm flex-shrink-0" />
                          <span className={`text-tathir-dark-green font-semibold truncate ${bloxat.className}`}>
                            {entry.displayName || 'Anonymous'}
                          </span>
                          {entry.userId === user?.uid && (
                            <span className="text-xs bg-tathir-maroon text-tathir-cream px-2 py-1 rounded flex-shrink-0 ml-2">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats - Desktop Row */}
                    <div className="flex items-center gap-4 lg:gap-6 text-sm flex-shrink-0">
                      <div className="text-center">
                        <div className="text-tathir-dark-green font-bold text-lg">
                          {entry.totalCorrect}
                        </div>
                        <div className="text-tathir-brown text-xs">
                          Correct
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-tathir-dark-green font-bold">
                          <Percent className="text-xs" />
                          {entry.accuracy.toFixed(1)}
                        </div>
                        <div className="text-tathir-brown text-xs">
                          Accuracy
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-tathir-dark-green font-bold">
                          <Clock className="text-xs" />
                          {formatTime(entry.timeTaken)}
                        </div>
                        <div className="text-tathir-brown text-xs">
                          Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-tathir-brown/30">
            <div className="text-center text-tathir-brown text-xs md:text-sm">
              <div className="mb-1 md:mb-0">
                {leaderboard.length} participants
              </div>
              <div className="hidden md:block">
                • Ranked by: Correct Answers → Accuracy → Time Taken
              </div>
              <div className="block md:hidden text-xs">
                Ranked by: Correct → Accuracy → Time
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default LiveTestLeaderboard;
