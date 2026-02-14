const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await res.json();
  return data.access_token;
}

export async function verifySubscription(subscriptionId: string): Promise<{
  status: string;
  planId: string;
  subscriberId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
} | null> {
  try {
    const accessToken = await getPayPalAccessToken();

    const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();

    return {
      status: data.status,
      planId: data.plan_id,
      subscriberId: data.subscriber?.payer_id || '',
      currentPeriodStart: data.billing_info?.last_payment?.time || data.start_time,
      currentPeriodEnd: data.billing_info?.next_billing_time || '',
    };
  } catch {
    return null;
  }
}

export async function cancelPayPalSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const accessToken = await getPayPalAccessToken();

    const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'User cancelled from Expensi' }),
    });

    return res.status === 204 || res.ok;
  } catch {
    return false;
  }
}
