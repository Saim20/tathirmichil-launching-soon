import { adminAuth, adminFirestore } from "@/lib/firebase/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { uid, transactionId, paymentId, type, amount } = await req.json();
  if (uid === undefined || transactionId === undefined || paymentId === undefined || type === undefined || amount === undefined) {
    console.error('Missing required fields:', { uid, transactionId, paymentId, type });
    return NextResponse.json({ error: 'Missing data for subscription.' }, {
      status:
        400
    });
  }
  const idToken = req.headers.get('Authorization')?.split(' ')[1];
  if (!idToken) {
    console.error('No ID token provided in request headers');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Verify the ID token here if needed, e.g., using Firebase Admin SDK
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  if (!decodedToken || decodedToken.uid !== uid) {
    console.error('Invalid ID token or UID mismatch');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Get details from the decoded token
    const snapshot = await adminFirestore.collection('users').doc(uid).get();
    if (!snapshot.exists) {
      console.error('User not found in Firestore:', uid);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = snapshot.data();
    const email = userData?.email;
    const displayName = userData?.displayName || 'Anonymous';
    console.log(`Subscribing ${displayName} with email ${email}`);
    // Add to firestore
    adminFirestore.collection('subscriptions').doc(uid).set({
      uid,
      email,
      displayName,
      transactionId,
      paymentId,
      amount,
      type,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Optionally, you can also update the user's subscription status
    await adminFirestore.collection('users').doc(uid).update({
      subStatus: 'pending', // or 'active' for subscribed
      subType: type,
      subUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: 'Subscription successful' });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
};