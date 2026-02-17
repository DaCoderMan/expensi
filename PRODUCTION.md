# Production Checklist

Use this checklist before deploying Expensi to production.

## Environment Variables

Set these in your hosting provider (Vercel, etc.):

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | Random secret (`npx auth secret`) |
| `MONGODB_URI` | Yes | MongoDB connection string (Atlas or self-hosted) |
| `AUTH_GOOGLE_ID` | Yes | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth client secret |
| `AUTH_GITHUB_ID` | Yes | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | Yes | GitHub OAuth client secret |
| `DEEPSEEK_API_KEY` | No | For AI features (categorization, recommendations) |

## Disable Dev Features

- Do **not** set `AUTH_DEV_CREDENTIALS=true` in production.
- Do **not** set `DEV_ALLOW_GRANT_PRO=true` in production.

## Payment and webhook

- PRO upgrades use the PayPal payment button (link in the app).
- Optional: set `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_WEBHOOK_ID` to verify webhooks and auto-grant PRO when PayPal sends payment/subscription events. Webhook URL: `https://yourdomain.com/api/webhooks/paypal`. Subscribe to `BILLING.SUBSCRIPTION.*` and `PAYMENT.CAPTURE.COMPLETED`.

## Middleware

- `api/webhooks` is excluded from auth so PayPal can reach the webhook.
- `terms` and `privacy` pages are public (no auth required).

## Legal and Disclaimers

- Terms of Service: `/terms`
- Privacy Policy: `/privacy`
- In-app disclaimers appear on Dashboard, AI Insights, and Import pages.
- Footer includes "Tool only, not professional advice" disclaimer.

## Verification

1. Sign in with Google or GitHub.
2. Add expenses, hit free limit, verify upgrade prompt.
3. Subscribe via PayPal on `/pricing`, verify PRO status.
4. Cancel subscription, verify downgrade to free.
5. Confirm Terms and Privacy pages load without auth.
