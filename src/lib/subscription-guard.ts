import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { isEffectivePremium } from '@/types';
import { NextResponse } from 'next/server';

type GuardResult =
  | { authorized: true; userId: string; isPremium: boolean }
  | { authorized: false; response: NextResponse };

/**
 * Checks authentication and optionally requires premium (paid or active trial).
 * Reads subscription from DB for the most current state.
 */
export async function requireAuth(options?: { requirePremium?: boolean }): Promise<GuardResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (options?.requirePremium) {
    await connectDB();
    const dbUser = await User.findById(session.user.id).lean();
    const sub =
      dbUser && typeof dbUser === 'object' && 'subscription' in dbUser
        ? (dbUser.subscription as { tier?: string; trialEndsAt?: Date })
        : null;

    const premium = isEffectivePremium(
      sub
        ? {
            tier: (sub.tier as 'free' | 'premium') || 'free',
            trialEndsAt: sub.trialEndsAt?.toISOString(),
          }
        : null,
    );

    if (!premium) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'This feature requires PRO. Upgrade or start your free trial.' },
          { status: 403 },
        ),
      };
    }

    return { authorized: true, userId: session.user.id, isPremium: true };
  }

  return { authorized: true, userId: session.user.id, isPremium: false };
}
