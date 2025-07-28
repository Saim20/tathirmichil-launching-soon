import { NextRequest, NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/lib/helpers/role-checks';

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get('Authorization')?.split(' ')[1];
    
    if (!idToken) {
      return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 });
    }

    const { userId } = await checkIfUserIsAdmin(idToken);
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionType, paymentMethod, amount, currency } = body;

    // Validate the subscription type and amount
    const validSubscriptions = {
      regular: { monthly: 7200, total: 21600 },
      crash: { total: 9000 }
    };

    const subscription = validSubscriptions[subscriptionType as keyof typeof validSubscriptions];
    if (!subscription) {
      return NextResponse.json({ error: 'Invalid subscription type' }, { status: 400 });
    }

    let expectedAmount: number;
    if (paymentMethod === 'monthly' && 'monthly' in subscription) {
      expectedAmount = subscription.monthly;
    } else {
      expectedAmount = subscription.total;
    }

    if (amount !== expectedAmount) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    // TODO: Integrate with actual payment gateway (bKash, etc.)
    // For now, we'll create a mock payment URL
    const paymentId = `payment_${Date.now()}_${userId}`;
    
    // In a real implementation, you would:
    // 1. Create payment intent with the payment gateway
    // 2. Store payment record in database
    // 3. Return the payment gateway's URL

    // Mock payment URL (replace with actual payment gateway URL)
    const paymentUrl = `/api/payments/process?paymentId=${paymentId}&subscriptionType=${subscriptionType}&paymentMethod=${paymentMethod}&amount=${amount}`;

    return NextResponse.json({
      paymentId,
      paymentUrl,
      amount,
      currency,
      subscriptionType,
      paymentMethod
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
