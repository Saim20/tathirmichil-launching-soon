import { NextRequest, NextResponse } from 'next/server';
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

        const { title, description, category, tags } = await req.json();

        if (!title || !category) {
            return NextResponse.json({ 
                success: false, 
                message: 'Title and category are required' 
            }, { status: 400 });
        }

        // Generate a unique video ID
        const videoId = `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Get direct upload URL from Cloudflare Stream
        const cloudflareResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    maxDurationSeconds: 3600, // 1 hour max
                    allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL],
                    requireSignedURLs: true, // Enable signed URLs for security
                    watermark: {
                        uid: process.env.CLOUDFLARE_WATERMARK_UID, // You'll need to create this
                    },
                    thumbnailTimestampPct: 0.1, // Generate thumbnail at 10% of video duration
                    creator: 'admin',
                    meta: {
                        name: title,
                        videoId: videoId,
                        category: category,
                        description: description || '',
                        tags: JSON.stringify(tags || []),
                        uploadedBy: 'admin',
                        uploadedAt: new Date().toISOString(),
                        price: '100', // Fixed price as string for metadata
                    },
                }),
            }
        );

        if (!cloudflareResponse.ok) {
            const errorData = await cloudflareResponse.json();
            console.error('Cloudflare API error:', errorData);
            throw new Error('Failed to get upload URL from Cloudflare');
        }

        const cloudflareData = await cloudflareResponse.json();
        
        return NextResponse.json({
            success: true,
            uploadURL: cloudflareData.result.uploadURL,
            videoId: videoId,
            cloudflareVideoId: cloudflareData.result.uid,
        });

    } catch (error) {
        console.error('Error getting upload URL:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal server error' 
        }, { status: 500 });
    }
}
