import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { cancelPayPalSubscription } from '@/lib/paypal';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean();

  if (!user || typeof user !== 'object' || !('subscription' in user)) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
  }

  const sub = user.subscription as { paypalSubscriptionId?: string };
  if (!sub?.paypalSubscriptionId) {
    return NextResponse.json({ error: 'No PayPal subscription found' }, { status: 400 });
  }

  const cancelled = await cancelPayPalSubscription(sub.paypalSubscriptionId);
  if (!cancelled) {
    return NextResponse.json({ error: 'Failed to cancel on PayPal' }, { status: 500 });
  }

  await User.findByIdAndUpdate(session.user.id, {
    'subscription.tier': 'free',
    'subscription.cancelledAt': new Date(),
  });

  return NextResponse.json({ success: true, tier: 'free' });
}
