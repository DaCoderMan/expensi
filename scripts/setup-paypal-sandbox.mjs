#!/usr/bin/env node
/**
 * PayPal Sandbox setup – creates a payment link and saves to .env.local.
 * Uses: api-m.sandbox.paypal.com
 * Requires: NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET in .env.local
 *
 * Run: npm run setup-paypal-sandbox
 * Creates the link via REST API and writes NEXT_PUBLIC_PAYPAL_PAYMENT_URL to .env.local.
 */

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const envPath = path.join(root, '.env.local');

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error('No .env.local found. Run: npm run setup-env');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m) {
      const key = m[1];
      const val = m[2].replace(/^["']|["']$/g, '').trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

async function getToken(clientId, clientSecret) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OAuth failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function createPaymentLink(accessToken) {
  const body = {
    type: 'BUY_NOW',
    integration_mode: 'LINK',
    reusable: 'MULTIPLE',
    return_url: 'https://example.com/pricing?paypal=success',
    line_items: [
      {
        name: 'Financi AI PRO',
        description: '$9.99/month – Unlimited expenses, AI categorization, file import',
        unit_amount: { currency_code: 'USD', value: '9.99' },
      },
    ],
  };
  const res = await fetch('https://api-m.sandbox.paypal.com/v1/checkout/payment-resources', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create payment link failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function main() {
  loadEnv();
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('Set NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.local');
    process.exit(1);
  }

  console.log('PayPal Sandbox setup');
  console.log('Using api-m.sandbox.paypal.com');
  console.log('');

  const token = await getToken(clientId, clientSecret);
  const resource = await createPaymentLink(token);

  const paymentLink = resource.payment_link || resource.links?.find((l) => l.rel === 'payment_link')?.href;
  if (!paymentLink) {
    console.error('No payment_link in response:', JSON.stringify(resource, null, 2));
    process.exit(1);
  }

  // Ensure Sandbox URL (API may return www.paypal.com)
  const sandboxUrl = paymentLink.replace('www.paypal.com', 'www.sandbox.paypal.com');

  // Save to .env.local
  const content = fs.readFileSync(envPath, 'utf8');
  const key = 'NEXT_PUBLIC_PAYPAL_PAYMENT_URL';
  const line = `${key}=${sandboxUrl}`;
  let updated;
  if (content.includes(`${key}=`)) {
    updated = content.replace(new RegExp(`^${key}=.*$`, 'm'), line);
  } else {
    const insert = content.trimEnd().endsWith('\n') ? line : '\n' + line;
    updated = content.trimEnd() + insert + '\n';
  }
  fs.writeFileSync(envPath, updated);

  console.log('Sandbox payment link created and saved to .env.local');
  console.log(sandboxUrl);
  console.log('');
  console.log('Restart your dev server. The pricing page will use Sandbox (no real charges).');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
