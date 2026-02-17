import { describe, it, expect } from 'vitest';
import { isEffectivePremium, FREE_TIER_LIMIT } from './index';

describe('isEffectivePremium', () => {
  it('returns false when sub is null', () => {
    expect(isEffectivePremium(null)).toBe(false);
  });

  it('returns false when sub is undefined', () => {
    expect(isEffectivePremium(undefined)).toBe(false);
  });

  it('returns true when tier is premium', () => {
    expect(isEffectivePremium({ tier: 'premium' })).toBe(true);
  });

  it('returns false when tier is free and no trial', () => {
    expect(isEffectivePremium({ tier: 'free' })).toBe(false);
  });

  it('returns true when tier is free but trialEndsAt is in the future', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(isEffectivePremium({ tier: 'free', trialEndsAt: future })).toBe(true);
  });

  it('returns false when tier is free and trialEndsAt is in the past', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(isEffectivePremium({ tier: 'free', trialEndsAt: past })).toBe(false);
  });
});

describe('FREE_TIER_LIMIT', () => {
  it('is 50', () => {
    expect(FREE_TIER_LIMIT).toBe(50);
  });
});
