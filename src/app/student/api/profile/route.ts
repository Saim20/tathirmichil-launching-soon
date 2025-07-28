import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/firebase-admin';
import { verifyIdToken } from '@/lib/firebase/firebase-admin';
import { getUserCoinBalanceAdmin } from '@/lib/apis/coin-rtdb-admin';

export async function GET(req: NextRequest) {
    try {
        // Authorization check
        const idToken = req.headers.get('Authorization')?.split(' ')[1];
        if (!idToken) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await verifyIdToken(idToken);
        const userId = decodedToken.uid;

        // Get user profile
        const userDoc = await adminFirestore.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return NextResponse.json({ 
                success: false, 
                message: 'User profile not found' 
            }, { status: 404 });
        }

        const userData = userDoc.data();
        
        // Get coin balance from RTDB
        const coinBalance = await getUserCoinBalanceAdmin(userId);
        
        const profile = {
            uid: userDoc.id,
            displayName: userData?.displayName || '',
            email: userData?.email || '',
            batch: userData?.batch || '',
            role: userData?.role || '',
            coins: coinBalance, // Now from RTDB
            confidence: userData?.confidence || 0,
            accuracy: userData?.accuracy || 0,
            isPassed: userData?.isPassed || false,
            totalTestsTaken: userData?.totalTestsTaken || 0,
            practiceTestsTaken: userData?.practiceTestsTaken || 0,
            isSubscribed: userData?.subStatus === 'active',
            purchasedVideos: userData?.purchasedVideos || [],
            updatedAt: userData?.updatedAt?.toDate(),
            grade: userData?.grade || undefined,
            gradeUpdatedAt: userData?.gradeUpdatedAt?.toDate() || undefined,
        };

        return NextResponse.json({
            success: true,
            profile,
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal server error' 
        }, { status: 500 });
    }
}
