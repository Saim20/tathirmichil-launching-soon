import { ref, get, set, update, runTransaction, serverTimestamp, DatabaseReference } from 'firebase/database';
import { collection, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { rtdb } from '../firebase/firebase';
import { db } from '../firebase/firebase';
import { ApiResponse, safeApiCall } from './base';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface CoinUserData {
  uid: string;
  displayName: string;
  profilePictureUrl?: string;
  coins: number;
  rank?: number;
  batch?: string; // Only batch, no lastUpdated or email
}

export interface CoinUpdate {
  userId: string;
  amount: number;
  operation: 'add' | 'subtract' | 'set';
  reason?: string;
  userInfo?: {
    displayName?: string;
    profilePictureUrl?: string;
    batch?: string;
  };
}

export interface CoinTransaction {
  userId: string;
  amount: number;
  operation: 'add' | 'subtract' | 'set';
  reason: string;
  timestamp: Date;
  balanceBefore: number;
  balanceAfter: number;
}

// ============================================================================
// CLIENT-SIDE FUNCTIONS (for React components)
// ============================================================================

/**
 * Get user's coin balance from RTDB
 */
export async function getUserCoinBalance(userId: string): Promise<ApiResponse<number>> {
  return safeApiCall(async () => {
    const coinRef = ref(rtdb, `coins/${userId}/coins`);
    const snapshot = await get(coinRef);
    return snapshot.exists() ? snapshot.val() : 0;
  }, 'Failed to get user coin balance');
}

/**
 * Get complete coin data for a user
 */
export async function getUserCoinData(userId: string): Promise<ApiResponse<CoinUserData | null>> {
  return safeApiCall(async () => {
    const userRef = ref(rtdb, `coins/${userId}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return snapshot.val() as CoinUserData;
  }, 'Failed to get user coin data');
}

/**
 * Initialize user coins in RTDB (client-side)
 */
export async function initializeUserCoins(
  userId: string, 
  displayName: string, 
  profilePictureUrl?: string,
  batch?: string
): Promise<ApiResponse<void>> {
  return safeApiCall(async () => {
    const userRef = ref(rtdb, `coins/${userId}`);
    
    // Check if user already exists
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      // Update display name, profile picture, and batch if provided
      const updates: Partial<CoinUserData> = {
        displayName,
      };
      
      if (profilePictureUrl) {
        updates.profilePictureUrl = profilePictureUrl;
      }
      
      if (batch) {
        updates.batch = batch;
      }
      
      await update(userRef, updates);
      return;
    }
    
    // Initialize new user
    const userData: CoinUserData = {
      uid: userId,
      displayName,
      profilePictureUrl: profilePictureUrl || '',
      batch: batch || '',
      coins: 0,
    };
    
    await set(userRef, userData);
  }, 'Failed to initialize user coins');
}

/**
 * Update user coins with transaction safety (client-side)
 */
export async function updateUserCoins(
  userId: string, 
  amount: number, 
  operation: 'add' | 'subtract' | 'set',
  reason?: string,
  userInfo?: {
    displayName?: string;
    profilePictureUrl?: string;
    batch?: string;
  }
): Promise<ApiResponse<{ newBalance: number; previousBalance: number }>> {
  return safeApiCall(async () => {
    const userRef = ref(rtdb, `coins/${userId}`);
    
    return await runTransaction(userRef, (currentData) => {
      if (currentData === null) {
        // User doesn't exist, initialize them with provided info
        const newCoins = operation === 'add' ? amount : operation === 'set' ? Math.max(0, amount) : 0;
        return {
          uid: userId,
          displayName: userInfo?.displayName || 'Unknown User',
          profilePictureUrl: userInfo?.profilePictureUrl || '',
          batch: userInfo?.batch || '',
          coins: newCoins
        };
      }
      
      const currentCoins = currentData.coins || 0;
      let newCoins: number;
      
      switch (operation) {
        case 'add':
          newCoins = currentCoins + amount;
          break;
        case 'subtract':
          newCoins = Math.max(0, currentCoins - amount); // Prevent negative coins
          break;
        case 'set':
          newCoins = Math.max(0, amount); // Prevent negative coins
          break;
        default:
          throw new Error('Invalid operation');
      }
      
      return {
        ...currentData,
        coins: newCoins,
      };
    }).then((result) => {
      if (result.committed) {
        const previousBalance = result.snapshot.val()?.coins || 0;
        const newBalance = result.snapshot.val()?.coins || 0;
        
        // Log transaction if reason provided
        if (reason) {
          logCoinTransaction(userId, amount, operation, reason, previousBalance, newBalance);
        }
        
        return { newBalance, previousBalance };
      } else {
        throw new Error('Transaction aborted - user may not exist');
      }
    });
  }, 'Failed to update user coins');
}


// ============================================================================
// TRANSACTION LOGGING
// ============================================================================

/**
 * Log coin transaction for audit purposes (client-side)
 */
async function logCoinTransaction(
  userId: string,
  amount: number,
  operation: 'add' | 'subtract' | 'set',
  reason: string,
  balanceBefore: number,
  balanceAfter: number
): Promise<void> {
  try {
    const transaction: CoinTransaction = {
      userId,
      amount,
      operation,
      reason,
      timestamp: new Date(),
      balanceBefore,
      balanceAfter
    };
    
    const transactionsRef = collection(db, 'coin-transactions');
    await addDoc(transactionsRef, transaction);
  } catch (error) {
    console.warn('Failed to log coin transaction:', error);
    // Don't throw - transaction logging is not critical
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get coin transaction history for a user
 */
export async function getCoinTransactionHistory(
  userId: string, 
  limitCount: number = 50
): Promise<ApiResponse<CoinTransaction[]>> {
  return safeApiCall(async () => {
    const transactionsRef = collection(db, 'coin-transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    const transactions = snapshot.docs.map(doc => doc.data() as CoinTransaction);
    
    return transactions;
  }, 'Failed to get coin transaction history');
}

/**
 * Validate coin operation
 */
export function validateCoinOperation(
  amount: number, 
  operation: 'add' | 'subtract' | 'set',
  currentBalance?: number
): { valid: boolean; error?: string } {
  if (amount < 0) {
    return { valid: false, error: 'Amount cannot be negative' };
  }
  
  if (operation === 'subtract' && currentBalance !== undefined && currentBalance < amount) {
    return { valid: false, error: 'Insufficient coin balance' };
  }
  
  if (amount > 1000000) {
    return { valid: false, error: 'Amount too large' };
  }
  
  return { valid: true };
}
