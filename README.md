This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Before starting the app, configure environment variables:

1. Create `.env.local` in the project root.
2. Add at least these required values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

You can use `.env.local.example` as a reference for all supported variables.

Optional Google Analytics setup:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-QQ3QZ7VG0K
```

When this variable is set, the app loads the Google Analytics tag globally from the root layout.

Optional billing setup with LemonSqueezy:

```bash
LEMONSQUEEZY_API_KEY=YOUR_LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_STORE_ID=YOUR_LEMONSQUEEZY_STORE_ID
LEMONSQUEEZY_VARIANT_ID_START=YOUR_START_VARIANT_ID
LEMONSQUEEZY_VARIANT_ID_PRO=YOUR_PRO_VARIANT_ID
LEMONSQUEEZY_VARIANT_ID_BUSINESS=YOUR_BUSINESS_VARIANT_ID
LEMONSQUEEZY_WEBHOOK_SECRET=YOUR_LEMONSQUEEZY_WEBHOOK_SECRET
LEMONSQUEEZY_TEST_MODE=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For backwards compatibility, `LEMONSQUEEZY_VARIANT_ID` still works and is treated as the `pro` plan.

When these variables are set, the app can create hosted LemonSqueezy checkout links through `POST /api/billing/checkout`.

To sync billing status back into Supabase, configure a LemonSqueezy webhook pointing to `/api/billing/webhook` and run the subscriptions migration in `supabase/migrations/20260329_billing_subscriptions.sql`.

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
