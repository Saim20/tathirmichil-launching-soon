// ============================================================================
// ADMIN-SIDE FUNCTIONS (for server-side operations)
// ============================================================================

import { adminDb, adminFirestore } from "../firebase/firebase-admin";
import { CoinUserData, CoinUpdate, CoinTransaction } from "./coin-rtdb";

/**
 * Get user's coin balance from RTDB (admin)
 */
export async function getUserCoinBalanceAdmin(userId: string): Promise<number> {
  try {
    const snapshot = await adminDb.ref(`coins/${userId}/coins`).once('value');
    return snapshot.exists() ? snapshot.val() : 0;
  } catch (error) {
    console.error('Failed to get user coin balance (admin):', error);
    return 0;
  }
}

/**
 * Initialize user coins in RTDB (admin)
 */
export async function initializeUserCoinsAdmin(
  userId: string, 
  displayName: string, 
  profilePictureUrl?: string,
  batch?: string
): Promise<void> {
  try {
    const userRef = adminDb.ref(`coins/${userId}`);
    // Check if user already exists
    const snapshot = await userRef.once('value');
    if (snapshot.exists()) {
      // Update display name, profile picture, and batch if provided
      const updates: Partial<CoinUserData> = {
        displayName
      };
      if (profilePictureUrl) {
        updates.profilePictureUrl = profilePictureUrl;
      }
      if (batch) {
        updates.batch = batch;
      }
      await userRef.update(updates);
      return;
    }
    // Initialize new user
    const userData: CoinUserData = {
      uid: userId,
      displayName,
      profilePictureUrl: profilePictureUrl || '',
      batch: batch || '',
      coins: 0
    };
    await userRef.set(userData);
  } catch (error) {
    console.error('Failed to initialize user coins (admin):', error);
    throw error;
  }
}

/**
 * Update user coins with transaction safety (admin)
 */
export async function updateUserCoinsAdmin(
  userId: string, 
  amount: number, 
  operation: 'add' | 'subtract' | 'set',
  reason?: string,
  userInfo?: {
    displayName?: string;
    profilePictureUrl?: string;
    batch?: string;
  }
): Promise<{ newBalance: number; previousBalance: number }> {
  try {
    const userRef = adminDb.ref(`coins/${userId}`);
    const result = await userRef.transaction((currentData) => {
      // If user doesn't exist, initialize them first
      if (currentData === null) {
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
        coins: newCoins
      };
    });
    
    if (result.committed && result.snapshot) {
      const userData = result.snapshot.val();
      const newBalance = userData?.coins || 0;
      const previousBalance = operation === 'add' ? newBalance - amount : 
                             operation === 'subtract' ? newBalance + amount : 
                             operation === 'set' ? (userData?.coins || 0) - amount : 0;
      
      // Log transaction if reason provided
      if (reason) {
        await logCoinTransactionAdmin(userId, amount, operation, reason, previousBalance, newBalance);
      }
      
      return { newBalance, previousBalance };
    } else {
      throw new Error('Transaction failed to commit');
    }
  } catch (error) {
    console.error('Failed to update user coins (admin):', error);
    throw error;
  }
}

/**
 * Batch update multiple users' coins (admin)
 */
export async function batchUpdateCoinsAdmin(updates: CoinUpdate[]): Promise<void> {
  try {
    const updatePromises = updates.map(update => 
      updateUserCoinsAdmin(update.userId, update.amount, update.operation, update.reason, update.userInfo)
    );
    await Promise.all(updatePromises);
    console.log(`[COIN_RTDB_ADMIN] Batch updated ${updates.length} users' coins`);
  } catch (error) {
    console.error('Failed to batch update coins (admin):', error);
    throw error;
  }
}

/**
 * Log coin transaction for audit purposes (admin)
 */
async function logCoinTransactionAdmin(
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
    
    await adminFirestore.collection('coin-transactions').add(transaction);
  } catch (error) {
    console.warn('Failed to log coin transaction (admin):', error);
    // Don't throw - transaction logging is not critical
  }
}

/**
 * Get coin transaction history for a user (admin)
 */
export async function getCoinTransactionHistoryAdmin(
  userId: string, 
  limitCount: number = 50
): Promise<CoinTransaction[]> {
  try {
    const snapshot = await adminFirestore
      .collection('coin-transactions')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limitCount)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as CoinTransaction);
  } catch (error) {
    console.error('Failed to get coin transaction history (admin):', error);
    return [];
  }
}