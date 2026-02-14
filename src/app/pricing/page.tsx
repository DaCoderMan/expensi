'use client';

import { useSession } from 'next-auth/react';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import Card from '@/components/ui/Card';

export default function PricingPage() {
  const { data: session } = useSession();
  const { isPremium, isFree, usagePercent, expenseCount } = useSubscription();
  const [isActivating, setIsActivating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const planId = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || '';

  async function handleActivate(subscriptionId: string) {
    setIsActivating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Welcome to PRO! Refreshing...' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to activate subscription.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to activate subscription.' });
    }

    setIsActivating(false);
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your PRO subscription?')) return;

    setIsCancelling(true);
    setMessage(null);

    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Subscription cancelled. Refreshing...' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to cancel subscription.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to cancel subscription.' });
    }

    setIsCancelling(false);
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
      'File import (CSV, Excel, PDF, JSON, OFX)',
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

      {/* Current Status */}
      {session?.user && (
        <Card className="!p-4 text-center">
          <p className="text-sm text-muted">
            You are currently on the{' '}
            <span className={`font-bold ${isPremium ? 'text-amber-600' : 'text-foreground'}`}>
              {isPremium ? 'PRO' : 'Free'}
            </span>{' '}
            plan
            {isFree && ` (${expenseCount}/50 expenses used)`}
          </p>
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
        {/* Free Plan */}
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

        {/* PRO Plan */}
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
              <span className="text-3xl font-bold text-foreground">$3</span>
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
                onClick={handleCancel}
                disabled={isCancelling}
                className="w-full py-2.5 bg-gray-100 text-danger rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            ) : planId ? (
              <div id="paypal-button-container">
                <PayPalButton planId={planId} onApprove={handleActivate} isLoading={isActivating} />
              </div>
            ) : (
              <button
                disabled
                className="w-full py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold opacity-50"
              >
                PayPal not configured
              </button>
            )}
          </div>
        </Card>
      </div>

      {message && (
        <div className={`max-w-md mx-auto flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

// PayPal Button sub-component
function PayPalButton({
  planId,
  onApprove,
  isLoading,
}: {
  planId: string;
  onApprove: (subscriptionId: string) => void;
  isLoading: boolean;
}) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  // Load PayPal script
  useState(() => {
    if (typeof window === 'undefined' || !clientId) return;

    const existing = document.querySelector('script[data-paypal]');
    if (existing) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.setAttribute('data-paypal', 'true');
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  });

  // Render PayPal buttons
  useState(() => {
    if (!scriptLoaded || typeof window === 'undefined') return;

    const paypal = (window as unknown as Record<string, unknown>).paypal as {
      Buttons?: (config: Record<string, unknown>) => { render: (selector: string) => void };
    };

    if (!paypal?.Buttons) return;

    const container = document.getElementById('paypal-btn-render');
    if (!container || container.children.length > 0) return;

    paypal.Buttons({
      style: { shape: 'pill', color: 'gold', layout: 'horizontal', label: 'subscribe' },
      createSubscription: (_data: unknown, actions: { subscription: { create: (config: Record<string, string>) => Promise<string> } }) => {
        return actions.subscription.create({ plan_id: planId });
      },
      onApprove: (data: { subscriptionID: string }) => {
        onApprove(data.subscriptionID);
      },
    }).render('#paypal-btn-render');
  });

  if (!clientId) {
    return (
      <button disabled className="w-full py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold opacity-50">
        PayPal not configured
      </button>
    );
  }

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center py-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <span className="ml-2 text-sm text-muted">Activating...</span>
        </div>
      ) : (
        <div id="paypal-btn-render" className="min-h-[45px]">
          {!scriptLoaded && (
            <button disabled className="w-full py-2.5 gradient-bg text-white rounded-xl text-sm font-semibold opacity-50">
              Loading PayPal...
            </button>
          )}
        </div>
      )}
    </div>
  );
}
