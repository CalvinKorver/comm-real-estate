# Keystone Commercial Real Estate

## Overview
A commercial real estate investment management platform built with Next.js, Prisma, NextAuth, and Vercel Postgres.

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/comm-real-estate.git
cd comm-real-estate
```

### 2. Install dependencies
```bash
npm install
```

Install colima

colima start --cpu 1 --memory 2 --disk 10

### 3. Set up environment variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

- `DATABASE_URL` (Vercel Postgres connection string)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX`, `MAILCHIMP_LIST_ID`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`

### 4. Set up the database
Run Prisma migrations to set up your Postgres database:
```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Run locally
```bash
npm run dev
```

## Deployment

### Deploying to Vercel
1. Push your code to GitHub.
2. Import your repo into [Vercel](https://vercel.com/).
3. Set all environment variables in the Vercel dashboard.
4. Vercel will automatically build and deploy your app.

### Database
- Use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres/overview) for production.
- Update your `DATABASE_URL` accordingly.

## Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npx prisma migrate deploy` — Deploy migrations
- `npx prisma generate` — Generate Prisma client

## License
MIT
