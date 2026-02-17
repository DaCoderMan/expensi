import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, {
    'subscription.tier': 'free',
    'subscription.cancelledAt': new Date(),
  });

  return NextResponse.json({ success: true, tier: 'free' });
}
