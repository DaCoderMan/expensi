import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

const isDev =
  process.env.NODE_ENV === 'development' || process.env.DEV_ALLOW_GRANT_PRO === 'true';

export async function POST() {
  if (!isDev) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, {
    $set: { 'subscription.tier': 'free', 'subscription.cancelledAt': new Date() },
    $unset: {
      'subscription.paypalSubscriptionId': 1,
      'subscription.paypalPayerId': 1,
      'subscription.currentPeriodStart': 1,
      'subscription.currentPeriodEnd': 1,
      'subscription.trialEndsAt': 1,
    },
  });

  return NextResponse.json({ success: true, tier: 'free' });
}
