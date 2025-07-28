import { adminFirestore } from "@/lib/firebase/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { transactionId, paymentId } = await req.json();
  if (transactionId === undefined || paymentId === undefined) {
    console.error('Missing required fields:', { transactionId, paymentId });
    return NextResponse.json({ error: 'Missing data for subscription.' }, { status: 400 });
  }
  try {
    const snapshot = await adminFirestore.collection('subscriptions').where('transactionId', '==', transactionId).get();
    if (snapshot.empty) {
      console.error('No subscription found with transactionId:', transactionId);
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    const subscriptionData = snapshot.docs[0].data();
    const uid = subscriptionData.uid;
    const email = subscriptionData.email;
    const displayName = subscriptionData.displayName || 'Anonymous';
    console.log(`Verifying subscription for ${displayName} with email ${email}`);
    // Update the subscription status to 'active'
    if (subscriptionData.paymentId && subscriptionData.paymentId !== paymentId) {
      console.error('Payment ID mismatch for transactionId:', transactionId);
      return NextResponse.json({ error: 'Payment ID mismatch' }, { status: 400 });
    }
    await adminFirestore.collection('subscriptions').doc(uid).update({
      status: 'active',
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update the user's subscription status
    await adminFirestore.collection('users').doc(uid).update({
      subStatus: 'active',
      subType: subscriptionData.type,
      subUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true, message: 'Subscription successful' });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
};