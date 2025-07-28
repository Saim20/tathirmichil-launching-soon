import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/firebase-admin';
import { checkIfUserIsAdmin } from '@/lib/helpers/role-checks';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const videoId = searchParams.get('videoId');
        
        if (!videoId) {
            return NextResponse.json({ success: false, message: 'Video ID required' }, { status: 400 });
        }

        // Authorization check
        const idToken = req.headers.get('Authorization')?.split(' ')[1];
        if (!idToken) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { isAdmin } = await checkIfUserIsAdmin(idToken);
        if (!isAdmin) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const videoDoc = await adminFirestore.collection('class-videos').doc(videoId).get();
        
        if (!videoDoc.exists) {
            return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 });
        }

        const videoData = videoDoc.data();
        
        return NextResponse.json({
            success: true,
            status: videoData?.status || 'unknown',
            isActive: videoData?.isActive || false,
            duration: videoData?.duration,
            thumbnailUrl: videoData?.thumbnailUrl,
            error: videoData?.error,
        });

    } catch (error) {
        console.error('Error checking video status:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
