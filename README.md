This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Copy `.env.example` to `.env.local` and set at least `AUTH_SECRET`, `MONGODB_URI`, and (for dev) `DEV_PASSWORD`.

### Dev: auth and payment (no OAuth/PayPal)

- **Sign in:** Go to `/auth/signin`. In development a "Dev only" form appears. Use email `dev@localhost` (or `DEV_EMAIL`) and the value of `DEV_PASSWORD` from `.env.local`. First sign-in creates the user and starts the 3-day trial.
- **Grant/revoke PRO:** On `/pricing`, when signed in, use the "Dev: Grant PRO" / "Dev: Revoke PRO" buttons to toggle premium without PayPal. Only available when `NODE_ENV=development` or `DEV_ALLOW_GRANT_PRO=true`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Testing

- **Unit:** `npm run test` / `npm run test:ci`
- **E2E:** Run Selenium, then Puppeteer, then Playwright; fix after each until all pass. See [TESTING.md](TESTING.md) for the workflow and commands (`test:e2e:selenium`, `test:e2e:puppeteer`, `test:e2e:ci`).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
