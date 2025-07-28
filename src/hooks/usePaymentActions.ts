import { useState, useCallback } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

export const usePaymentActions = () => {
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updatePaymentStatus = useCallback(async (
    paymentId: string, 
    newStatus: string
  ): Promise<boolean> => {
    setUpdating(paymentId);
    setError(null);
    
    try {
      // Only handle subscriptions now
      const paymentRef = doc(db, 'subscriptions', paymentId);
      
      await updateDoc(paymentRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Update the user's subscription status
      try {
        const paymentDoc = await getDoc(paymentRef);
        if (paymentDoc.exists()) {
          const paymentData = paymentDoc.data();
          const userId = paymentData.uid || paymentData.userId;
          
          if (userId) {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
              subStatus: newStatus,
              subUpdatedAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      } catch (userUpdateError) {
        console.warn('Failed to update user subscription status:', userUpdateError);
        // Don't fail the entire operation if user update fails
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating payment status:', err);
      return false;
    } finally {
      setUpdating(null);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updatePaymentStatus,
    updating,
    error,
    clearError,
  };
};
