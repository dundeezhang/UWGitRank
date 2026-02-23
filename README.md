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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database (Supabase)

If you see **"Tenant or user not found"** in logs when using the connection pooler, your `DATABASE_URL` username format is wrong.

Supabase's pooler requires the **username to include the project ref**:

- **Correct:** `postgres.[PROJECT_REF]` (e.g. `postgres.htnzmjxayxdeqrtispvf`)
- **Wrong:** `postgres` alone

Use the **Session** or **Transaction** connection string from **Supabase → Project Settings → Database**. It will look like:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST].pooler.supabase.com:[PORT]/postgres
```

- Session mode: port **5432**
- Transaction mode: port **6543**

Copy the full string from the dashboard (don't build it by hand) and set it as `DATABASE_URL` in Vercel (or your host) so production uses the same format.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
