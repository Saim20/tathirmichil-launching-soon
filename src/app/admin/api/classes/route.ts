import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/firebase-admin';
import { checkIfUserIsAdmin } from '@/lib/helpers/role-checks';

export async function GET(req: NextRequest) {
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

        // Fetch all class videos from Firestore
        const videosSnapshot = await adminFirestore
            .collection('class-videos')
            .orderBy('uploadedAt', 'desc')
            .get();

        const videos = videosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
        }));

        return NextResponse.json({ 
            success: true, 
            videos 
        });
    } catch (error) {
        console.error('Error fetching class videos:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal server error' 
        }, { status: 500 });
    }
}
