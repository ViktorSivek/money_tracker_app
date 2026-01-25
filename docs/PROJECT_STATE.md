# WealthOS - Project State

**Last Updated:** January 25, 2026  
**Version:** 0.2.0 (MVP Phase 1)  
**Status:** ✅ Stable - Income Management Implemented

---

## Current Implementation Status

### ✅ Completed (Foundation + MVP Phase 1)

| Feature              | Status  | Notes                                       |
| -------------------- | ------- | ------------------------------------------- |
| Next.js 15 Setup     | ✅ Done | App Router, TypeScript, Turbopack           |
| Tailwind CSS v4      | ✅ Done | Dark theme, custom colors                   |
| Shadcn/UI Components | ✅ Done | Button, Card, Dialog, Form, etc.            |
| Tremor Charts        | ✅ Done | Area & Bar charts with toggle               |
| Supabase Auth        | ✅ Done | Email/Password login & signup               |
| Auth Middleware      | ✅ Done | Protected routes                            |
| Responsive Layout    | ✅ Done | Desktop sidebar + Mobile bottom tabs        |
| Dashboard UI         | ✅ Done | Net Worth, Liquid Cash, Budget Health cards |
| Database Schema      | ✅ Done | SQL migrations ready (001, 002)             |
| Income Management    | ✅ Done | Add income with account balance update      |
| Monthly Overview     | ✅ Done | Month selector, summary cards, trend chart  |

### 🔲 Not Yet Implemented

| Feature            | Priority | Notes                     |
| ------------------ | -------- | ------------------------- |
| Transactions Page  | HIGH     | List with filters         |
| Category Breakdown | HIGH     | Pie/bar chart by category |
| Accounts Page      | MEDIUM   | Balance management        |
| Goals Page         | MEDIUM   | Savings buckets           |
| Portfolio Page     | LOW      | Investment tracking       |
| Settings Page      | LOW      | User preferences          |

---

## Tech Stack

```
Frontend:
├── Next.js 15.x (App Router)
├── TypeScript
├── Tailwind CSS v4
├── Shadcn/UI
├── Tremor (charts)
└── Lucide Icons

Backend:
├── Supabase (PostgreSQL)
├── Supabase Auth
└── n8n (external - transaction import)

Deployment:
└── Vercel (planned)
```

---

## Database Tables

### Existing (from n8n)

- `transactions` - Bank transactions (expenses only, negative amounts)

### Created by Migration (001_initial_schema.sql)

- `accounts` - Bank accounts, cash tracking
- `budgets` - Monthly budget limits per category
- `goals` - Savings goals (virtual buckets)
- `investments` - Portfolio tracking
- `categories` - Predefined expense categories

### Created by Migration (002_income_table.sql) - NEW

- `income` - Manual income entries with optional account balance update
- `add_income_with_balance_update()` - PostgreSQL function for atomic income + balance update

---

## File Structure

```
src/
├── app/
│   ├── (auth)/              # Login, Signup
│   ├── (dashboard)/         # Main app (protected)
│   │   ├── page.tsx         # Dashboard home
│   │   └── layout.tsx       # Sidebar/tabs layout
│   └── auth/callback/       # OAuth callback
├── components/
│   ├── ui/                  # Shadcn components
│   ├── dashboard/           # Dashboard components
│   │   ├── index.ts         # Clean exports
│   │   ├── net-worth-card.tsx
│   │   ├── liquid-cash-card.tsx
│   │   ├── budget-health-card.tsx
│   │   ├── month-selector.tsx
│   │   ├── monthly-summary-cards.tsx
│   │   ├── monthly-trend-chart.tsx
│   │   ├── monthly-overview.tsx
│   │   └── add-income-dialog.tsx
│   └── layout/              # Sidebar, bottom tabs
├── lib/
│   ├── supabase/            # Client utilities
│   ├── services/            # Business logic (clean architecture)
│   │   ├── index.ts
│   │   ├── income.service.ts
│   │   └── monthly-summary.service.ts
│   ├── utils.ts             # Helpers
│   └── constants.ts         # Config
└── types/
    └── database.ts          # TypeScript types + Income types
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Known Issues / Notes

1. **Middleware Warning**: Next.js 16 shows deprecation warning for middleware - can be ignored for now
2. **Tremor + React 19**: Using `--legacy-peer-deps` due to peer dependency conflict
3. **Transactions Table**: Assumes n8n populates this with negative amounts for expenses

---

## Next Steps

### Immediate (Before Using)

1. **Run Migration**: Execute `002_income_table.sql` in Supabase SQL Editor
2. **Create Account**: Add at least one account (e.g., "Revolut", "Cash") to link income to

### MVP Phase 2 (Next Session)

1. **Transactions Page** - View all transactions with month/category filters
2. **Category Breakdown** - Pie chart showing spending by category
3. **Income List** - View/edit/delete income entries

### Future Enhancements

- Recurring income (auto-add monthly salary)
- Budget alerts when overspending
- Export monthly reports
- Multi-user support (share with partner)

---

## Git History

- `0bf47d3` - Initial commit
- `c1baa99` - Foundation complete (auth, dashboard UI, layout)
- `[current]` - MVP Phase 1: Income management, monthly overview, trend charts
