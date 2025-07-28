import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/firebase-admin';
import { verifyIdToken } from '@/lib/firebase/firebase-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ videoId: string }> }) {
    try {
        // Authorization check
        const idToken = req.headers.get('Authorization')?.split(' ')[1];
        if (!idToken) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await verifyIdToken(idToken);
        const userId = decodedToken.uid;
        const { videoId } = await params;

        // Check if user has purchased the video
        const userDoc = await adminFirestore.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data();
        const purchasedVideos = userData?.purchasedVideos || [];
        
        if (!purchasedVideos.includes(videoId)) {
            return NextResponse.json({ success: false, message: 'Video not purchased' }, { status: 403 });
        }

        // Get video details
        const videoDoc = await adminFirestore.collection('class-videos').doc(videoId).get();
        if (!videoDoc.exists) {
            return NextResponse.json({ success: false, message: 'Video not found' }, { status: 404 });
        }

        const videoData = videoDoc.data();
        if (!videoData?.isActive || videoData?.status !== 'ready') {
            return NextResponse.json({ success: false, message: 'Video not available' }, { status: 400 });
        }

        // Generate signed URL for Cloudflare Stream
        const cloudflareVideoId = videoData.cloudflareVideoId;
        const signedUrl = await generateSignedStreamUrl(cloudflareVideoId, userId);

        // Update view count
        await adminFirestore.collection('class-videos').doc(videoId).update({
            totalViews: (videoData.totalViews || 0) + 1,
        });

        // Log the view
        await adminFirestore.collection('video-views').add({
            userId,
            videoId,
            viewedAt: new Date(),
            userAgent: req.headers.get('user-agent') || 'unknown',
        });

        return NextResponse.json({
            success: true,
            signedUrl,
            videoTitle: videoData.title,
        });

    } catch (error) {
        console.error('Error generating signed URL:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal server error' 
        }, { status: 500 });
    }
}

async function generateSignedStreamUrl(cloudflareVideoId: string, userId: string): Promise<string> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!accountId || !apiToken) {
        throw new Error('Cloudflare configuration missing');
    }

    // Create a signed URL with expiration (e.g., 2 hours)
    const expirationTime = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
    
    // Generate the signed URL using Cloudflare Stream's signed URL feature
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${cloudflareVideoId}/token`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: cloudflareVideoId,
                pem: process.env.CLOUDFLARE_PRIVATE_KEY, // You'll need to set this up
                exp: expirationTime,
                nbf: Math.floor(Date.now() / 1000), // Not before current time
                downloadable: false, // Prevent downloads
                meta: {
                    userId: userId,
                    timestamp: Date.now(),
                },
            }),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        console.error('Cloudflare Stream API error:', error);
        throw new Error('Failed to generate signed URL');
    }

    const data = await response.json();
    const token = data.result.token;
    
    // Return the signed embed URL
    return `https://embed.cloudflarestream.com/${cloudflareVideoId}?token=${token}`;
}

// Alternative simpler approach if signed URLs are complex to set up
async function generateBasicStreamUrl(cloudflareVideoId: string): Promise<string> {
    // This uses the basic embed URL without token-based signing
    // You should enable "Require signed URLs" in Cloudflare Stream settings
    // and use the more secure token-based approach above in production
    return `https://embed.cloudflarestream.com/${cloudflareVideoId}`;
}
