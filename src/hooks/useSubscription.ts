'use client';

import { useSession } from 'next-auth/react';
import { SubscriptionTier, FREE_TIER_LIMIT } from '@/types';
import { useExpenses } from '@/context/ExpenseContext';

export function useSubscription() {
  const { data: session } = useSession();
  const { expenseCount } = useExpenses();

  const tier: SubscriptionTier = session?.user?.subscription?.tier || 'free';
  const isPremium = tier === 'premium';
  const isFree = tier === 'free';
  const limit = isFree ? FREE_TIER_LIMIT : Infinity;
  const remaining = isFree ? Math.max(0, FREE_TIER_LIMIT - expenseCount) : Infinity;
  const isAtLimit = isFree && expenseCount >= FREE_TIER_LIMIT;
  const usagePercent = isFree ? Math.min(100, (expenseCount / FREE_TIER_LIMIT) * 100) : 0;

  return {
    tier,
    isPremium,
    isFree,
    limit,
    remaining,
    isAtLimit,
    usagePercent,
    expenseCount,
  };
}
