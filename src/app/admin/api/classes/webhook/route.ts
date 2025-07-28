import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/firebase-admin';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        // Verify webhook signature from Cloudflare
        const signature = req.headers.get('cf-webhook-signature');
        const timestamp = req.headers.get('cf-webhook-timestamp');
        const webhookSecret = process.env.CLOUDFLARE_WEBHOOK_SECRET;

        if (!signature || !timestamp || !webhookSecret) {
            return NextResponse.json({ success: false, message: 'Missing webhook verification' }, { status: 400 });
        }

        const body = await req.text();
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(timestamp + body)
            .digest('hex');

        if (signature !== expectedSignature) {
            return NextResponse.json({ success: false, message: 'Invalid webhook signature' }, { status: 401 });
        }

        const data = JSON.parse(body);
        
        // Handle different webhook events
        switch (data.eventType) {
            case 'video.upload.complete':
                await handleVideoUploadComplete(data);
                break;
            case 'video.upload.failed':
                await handleVideoUploadFailed(data);
                break;
            case 'video.ready':
                await handleVideoReady(data);
                break;
            default:
                console.log('Unknown webhook event:', data.eventType);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

async function handleVideoUploadComplete(data: any) {
    const videoId = data.meta?.videoId;
    if (!videoId) return;

    try {
        await adminFirestore.collection('class-videos').doc(videoId).update({
            status: 'processing',
            cloudflareVideoId: data.uid,
            uploadCompletedAt: new Date(),
            duration: data.duration,
            size: data.size,
        });
    } catch (error) {
        console.error('Error updating video upload status:', error);
    }
}

async function handleVideoUploadFailed(data: any) {
    const videoId = data.meta?.videoId;
    if (!videoId) return;

    try {
        await adminFirestore.collection('class-videos').doc(videoId).update({
            status: 'failed',
            error: data.error || 'Upload failed',
            failedAt: new Date(),
        });
    } catch (error) {
        console.error('Error updating video failure status:', error);
    }
}

async function handleVideoReady(data: any) {
    const videoId = data.meta?.videoId;
    if (!videoId) return;

    try {
        await adminFirestore.collection('class-videos').doc(videoId).update({
            status: 'ready',
            isActive: true,
            readyAt: new Date(),
            thumbnailUrl: data.thumbnail,
            duration: data.duration,
            playbackId: data.playback?.hls,
        });
    } catch (error) {
        console.error('Error updating video ready status:', error);
    }
}
