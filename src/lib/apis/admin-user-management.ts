import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { ApiResponse, safeApiCall } from './base';

/**
 * Update user role and subscription status
 */
export async function updateUserRole(
  userId: string, 
  role: 'admin' | 'student',
  makeSubscribed?: boolean
): Promise<ApiResponse<void>> {
  return safeApiCall(async () => {
    const userDoc = doc(db, 'users', userId);
    const now = Timestamp.now();
    
    const updateData: any = {
      role,
      updatedAt: now
    };

    if (role === 'admin') {
      // When making someone admin, also make them subscribed and passed
      updateData.subStatus = 'active';
      updateData.subUpdatedAt = now;
      updateData.isPassed = true;
      updateData.isSubscribed = true;
    } else if (role === 'student' && makeSubscribed !== undefined) {
      // When removing admin, optionally maintain their subscription
      updateData.subStatus = makeSubscribed ? 'active' : 'inactive';
      updateData.subUpdatedAt = now;
      updateData.isSubscribed = makeSubscribed;
    }

    await updateDoc(userDoc, updateData);
  }, 'Failed to update user role');
}

/**
 * Refresh user data by triggering a re-fetch
 */
export async function refreshUserData(): Promise<ApiResponse<string>> {
  return safeApiCall(async () => {
    // Clear the cache timestamp to force a fresh fetch
    localStorage.removeItem('cached_users_last_updated_at');
    return 'User data cache cleared. Refreshing...';
  }, 'Failed to refresh user data');
}
