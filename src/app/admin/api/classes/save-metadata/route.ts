import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/firebase-admin';
import { checkIfUserIsAdmin } from '@/lib/helpers/role-checks';

export async function POST(req: NextRequest) {
    try {
        // Authorization check
        const idToken = req.headers.get('Authorization')?.split(' ')[1];
        if (!idToken) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { isAdmin } = await checkIfUserIsAdmin(idToken);
        if (!isAdmin) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { videoId, cloudflareVideoId, title, description, category, tags, price } = await req.json();

        if (!videoId || !title || !category) {
            return NextResponse.json({ 
                success: false, 
                message: 'Video ID, title, and category are required' 
            }, { status: 400 });
        }

        // Save video metadata to Firestore
        const videoData = {
            id: videoId,
            title,
            description: description || '',
            price: price || 100, // Fixed price of 100 coins
            category,
            tags: tags || [],
            cloudflareVideoId: cloudflareVideoId || videoId, // Store the actual Cloudflare video ID
            status: 'uploading', // uploading -> processing -> ready/failed
            isActive: false, // Will be activated when ready
            uploadedAt: new Date(),
            createdBy: 'admin',
            totalViews: 0,
            totalPurchases: 0,
            // These will be populated via webhook
            duration: null,
            size: null,
            thumbnailUrl: null,
            playbackId: null,
        };

        await adminFirestore.collection('class-videos').doc(videoId).set(videoData);

        return NextResponse.json({
            success: true,
            message: 'Video metadata saved successfully',
            videoId,
        });

    } catch (error) {
        console.error('Error saving video metadata:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal server error' 
        }, { status: 500 });
    }
}
