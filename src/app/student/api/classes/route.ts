import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/firebase-admin';
import { checkIfUserIsAdmin } from '@/lib/helpers/role-checks';

export async function GET(req: NextRequest) {
    try {
        // Authorization check - students can access this endpoint
        const idToken = req.headers.get('Authorization')?.split(' ')[1];
        if (!idToken) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // For now, allow any authenticated user to view available videos
        // In the future, you might want to restrict based on subscription status

        // Fetch all active videos
        const videosSnapshot = await adminFirestore
            .collection('class-videos')
            .where('isActive', '==', true)
            .where('status', '==', 'ready')
            .orderBy('uploadedAt', 'desc')
            .get();

        const videos = videosSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                price: data.price || 100, // Fixed price of 100 coins
                cloudflareVideoId: data.cloudflareVideoId,
                thumbnailUrl: data.thumbnailUrl,
                duration: data.duration,
                uploadedAt: data.uploadedAt?.toDate(),
                category: data.category,
                tags: data.tags || [],
                isActive: data.isActive,
                totalViews: data.totalViews || 0,
                totalPurchases: data.totalPurchases || 0,
            };
        });

        return NextResponse.json({
            success: true,
            videos,
        });

    } catch (error) {
        console.error('Error fetching videos for student:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal server error' 
        }, { status: 500 });
    }
}
