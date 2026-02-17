# E2E Testing: Selenium, Puppeteer, Playwright

## Shared critical flows (all three tools)

All three E2E suites (Selenium, Puppeteer, Playwright) cover the same behavior:

1. **Auth:** Sign-in page loads; Google and GitHub buttons visible; Terms and Privacy links visible.
2. **Legal:** Terms page loads and shows disclaimer; Privacy page loads.
3. **Pricing:** Pricing page loads (after possible redirect); "Choose Your Plan", Free, PRO visible.
4. **Protected route:** Unauthenticated visit to `/recommendations` redirects to sign-in.
5. **Public routes:** `/terms` and `/privacy` load without redirect.

Optional later: dev login + add expense + hit limit + upgrade prompt; PayPal button present when plan ID set.

---

## Test-then-fix workflow

After the product is ready, run E2E in this order and fix after each until all pass:

1. **Start app:** `npm run dev` (or let Playwright start it via webServer).
2. **Selenium:** `npm run test:e2e:selenium` — fix any failures (app or selectors), re-run until green.
3. **Puppeteer:** `npm run test:e2e:puppeteer` — fix failures, re-run until green.
4. **Playwright:** `npm run test:e2e:ci` — fix failures, re-run until green.
5. Repeat 2–4 as needed until all three are stable.

---

## Commands

| Tool       | Command                 |
| ---------- | ----------------------- |
| Selenium   | `npm run test:e2e:selenium` |
| Puppeteer  | `npm run test:e2e:puppeteer` |
| Playwright | `npm run test:e2e` or `npm run test:e2e:ci` |

For Selenium and Puppeteer, ensure the dev server is running on `http://localhost:3000` (or set `BASE_URL`). Playwright starts the server automatically when not in CI.
