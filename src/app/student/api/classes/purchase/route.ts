import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/firebase-admin';
import { verifyIdToken } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getUserCoinBalanceAdmin, updateUserCoinsAdmin } from '@/lib/apis/coin-rtdb-admin';

export async function POST(req: NextRequest) {
    try {
        // Authorization check
        const idToken = req.headers.get('Authorization')?.split(' ')[1];
        if (!idToken) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await verifyIdToken(idToken);
        const userId = decodedToken.uid;

        const { videoId } = await req.json();

        if (!videoId) {
            return NextResponse.json({ 
                success: false, 
                message: 'Video ID is required' 
            }, { status: 400 });
        }

        // Start a transaction to ensure data consistency
        const result = await adminFirestore.runTransaction(async (transaction) => {
            // Get user document (for purchased videos, not coins)
            const userRef = adminFirestore.collection('users').doc(userId);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            const purchasedVideos = userData?.purchasedVideos || [];

            // Check if video is already purchased
            if (purchasedVideos.includes(videoId)) {
                throw new Error('Video already purchased');
            }

            // Get current coin balance from RTDB
            const currentCoins = await getUserCoinBalanceAdmin(userId);

            // Check if user has enough coins
            if (currentCoins < 100) {
                throw new Error('Insufficient coins');
            }

            // Get video document to verify it exists and is active
            const videoRef = adminFirestore.collection('class-videos').doc(videoId);
            const videoDoc = await transaction.get(videoRef);

            if (!videoDoc.exists) {
                throw new Error('Video not found');
            }

            const videoData = videoDoc.data();
            if (!videoData?.isActive || videoData?.status !== 'ready') {
                throw new Error('Video not available for purchase');
            }

            // Update user with purchased video (coins are updated separately in RTDB)
            transaction.update(userRef, {
                purchasedVideos: FieldValue.arrayUnion(videoId),
                updatedAt: FieldValue.serverTimestamp(),
            });

            // Update video purchase count
            transaction.update(videoRef, {
                totalPurchases: FieldValue.increment(1),
            });

            // Create purchase record
            const purchaseRef = adminFirestore.collection('video-purchases').doc();
            transaction.set(purchaseRef, {
                userId,
                videoId,
                price: 100,
                purchasedAt: new Date(),
                videoTitle: videoData.title,
            });

            return { videoData, currentCoins, userData };
        });

        // After Firestore transaction succeeds, update coins in RTDB
        const coinResult = await updateUserCoinsAdmin(
            userId,
            100, // Amount to subtract
            'subtract',
            `Video purchase: ${result.videoData.title}`,
            {
                displayName: result.userData?.displayName || 'Unknown User',
                profilePictureUrl: result.userData?.profilePictureUrl || '',
                batch: result.userData?.batch || ''
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Video purchased successfully',
            newCoinBalance: coinResult.newBalance,
        });

    } catch (error) {
        console.error('Error purchasing video:', error);
        
        if (error instanceof Error) {
            return NextResponse.json({ 
                success: false, 
                message: error.message 
            }, { status: 400 });
        }
        
        return NextResponse.json({ 
            success: false, 
            message: 'Internal server error' 
        }, { status: 500 });
    }
}
