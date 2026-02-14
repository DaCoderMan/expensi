import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifySubscription } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { subscriptionId } = await request.json();
  if (!subscriptionId) {
    return NextResponse.json({ error: 'Missing subscription ID' }, { status: 400 });
  }

  // Verify with PayPal
  const sub = await verifySubscription(subscriptionId);
  if (!sub || sub.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Subscription not active on PayPal' }, { status: 400 });
  }

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, {
    subscription: {
      tier: 'premium',
      paypalSubscriptionId: subscriptionId,
      paypalPayerId: sub.subscriberId,
      currentPeriodStart: new Date(sub.currentPeriodStart),
      currentPeriodEnd: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : undefined,
    },
  });

  return NextResponse.json({ success: true, tier: 'premium' });
}
