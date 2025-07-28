import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/firebase-admin';
import { checkIfUserIsAdmin } from '@/lib/helpers/role-checks';

export async function POST(req: NextRequest) {
    try {
        // Authorization check
        const authHeader = req.headers.get('Authorization');
        const idToken = authHeader?.split(' ')[1];
        
        if (!idToken) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { isAdmin } = await checkIfUserIsAdmin(idToken);
        if (!isAdmin) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const formData = await req.formData();
        const video = formData.get('video') as File;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const price = parseInt(formData.get('price') as string);
        const category = formData.get('category') as string;
        const tags = (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(Boolean) || [];

        if (!video || !title || !price || !category) {
            return NextResponse.json({ 
                success: false, 
                message: 'Missing required fields' 
            }, { status: 400 });
        }

        // Convert video file to buffer for Cloudflare Stream upload
        const videoBuffer = Buffer.from(await video.arrayBuffer());

        // Upload to Cloudflare Stream
        const cloudflareResponse = await uploadToCloudflareStream(videoBuffer, {
            filename: video.name,
            title,
            description,
        });

        if (!cloudflareResponse.success) {
            return NextResponse.json({ 
                success: false, 
                message: 'Failed to upload video to Cloudflare Stream' 
            }, { status: 500 });
        }

        // Save video metadata to Firestore
        const videoDoc = await adminFirestore.collection('class-videos').add({
            title,
            description,
            price,
            category,
            tags,
            cloudflareVideoId: cloudflareResponse.result.uid,
            thumbnailUrl: cloudflareResponse.result.thumbnail,
            duration: cloudflareResponse.result.duration,
            uploadedAt: new Date(),
            isActive: true,
            createdBy: 'admin', // You can get this from the decoded token
        });

        return NextResponse.json({ 
            success: true, 
            videoId: videoDoc.id,
            cloudflareVideoId: cloudflareResponse.result.uid
        });

    } catch (error) {
        console.error('Error uploading video:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal server error' 
        }, { status: 500 });
    }
}

// Function to upload video to Cloudflare Stream
async function uploadToCloudflareStream(videoBuffer: Buffer, metadata: {
    filename: string;
    title: string;
    description: string;
}) {
    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
        throw new Error('Cloudflare credentials not configured');
    }

    const formData = new FormData();
    formData.append('file', new Blob([videoBuffer]), metadata.filename);
    
    // Add metadata
    formData.append('meta', JSON.stringify({
        name: metadata.title,
        description: metadata.description,
    }));

    // Add watermark and security settings
    formData.append('watermark', JSON.stringify({
        uid: process.env.CLOUDFLARE_WATERMARK_UID, // You'll need to create this
    }));

    // Require signed URLs for playback
    formData.append('requireSignedURLs', 'true');

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            },
            body: formData,
        }
    );

    const result = await response.json();
    
    if (!response.ok) {
        console.error('Cloudflare Stream error:', result);
        return { success: false, error: result };
    }

    return { success: true, result: result.result };
}
