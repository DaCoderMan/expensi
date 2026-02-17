# Environment Variables Guide

Where to get each variable and whether it's required.

---

## Required (app won't work without these)

| Variable | Where to get it | Link |
|----------|-----------------|------|
| `AUTH_SECRET` | Generate a random secret | Run: `npx auth secret` |
| `MONGODB_URI` | MongoDB Atlas or local | [MongoDB Atlas](https://cloud.mongodb.com/) → Clusters → Connect → Connection string |
| `AUTH_GOOGLE_ID` | Google Cloud Console | [Google Cloud](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web). Callback: `https://YOUR_DOMAIN/api/auth/callback/google` |
| `AUTH_GOOGLE_SECRET` | Same as above | Same page as Client ID |
| `AUTH_GITHUB_ID` | GitHub Developer Settings | [GitHub OAuth Apps](https://github.com/settings/developers) → New OAuth App. Callback: `https://YOUR_DOMAIN/api/auth/callback/github` |
| `AUTH_GITHUB_SECRET` | Same as above | Same page as Client ID |

---

## Optional (PayPal webhook – auto-grant PRO on payment)

| Variable | Where to get it | Link |
|----------|-----------------|------|
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal Developer Dashboard | [PayPal Developer](https://developer.paypal.com/dashboard/applications/sandbox) → Your app → Client ID |
| `PAYPAL_CLIENT_SECRET` | Same as above | Same page → Secret |
| `PAYPAL_WEBHOOK_ID` | Add webhook | [PayPal Developer](https://developer.paypal.com/dashboard/) → Your app → Webhooks → Add Webhook. URL: `https://YOUR_DOMAIN/api/webhooks/paypal`. Subscribe to: `BILLING.SUBSCRIPTION.*`, `PAYMENT.CAPTURE.COMPLETED` |

If these are set, the app verifies webhook signatures and can grant PRO when PayPal sends subscription or payment events. For one-time payment links, use `custom_id` = user id when creating the payment so `PAYMENT.CAPTURE.COMPLETED` can upgrade the right user.

---

## Optional (dev / staging only)

| Variable | Purpose |
|----------|---------|
| `DEV_EMAIL` | Dev login email (default: `dev@localhost`) |
| `DEV_PASSWORD` | Dev login password (required for dev sign-in) |
| `AUTH_DEV_CREDENTIALS` | Set `true` to enable dev login outside `NODE_ENV=development` |
| `DEV_ALLOW_GRANT_PRO` | Set `true` to enable Grant/Revoke PRO without PayPal (dev/staging) |

---

## Optional (AI features: categorization, PDF parsing, recommendations)

| Variable | Where to get it | Link |
|----------|-----------------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API | [DeepSeek Platform](https://platform.deepseek.com/) → API Keys |

Without this, AI features (auto-categorize, PDF import, AI Insights) will return errors.

---

## Not used (do not add)

- ~~`OPENAI_API_KEY`~~ — This app uses DeepSeek (`DEEPSEEK_API_KEY`), not OpenAI.
