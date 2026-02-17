'use client';

import { useSession } from 'next-auth/react';
import { SubscriptionTier, FREE_TIER_LIMIT, isEffectivePremium } from '@/types';
import { useExpenses } from '@/context/ExpenseContext';

export function useSubscription() {
  const { data: session } = useSession();
  const { expenseCount } = useExpenses();

  const sub = session?.user?.subscription;
  const tier: SubscriptionTier = sub?.tier || 'free';
  const isPremium = isEffectivePremium(sub);
  const isFree = !isPremium;
  const trialEndsAt = sub?.trialEndsAt ? new Date(sub.trialEndsAt) : null;
  const isInTrial = tier === 'free' && trialEndsAt && trialEndsAt > new Date();
  const trialExpired = tier === 'free' && trialEndsAt != null && trialEndsAt <= new Date();
  const limit = isFree ? FREE_TIER_LIMIT : Infinity;
  const remaining = isFree ? Math.max(0, FREE_TIER_LIMIT - expenseCount) : Infinity;
  const isAtLimit = isFree && expenseCount >= FREE_TIER_LIMIT;
  const usagePercent = isFree ? Math.min(100, (expenseCount / FREE_TIER_LIMIT) * 100) : 0;

  return {
    tier,
    isPremium,
    isFree,
    isInTrial,
    trialExpired,
    trialEndsAt: trialEndsAt ?? undefined,
    limit,
    remaining,
    isAtLimit,
    usagePercent,
    expenseCount,
  };
}
