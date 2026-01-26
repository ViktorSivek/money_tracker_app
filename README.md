# WealthOS - Personal Finance Dashboard

A mobile-first personal finance web application that acts as a "Decision Engine" for your finances. Built with Next.js 15, Supabase, and a modern dark theme.

![WealthOS](https://img.shields.io/badge/WealthOS-Personal%20Finance-00d4aa?style=for-the-badge)

## Features

- 📊 **Dashboard** - Net Worth, Liquid Cash, and Budget Health at a glance
- 💰 **Accounts** - Track bank accounts and cash balances
- 🎯 **Goals** - Virtual savings buckets for financial goals
- 📈 **Portfolio** - Investment tracking with P&L visualization
- 📝 **Transactions** - Read-only view of categorized transactions (via n8n automation)

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI + Tremor
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([create one here](https://supabase.com))

### 1. Clone and Install

```bash
git clone https://github.com/ViktorSivek/money_tracker_app.git
cd money_tracker_app
npm install
```

### 2. Set Up Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use an existing one
3. Go to **Settings > API** and copy your:
   - Project URL
   - Anon/Public key

### 3. Configure Environment

Copy the example environment file and add your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Migrations

1. Open your Supabase project's **SQL Editor**
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL to create all required tables

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login/Signup pages
│   ├── (dashboard)/      # Main app pages
│   ├── auth/callback/    # OAuth callback
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # Shadcn components
│   ├── dashboard/        # Dashboard-specific components
│   └── layout/           # Sidebar, bottom tabs
├── lib/
│   ├── supabase/         # Supabase client utilities
│   ├── utils.ts          # Helper functions
│   └── constants.ts      # App constants
└── types/
    └── database.ts       # TypeScript types for Supabase
```

## Database Schema

The app uses the following tables:

- `accounts` - Bank accounts and cash tracking
- `budgets` - Monthly budget limits per category
- `goals` - Savings goals ("virtual buckets")
- `investments` - Portfolio tracking
- `categories` - Predefined expense categories
- `transactions` - (Existing) Transaction data from n8n

See `supabase/migrations/001_initial_schema.sql` for the full schema.

## Key Concepts

### Transactions are Read-Only

This app doesn't import transactions. An external automation (n8n) handles bank transaction import and categorization. The app simply visualizes this data.

### Investment Prices from Database

Investment prices are updated by n8n automation, not fetched from APIs. The app reads `current_price` from the database.

### Goals as Virtual Buckets

Goals represent mental accounting - money "allocated" to goals reduces your Liquid Cash but doesn't actually move money between accounts.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

This app is configured for automated deployment to Vercel with CI/CD pipeline.

**📖 See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete setup instructions.**

Quick overview:

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Add GitHub secrets for CI pipeline
4. Push to `main` → Auto-deploy!

Every push to `main` triggers:

- ✅ ESLint checks
- ✅ TypeScript validation
- ✅ Security audit
- ✅ Build test
- ✅ Automatic Vercel deployment

## License

MIT

---

Built with ❤️ using Next.js and Supabase
