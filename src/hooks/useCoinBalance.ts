import { useState, useEffect, useRef } from 'react';
import { ref, onValue, off, DatabaseReference } from 'firebase/database';
import { rtdb } from '@/lib/firebase/firebase';
import { CoinUserData } from '@/lib/apis/coin-rtdb';

interface UseCoinBalanceReturn {
  coinBalance: number;
  coinData: CoinUserData | null;
  loading: boolean;
  error: string | null;
  connected: boolean;
}

/**
 * React hook for real-time coin balance updates
 * @param userId - The user ID to track coins for
 * @param enabled - Whether the hook should be active (default: true)
 */
export function useCoinBalance(
  userId: string | null | undefined, 
  enabled: boolean = true
): UseCoinBalanceReturn {

  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [coinData, setCoinData] = useState<CoinUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  
  const listenerRef = useRef<DatabaseReference | null>(null);
  const connectionRef = useRef<DatabaseReference | null>(null);

  useEffect(() => {

    if (!userId || !enabled) {

      setLoading(false);
      setCoinBalance(0);
      setCoinData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Set up coin data listener
      const userCoinRef = ref(rtdb, `coins/${userId}`);
      listenerRef.current = userCoinRef;

      const unsubscribe = onValue(
        userCoinRef,
        (snapshot) => {

          setLoading(false);
          
          if (snapshot.exists()) {
            const data = snapshot.val() as CoinUserData;
            setCoinData(data);
            setCoinBalance(data.coins || 0);
            setError(null);

          } else {
            // User doesn't exist in RTDB yet

            setCoinData(null);
            setCoinBalance(0);
            setError(null);
          }
        },
        (error) => {
          console.error('❌ Coin balance listener error:', error);
          setLoading(false);
          setError('Failed to load coin balance');
          setCoinBalance(0);
          setCoinData(null);
        }
      );

      // Set up connection status listener
      const connectedRef = ref(rtdb, '.info/connected');
      connectionRef.current = connectedRef;
      
      const connectionUnsubscribe = onValue(connectedRef, (snapshot) => {
        const isConnected = snapshot.val() === true;

        setConnected(isConnected);
      });

      // Cleanup function
      return () => {

        if (listenerRef.current) {
          off(listenerRef.current);
        }
        if (connectionRef.current) {
          off(connectionRef.current);
        }
        unsubscribe();
        connectionUnsubscribe();
      };

    } catch (err) {
      console.error('❌ Error setting up coin balance listener:', err);
      setLoading(false);
      setError('Failed to initialize coin balance tracking');
    }
  }, [userId, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        off(listenerRef.current);
      }
      if (connectionRef.current) {
        off(connectionRef.current);
      }
    };
  }, []);

  return {
    coinBalance,
    coinData,
    loading,
    error,
    connected
  };
}

/**
 * Hook for tracking multiple users' coin balances (useful for leaderboards)
 */
export function useMultipleUserCoins(
  userIds: string[], 
  enabled: boolean = true
): {
  coinData: Record<string, CoinUserData>;
  loading: boolean;
  error: string | null;
  connected: boolean;
} {
  const [coinData, setCoinData] = useState<Record<string, CoinUserData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  
  const listenersRef = useRef<Record<string, DatabaseReference>>({});
  const connectionRef = useRef<DatabaseReference | null>(null);

  useEffect(() => {
    if (!enabled || userIds.length === 0) {
      setLoading(false);
      setCoinData({});
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribeFunctions: (() => void)[] = [];

    try {
      // Set up listeners for each user
      userIds.forEach(userId => {
        const userCoinRef = ref(rtdb, `coins/${userId}`);
        listenersRef.current[userId] = userCoinRef;

        const unsubscribe = onValue(
          userCoinRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val() as CoinUserData;
              setCoinData(prev => ({
                ...prev,
                [userId]: data
              }));
            } else {
              setCoinData(prev => {
                const newData = { ...prev };
                delete newData[userId];
                return newData;
              });
            }
          },
          (error) => {
            console.error(`Coin balance listener error for user ${userId}:`, error);
            setError(`Failed to load coin balance for some users`);
          }
        );

        unsubscribeFunctions.push(unsubscribe);
      });

      // Set up connection status listener
      const connectedRef = ref(rtdb, '.info/connected');
      connectionRef.current = connectedRef;
      
      const connectionUnsubscribe = onValue(connectedRef, (snapshot) => {
        setConnected(snapshot.val() === true);
      });

      unsubscribeFunctions.push(connectionUnsubscribe);

      // Mark loading as complete after initial setup
      setLoading(false);

      // Cleanup function
      return () => {
        Object.values(listenersRef.current).forEach(ref => {
          if (ref) off(ref);
        });
        if (connectionRef.current) {
          off(connectionRef.current);
        }
        unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
      };

    } catch (err) {
      console.error('Error setting up multiple coin balance listeners:', err);
      setLoading(false);
      setError('Failed to initialize coin balance tracking');
    }
  }, [userIds.join(','), enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(listenersRef.current).forEach(ref => {
        if (ref) off(ref);
      });
      if (connectionRef.current) {
        off(connectionRef.current);
      }
    };
  }, []);

  return {
    coinData,
    loading,
    error,
    connected
  };
}

/**
 * Hook for real-time coin leaderboard data
 */
export function useCoinLeaderboard(
  limit: number = 50,
  enabled: boolean = true
): {
  leaderboard: CoinUserData[];
  loading: boolean;
  error: string | null;
  connected: boolean;
} {
  const [leaderboard, setLeaderboard] = useState<CoinUserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  
  const listenerRef = useRef<DatabaseReference | null>(null);
  const connectionRef = useRef<DatabaseReference | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setLeaderboard([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Listen to the entire coins collection and sort client-side
      // Note: In a production app with many users, you'd want to implement
      // server-side sorting and pagination
      const coinsRef = ref(rtdb, 'coins');
      listenerRef.current = coinsRef;

      const unsubscribe = onValue(
        coinsRef,
        (snapshot) => {
          setLoading(false);
          
          if (snapshot.exists()) {
            const data = snapshot.val();
            const users: CoinUserData[] = Object.values(data);
            
            // Sort by coins (descending) and take top N
            const sortedUsers = users
              .sort((a, b) => (b.coins || 0) - (a.coins || 0))
              .slice(0, limit)
              .map((user, index) => ({
                ...user,
                rank: index + 1
              }));
            
            setLeaderboard(sortedUsers);
            setError(null);
          } else {
            setLeaderboard([]);
            setError(null);
          }
        },
        (error) => {
          console.error('Coin leaderboard listener error:', error);
          setLoading(false);
          setError('Failed to load coin leaderboard');
          setLeaderboard([]);
        }
      );

      // Set up connection status listener
      const connectedRef = ref(rtdb, '.info/connected');
      connectionRef.current = connectedRef;
      
      const connectionUnsubscribe = onValue(connectedRef, (snapshot) => {
        setConnected(snapshot.val() === true);
      });

      // Cleanup function
      return () => {
        if (listenerRef.current) {
          off(listenerRef.current);
        }
        if (connectionRef.current) {
          off(connectionRef.current);
        }
        unsubscribe();
        connectionUnsubscribe();
      };

    } catch (err) {
      console.error('Error setting up coin leaderboard listener:', err);
      setLoading(false);
      setError('Failed to initialize coin leaderboard tracking');
    }
  }, [limit, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        off(listenerRef.current);
      }
      if (connectionRef.current) {
        off(connectionRef.current);
      }
    };
  }, []);

  return {
    leaderboard,
    loading,
    error,
    connected
  };
}
