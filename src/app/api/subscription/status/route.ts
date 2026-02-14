import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean();

  if (!user || typeof user !== 'object' || !('subscription' in user)) {
    return NextResponse.json({ tier: 'free' });
  }

  const sub = user.subscription as {
    tier?: string;
    paypalSubscriptionId?: string;
    currentPeriodEnd?: Date;
  };

  return NextResponse.json({
    tier: sub?.tier || 'free',
    paypalSubscriptionId: sub?.paypalSubscriptionId,
    currentPeriodEnd: sub?.currentPeriodEnd?.toISOString?.() || null,
  });
}
