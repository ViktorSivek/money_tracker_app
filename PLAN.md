# WealthOS - Personal Finance Dashboard

## Project Overview

A mobile-first personal finance web application that acts as a "Decision Engine" for finances. The app visualizes data that is already being ingested into Supabase by an external automation (n8n).

**Key Principle**: This app READS and VISUALIZES data. It does NOT import transactions or fetch live prices - those are handled by external automations.

---

## Tech Stack

| Layer              | Technology                              |
| ------------------ | --------------------------------------- |
| Framework          | Next.js 15 (App Router) + TypeScript    |
| Authentication     | Supabase Auth (Email/Password)          |
| Database           | Supabase (PostgreSQL)                   |
| Styling            | Tailwind CSS                            |
| UI Components      | Shadcn/UI (layouts, forms, dialogs)     |
| Data Visualization | Tremor.so (charts, KPIs, progress bars) |
| Icons              | Lucide React                            |
| Hosting            | Vercel                                  |

---

## Database Schema

### Existing Table (Reference)

```sql
-- Already exists, managed by n8n automation
transactions (
  id,
  transaction_date,
  amount,           -- NEGATIVE values for expenses
  currency,
  original_description,
  merchant_clean,
  category,
  unique_id
)
```

### New Tables to Create

```sql
-- Bank accounts and cash tracking
accounts (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,           -- e.g., "Revolut", "Cash"
  balance NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'CZK',
  is_investment BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Budget limits per category
budgets (
  id UUID PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  monthly_limit NUMERIC NOT NULL,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Savings goals ("Virtual Buckets")
goals (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,           -- e.g., "New Mac"
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Investment portfolio (prices updated by n8n)
investments (
  ticker TEXT PRIMARY KEY,
  name TEXT,
  quantity NUMERIC NOT NULL,
  average_buy_price NUMERIC NOT NULL,
  current_price NUMERIC,        -- Updated by n8n automation
  currency TEXT DEFAULT 'USD',
  last_updated TIMESTAMPTZ
)

-- Predefined categories for budgeting
categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  emoji TEXT,
  color TEXT,                   -- For UI visualization
  is_active BOOLEAN DEFAULT true
)
```

---

## Predefined Categories

| Category             | Emoji | Description                     |
| -------------------- | ----- | ------------------------------- |
| Housing              | 🏠    | Rent, mortgage, utilities       |
| Food & Groceries     | 🛒    | Supermarkets, grocery stores    |
| Restaurants & Dining | 🍽️    | Restaurants, cafes, takeout     |
| Transportation       | 🚗    | Fuel, public transport, parking |
| Healthcare           | 💊    | Pharmacy, doctors, insurance    |
| Entertainment        | 🎬    | Movies, games, streaming        |
| Shopping             | 🛍️    | Clothing, electronics, general  |
| Subscriptions        | 📱    | Software, services, memberships |
| Travel               | ✈️    | Hotels, flights, vacation       |
| Education            | 📚    | Courses, books, learning        |
| Personal Care        | 💇    | Haircuts, cosmetics             |
| Gifts & Donations    | 🎁    | Presents, charity               |
| Investments          | 📈    | Stock purchases, crypto         |
| Fees & Charges       | 🏦    | Bank fees, ATM charges          |
| Other                | 📦    | Uncategorized expenses          |

---

## Core Features & Business Logic

### A. Dashboard (Command Center)

**1. Net Worth Card**

```
Formula: SUM(accounts.balance) + SUM(investments.quantity * investments.current_price)
```

**2. Liquid Cash Card**

```
Formula: SUM(accounts WHERE is_investment=false) - SUM(goals.current_amount)
Context: If bank has 100k but 20k allocated to goals, Liquid Cash = 80k
```

**3. Budget Health Card**

- List categories from `budgets` table
- Calculate spent this month: `SUM(transactions.amount) WHERE category=X AND month=current`
- Progress bar colors:
  - 🟢 Green: < 80% of limit
  - 🟡 Yellow: 80-100% of limit
  - 🔴 Red: > 100% of limit

### B. Accounts Page

- List all accounts with balances
- "Update Balance" button → Dialog to set current real-world balance
- Shows last updated timestamp

### C. Goals Page

- Grid of goal cards
- Progress bar: `current_amount / target_amount`
- "Add Funds" action → Moves money from Liquid to Allocated (mental accounting)
- "Withdraw Funds" action → Returns money to Liquid

### D. Investment Portfolio

- Table columns: Ticker, Name, Quantity, Avg Buy Price, Current Price, Current Value, P&L
- P&L calculation: `(current_price - average_buy_price) * quantity`
- Color coding: Green for profit, Red for loss
- Badge: "Prices updated: X hours ago" from `last_updated`

### E. Transactions Page

- Read-only view of transactions from n8n
- Filtering by category, date range
- Monthly spending breakdown

### F. Settings Page

- Manage categories (add/edit/disable)
- Currency preference (CZK/EUR/USD) - future feature
- Theme toggle (dark/light) - future feature

---

## Visual Design

### Theme

- **Default**: Dark mode
- **Aesthetic**: Professional "Cyberpunk Fintech" - clean, not cluttered
- **Colors**:
  - Background: Dark grays (#0a0a0a, #1a1a1a)
  - Accent: Cyan/Teal for positive, Red for negative
  - Cards: Subtle borders, glass-morphism optional

### Layout

- **Desktop**: Sidebar navigation (left)
- **Mobile**: Bottom tab bar (5 tabs max)
  - Dashboard, Transactions, Goals, Portfolio, Settings

### Typography

- **Primary**: Geist Sans or Inter
- **Numbers**: Monospace font (Geist Mono, JetBrains Mono)
- **Currency**: Always formatted with locale (e.g., "12 500 Kč")

---

## Implementation Phases

### Phase 1: Foundation ✅

- [x] Create project plan (this document)
- [x] Generate SQL migrations
- [x] Initialize Next.js 15 project
- [x] Install dependencies (Tailwind, Shadcn, Tremor)
- [x] Configure Supabase client
- [x] Set up authentication middleware
- [x] Create responsive layout (sidebar + bottom tabs)

### Phase 2: Dashboard ✅

- [x] Net Worth KPI component
- [x] Liquid Cash KPI component
- [x] Budget Health component with progress bars
- [x] Recent transactions preview

### Phase 3: Core Pages 📄

- [ ] Accounts page with balance update
- [ ] Goals page with fund allocation
- [ ] Transactions page (read-only list)
- [ ] Investment portfolio table

### Phase 4: Polish ⏳

- [x] Authentication pages (login/signup)
- [ ] Loading states & skeletons
- [ ] Error handling & toasts
- [ ] Mobile responsiveness testing
- [ ] Vercel deployment

### Phase 5: Future Enhancements 🚀

- [ ] Multi-currency support with conversion
- [ ] Light/Dark theme toggle
- [ ] Export reports (PDF/CSV)
- [ ] Recurring transactions tracking
- [ ] Budget alerts/notifications

---

## File Structure (Planned)

```
money_tracker_app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar/tabs layout
│   │   ├── page.tsx            # Dashboard home
│   │   ├── accounts/page.tsx
│   │   ├── goals/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── portfolio/page.tsx
│   │   └── settings/page.tsx
│   ├── layout.tsx              # Root layout
│   └── globals.css
├── components/
│   ├── ui/                     # Shadcn components
│   ├── dashboard/
│   │   ├── net-worth-card.tsx
│   │   ├── liquid-cash-card.tsx
│   │   └── budget-health.tsx
│   ├── accounts/
│   ├── goals/
│   ├── portfolio/
│   └── layout/
│       ├── sidebar.tsx
│       └── bottom-tabs.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils.ts
│   └── constants.ts
├── types/
│   └── database.ts             # Supabase types
├── hooks/
│   ├── use-accounts.ts
│   ├── use-goals.ts
│   └── use-transactions.ts
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Notes & Decisions

1. **Transactions are read-only** - n8n handles import and categorization
2. **Investment prices from DB** - n8n updates `current_price`, no API calls
3. **Single currency (CZK) for MVP** - Multi-currency is Phase 5
4. **Categories are predefined** - Can be managed in Settings
5. **Goals are "virtual buckets"** - Mental accounting, not real transfers

---

## Getting Started (Next Steps)

1. Run SQL migration in Supabase
2. Scaffold Next.js project
3. Install and configure dependencies
4. Build dashboard components
5. Iterate based on feedback
