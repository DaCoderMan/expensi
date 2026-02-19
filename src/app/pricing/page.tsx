'use client';

import { useSession } from 'next-auth/react';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import Card from '@/components/ui/Card';

const PAYPAL_PAYMENT_URL = process.env.NEXT_PUBLIC_PAYPAL_PAYMENT_URL || 'https://www.paypal.com/ncp/payment/RL8WME7ZGW2LN';
const isSandbox = PAYPAL_PAYMENT_URL.includes('sandbox.paypal.com');
const PAYPAL_SUMMARY = 'You\'ll go to PayPal to complete your $9.99/month PRO payment. Continue?';

export default function PricingPage() {
  const { data: session } = useSession();
  const { isPremium, isFree, isInTrial, trialExpired, trialEndsAt, usagePercent, expenseCount } = useSubscription();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [devAction, setDevAction] = useState<'grant' | 'revoke' | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const isDev = process.env.NODE_ENV === 'development';

  async function handleDowngrade() {
    if (!confirm('Downgrade to Free? You will keep your data but lose PRO features.')) return;
    setIsCancelling(true);
    setMessage(null);
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Downgraded to Free. Refreshing...' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Request failed.' });
    }
    setIsCancelling(false);
  }

  async function handleDevGrantPro() {
    setDevAction('grant');
    setMessage(null);
    try {
      const res = await fetch('/api/dev/grant-pro', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'PRO granted. Refreshing...' });
        setTimeout(() => window.location.reload(), 800);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Request failed' });
    }
    setDevAction(null);
  }

  async function handleDevRevokePro() {
    setDevAction('revoke');
    setMessage(null);
    try {
      const res = await fetch('/api/dev/revoke-pro', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'PRO revoked. Refreshing...' });
        setTimeout(() => window.location.reload(), 800);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Request failed' });
    }
    setDevAction(null);
  }

  const features = {
    free: [
      'Up to 50 expenses',
      'Manual entry only',
      'Dashboard & charts',
      'Category tracking',
      'Basic expense filtering',
    ],
    premium: [
      'Unlimited expenses',
      'AI auto-categorization',
      'AI spending insights',
      'File import (CSV, Excel, PDF, JSON, OFX/QFX)',
      'Priority support',
      'All future features',
    ],
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h1>
        <p className="text-muted">Unlock the full power of AI-driven expense tracking</p>
      </div>

      {trialExpired && (
        <Card className="border-amber-300 bg-amber-100/80 dark:bg-amber-900/30 dark:border-amber-700 text-center">
          <p className="text-sm text-foreground">
            <span className="font-semibold text-amber-800 dark:text-amber-300">Your free trial has ended.</span>
            {' '}Pay below to get PRO and keep unlimited expenses plus AI features.
          </p>
        </Card>
      )}

      {session?.user && (
        <Card className="!p-4 text-center">
          <p className="text-sm text-muted">
            You are currently on the{' '}
            <span className={`font-bold ${isPremium ? 'text-amber-600' : 'text-foreground'}`}>
              {isInTrial ? 'Free trial' : isPremium ? 'PRO' : 'Free'}
            </span>{' '}
            plan
            {isInTrial && trialEndsAt && (
              <span className="text-amber-600 font-medium">
                {' '}({Math.ceil((trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days left)
              </span>
            )}
            {isFree && !isInTrial && ` (${expenseCount}/50 expenses used)`}
          </p>
          {isDev && session?.user && (
            <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={handleDevGrantPro}
                disabled={devAction !== null}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50"
              >
                {devAction === 'grant' ? '…' : 'Dev: Grant PRO'}
              </button>
              <button
                type="button"
                onClick={handleDevRevokePro}
                disabled={devAction !== null}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                {devAction === 'revoke' ? '…' : 'Dev: Revoke PRO'}
              </button>
            </div>
          )}
          {isFree && (
            <div className="mt-2 w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
              <div
                className="gradient-bg h-2 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className={`relative ${isFree ? 'ring-2 ring-primary' : ''}`}>
          <div className="p-2">
            {isFree && (
              <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-lg bg-primary-light text-primary text-xs font-bold">
                Current
              </span>
            )}
            <h2 className="text-xl font-bold text-foreground mb-1">Free</h2>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-foreground">$0</span>
              <span className="text-muted text-sm">/forever</span>
            </div>
            <ul className="space-y-3 mb-6">
              {features.free.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-muted">
                  <svg className="w-4 h-4 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {isFree && (
              <button disabled className="w-full py-2.5 bg-gray-100 text-muted rounded-xl text-sm font-medium">
                Current Plan
              </button>
            )}
          </div>
        </Card>

        <Card className={`relative ${isPremium ? 'ring-2 ring-amber-400' : 'ring-2 ring-primary'}`}>
          <div className="p-2">
            {isPremium && (
              <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">
                Current
              </span>
            )}
            {!isPremium && (
              <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-lg gradient-bg text-white text-xs font-bold">
                Recommended
              </span>
            )}
            <h2 className="text-xl font-bold text-foreground mb-1">PRO</h2>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-foreground">$9.99</span>
              <span className="text-muted text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {features.premium.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground font-medium">
                  <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {isPremium ? (
              <button
                onClick={handleDowngrade}
                disabled={isCancelling}
                className="w-full py-2.5 bg-gray-100 text-danger rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {isCancelling ? '…' : 'Downgrade to Free'}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                {isSandbox && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 text-xs font-semibold">
                    Sandbox — no real charges
                  </span>
                )}
                <style>{`.pp-RL8WME7ZGW2LN{text-align:center;border:none;border-radius:0.25rem;min-width:11.625rem;padding:0 2rem;height:2.625rem;font-weight:bold;background-color:#FFD140;color:#000000;font-family:"Helvetica Neue",Arial,sans-serif;font-size:1rem;line-height:1.25rem;cursor:pointer;}`}</style>
                <form
                  action={PAYPAL_PAYMENT_URL}
                  method="post"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2"
                  onSubmit={(e) => {
                    if (!session?.user) {
                      e.preventDefault();
                      window.location.href = '/auth/signin?callbackUrl=' + encodeURIComponent('/pricing');
                      return;
                    }
                    if (!confirm(PAYPAL_SUMMARY)) {
                      e.preventDefault();
                    }
                  }}
                >
                  <input className="pp-RL8WME7ZGW2LN" type="submit" value="Buy Now" />
                  <img
                    src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg"
                    alt="cards"
                    className="h-8"
                  />
                </form>
                <p className="text-[0.75rem] text-muted">
                  Powered by{' '}
                  <img
                    src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
                    alt="PayPal"
                    className="inline h-3.5 align-middle"
                  />
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {message && (
        <div
          className={`max-w-md mx-auto flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === 'success' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
