# WealthOS - Architecture Documentation

## Current State (2026-01-31)

### Overview
WealthOS is a personal finance management app built with Next.js 15, Supabase, and shadcn/ui. The app treats all money as ONE unified liquid cash account and focuses on budgeting with a simple planning system.

### Core Concept
- **No multiple accounts** - All money is treated as liquid cash
- **Plan-based budgeting** - Set expected income, distribute to budgets and investments
- **Real-time tracking** - Track actual spending vs planned with visual progress bars

---

## Database Schema

### Tables

#### `monthly_plan`
Stores user's monthly budget plan.
- `id` - UUID primary key
- `user_id` - Foreign key to auth.users (unique)
- `expected_income` - Expected monthly income (Kč)
- `investment_target` - Amount to allocate to investments
- `created_at`, `updated_at` - Timestamps

#### `budgets`
Category-specific spending limits.
- `id` - UUID primary key
- `user_id` - Foreign key to auth.users
- `category` - Expense category name
- `monthly_limit` - Spending limit for this category
- `emoji` - Visual icon for the category
- `created_at`, `updated_at` - Timestamps

#### `income`
Manual income entries (salary, freelance, etc.).
- `id` - UUID primary key
- `user_id` - Foreign key to auth.users
- `account_id` - Legacy field (nullable, previously linked to accounts)
- `amount` - Income amount
- `description` - Optional description
- `income_date` - Date of income
- `category` - Income category (Salary, Freelance, Investment, Bonus, Gift, Other)
- `created_at`, `updated_at` - Timestamps

#### `transactions`
Bank transactions imported from CSV or manual entries.
- `id` - Bigint primary key
- `transaction_date` - Date of transaction
- `amount` - Transaction amount (negative for expenses)
- `currency` - Currency code
- `original_description` - Raw description from bank
- `merchant_clean` - Cleaned merchant name
- `category` - Expense category
- `unique_id` - Unique identifier for deduplication

#### `categories`
Predefined expense categories.
- `id` - UUID primary key
- `name` - Category name (unique)
- `emoji` - Visual icon
- `color` - Theme color
- `is_active` - Whether category is active
- `sort_order` - Display order

#### `goals` (Legacy)
Financial goals with progress tracking.
- `id` - UUID primary key
- `user_id` - Foreign key to auth.users
- `name` - Goal name
- `target_amount` - Goal target
- `current_amount` - Current progress
- `emoji`, `color` - Visual styling
- `is_completed` - Completion status

#### `investments` (Legacy)
Investment portfolio tracking.
- `id` - UUID primary key
- `user_id` - Foreign key to auth.users
- `ticker` - Stock/asset ticker
- `name` - Asset name
- `quantity` - Number of shares/units
- `average_buy_price` - Average purchase price
- `current_price` - Current market price
- `currency` - Currency code
- `asset_type` - Type of asset (stock, crypto, etc.)

#### `accounts` (Deprecated)
Previously used for multiple account tracking. No longer actively used.
- RLS enabled but not actively displayed in UI
- Income table still has optional `account_id` for backwards compatibility

---

## Application Structure

### Pages

#### `/` - Dashboard
- Monthly overview (income, expenses, savings)
- Net worth and liquid cash cards
- Budget health overview
- Recent transactions

#### `/plan` - Budget Planning (NEW)
- Set expected monthly income
- Set investment target
- Create category budgets with spending limits
- View budget summary (income - budgets - investments = remaining)
- Real-time progress tracking with color-coded bars

#### `/transactions` - Transaction Management
- View all income and expenses
- Filter by category and date
- Add manual transactions
- Edit/delete transactions

#### `/goals` - Financial Goals
- Create and track financial goals
- Allocate money toward goals
- Track progress visually

#### `/portfolio` - Investment Portfolio
- Track stock/crypto holdings
- View P&L and performance

#### `/settings` - User Settings
- Account preferences
- Theme settings

### Navigation
- **Sidebar (Desktop)**: Dashboard, Plan, Goals, Portfolio, Transactions
- **Bottom Tabs (Mobile)**: Home, Plan, Transactions, Goals, Settings

---

## Recent Implementation (2026-01-31)

### What Changed: Accounts → Plan

Previously, the app had an "Accounts" page for tracking multiple bank accounts. This has been replaced with a "Plan" page for budget planning.

### New Features

#### 1. Monthly Plan Service (`/src/lib/services/plan.service.ts`)
Provides CRUD operations for:
- `getPlan()` - Get user's monthly plan
- `upsertPlan()` - Create or update plan
- `updateExpectedIncome()` - Update income target
- `updateInvestmentTarget()` - Update investment allocation
- `getBudgets()` - Get all category budgets
- `getBudgetsWithSpending()` - Get budgets with current spending
- `addBudget()` - Add new category budget
- `updateBudget()` - Update existing budget
- `deleteBudget()` - Remove budget
- `getPlanSummary()` - Calculate plan summary

#### 2. Plan Components (`/src/components/plan/`)

**Budget Progress Bar**
- Visual progress indicator
- Color coding: green (<80%), yellow (80-100%), red (>100%)
- Threshold marker at 100%
- Extends past threshold when overspent

**Income Target Card**
- Display expected monthly income
- Inline editing with save/cancel
- Updates monthly plan

**Investment Target Card**
- Display investment allocation
- Inline editing with save/cancel
- Updates monthly plan

**Category Budget Item**
- Shows single category with emoji
- Progress bar with spending vs limit
- Edit/delete actions via dropdown

**Category Budget List**
- Lists all budgets with progress
- Add new budget button
- Edit/delete dialogs

**Category Budget Dialog**
- Add or edit category budgets
- Category selection (from EXPENSE_CATEGORIES)
- Monthly limit input
- Prevents duplicate categories

**Plan Summary Card**
- Displays calculation: Expected Income - Budgeted - Investments = Remaining
- Color-coded remaining amount
- Warning when overspending

#### 3. Removed Account Dependencies

**Files Modified:**
- `add-income-dialog.tsx` - Removed account selection, simplified to just record income
- `monthly-overview.tsx` - Removed accounts prop
- `dashboard/page.tsx` - Removed accounts fetching and calculations
- `transactions/page.tsx` - Removed accounts fetching
- `transaction-list.tsx` - Removed accounts prop
- `sidebar.tsx` - Changed "Accounts" to "Plan"
- `bottom-tabs.tsx` - Changed "Accounts" to "Plan"

**Legacy Handling:**
- `accounts` table still exists but is not displayed
- `income.account_id` field is nullable and optional
- No data migration needed - old account links preserved

---

## Service Layer Architecture

### Pattern
All data operations go through service classes:
- `/src/lib/services/plan.service.ts` - Monthly plan operations
- `/src/lib/services/income.service.ts` - Income operations
- `/src/lib/services/expense.service.ts` - Expense operations
- `/src/lib/services/transaction.service.ts` - Transaction operations
- `/src/lib/services/monthly-summary.service.ts` - Summary calculations

### Service Structure
```typescript
class XyzService {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<ServiceResult<T[]>> { /* ... */ }
  async add(params): Promise<ServiceResult<T>> { /* ... */ }
  async update(id, params): Promise<ServiceResult<T>> { /* ... */ }
  async delete(id): Promise<ServiceResult<boolean>> { /* ... */ }
}

// Factory function
export function createXyzService(supabase: SupabaseClient): XyzService {
  return new XyzService(supabase);
}
```

### Result Type
```typescript
interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}
```

---

## Component Patterns

### Server Components (RSC)
- Pages that fetch data on the server
- Use `createClient()` from `@/lib/supabase/server`
- Example: `/src/app/(dashboard)/page.tsx`

### Client Components
- Interactive UI with state management
- Use `"use client"` directive
- Use `createClient()` from `@/lib/supabase/client`
- Example: `/src/components/plan/*`

### Data Fetching Pattern
```typescript
// Client component with data fetching
const [data, setData] = useState<T[]>([]);
const [isLoading, setIsLoading] = useState(true);

const fetchData = useCallback(async () => {
  setIsLoading(true);
  const supabase = createClient();
  const service = createXyzService(supabase);
  const result = await service.getAll();
  if (result.data) {
    setData(result.data);
  }
  setIsLoading(false);
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

---

## UI Component System

### Based on shadcn/ui
- Components in `/src/components/ui/`
- Built on Radix UI primitives
- Tailwind CSS for styling

### Custom Components
- `/src/components/dashboard/` - Dashboard-specific components
- `/src/components/plan/` - Plan page components
- `/src/components/transactions/` - Transaction components
- `/src/components/layout/` - Layout components (sidebar, bottom tabs)

### Styling Conventions
- Use `cn()` utility for conditional classes
- Consistent spacing: `gap-4`, `space-y-6`
- Color system:
  - `text-chart-2` - Green (positive, safe)
  - `text-yellow-500` - Yellow (warning)
  - `text-destructive` - Red (danger, overspent)

---

## Working with Memory / Context

### Best Practices for Future Sessions

#### 1. **Read This File First**
When starting a new session, read `ARCHITECTURE.md` to understand:
- Current app structure
- Database schema
- Recent changes
- Implementation patterns

#### 2. **Check Migration History**
Read migrations in order:
```bash
/supabase/migrations/
├── 001_initial_schema.sql
├── 002_income_table.sql
└── 003_monthly_plan.sql
```

#### 3. **Service Layer is Source of Truth**
Before implementing features:
- Check `/src/lib/services/` for existing methods
- Read service interfaces for available operations
- Use factory functions: `createPlanService(supabase)`

#### 4. **Component Patterns**
When adding new features:
- Follow existing patterns in `/src/components/`
- Use the same dialog/card/list structure
- Maintain consistent naming: `XyzCard`, `XyzDialog`, `XyzList`

#### 5. **Type Safety**
- All database types in `/src/types/database.ts`
- Update types when schema changes
- Use helper types: `MonthlyPlan`, `Budget`, etc.

#### 6. **Testing Changes**
```bash
# Check for TypeScript errors
npm run build

# Check for lint issues
npm run lint

# Run dev server
npm run dev
```

---

## Key Design Decisions

### Why Remove Accounts?
- **Simplification**: Most users have one main liquid account
- **Focus**: Budget planning is more valuable than account tracking
- **Legacy Support**: Accounts table remains for historical data

### Why Client-Side Plan Page?
- **Real-time Updates**: Immediate feedback when editing values
- **Interactivity**: Inline editing, drag-drop potential
- **User Experience**: Smooth transitions, no page reloads

### Why Service Layer?
- **Separation of Concerns**: UI doesn't know about database structure
- **Reusability**: Same service used in multiple components
- **Type Safety**: Consistent result types across the app
- **Testability**: Services can be tested independently

### Budget Progress Bar Design
- **Threshold Marker**: Visual guide at 100%
- **Color Coding**: Intuitive warning system
- **Overspend Extension**: Bar extends past 100% to show overrun
- **No Percentage Text**: Clean visual, numbers below

---

## Next Steps / Future Enhancements

### Potential Features
1. **Budget Templates** - Save and reuse monthly plans
2. **Rollover Budgets** - Unused budget carries to next month
3. **Budget Alerts** - Notifications when approaching limit
4. **Recurring Expenses** - Automatic categorization and tracking
5. **Income Forecasting** - Predict based on historical data
6. **Export Reports** - PDF/CSV budget reports
7. **Multi-Currency** - Support for multiple currencies
8. **Shared Plans** - Family budget planning

### Technical Improvements
1. **Optimistic UI Updates** - Update UI before server confirms
2. **Caching** - React Query for better data caching
3. **Real-time Sync** - Supabase real-time subscriptions
4. **PWA** - Offline support and mobile app feel
5. **Analytics** - Spending trends and insights
6. **AI Categorization** - Auto-categorize transactions with AI

---

## File Structure

```
/home/viktor/Projects/money_tracker_app/
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_income_table.sql
│       └── 003_monthly_plan.sql
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       ├── page.tsx                    # Dashboard
│   │       ├── plan/
│   │       │   └── page.tsx                # Plan page (NEW)
│   │       ├── transactions/
│   │       │   └── page.tsx                # Transactions
│   │       ├── goals/                      # Goals
│   │       ├── portfolio/                  # Portfolio
│   │       └── settings/                   # Settings
│   ├── components/
│   │   ├── ui/                             # shadcn components
│   │   ├── dashboard/                      # Dashboard components
│   │   ├── plan/                           # Plan components (NEW)
│   │   │   ├── budget-progress-bar.tsx
│   │   │   ├── income-target-card.tsx
│   │   │   ├── investment-target-card.tsx
│   │   │   ├── category-budget-item.tsx
│   │   │   ├── category-budget-list.tsx
│   │   │   ├── category-budget-dialog.tsx
│   │   │   ├── plan-summary-card.tsx
│   │   │   └── index.ts
│   │   ├── transactions/                   # Transaction components
│   │   └── layout/                         # Layout components
│   ├── lib/
│   │   ├── services/                       # Service layer
│   │   │   ├── plan.service.ts             # Plan CRUD (NEW)
│   │   │   ├── income.service.ts           # Income CRUD
│   │   │   ├── expense.service.ts          # Expense CRUD
│   │   │   ├── transaction.service.ts      # Transaction CRUD
│   │   │   ├── monthly-summary.service.ts  # Summary calculations
│   │   │   └── index.ts                    # Exports
│   │   ├── supabase/                       # Supabase clients
│   │   ├── utils.ts                        # Utility functions
│   │   └── constants.ts                    # App constants
│   └── types/
│       └── database.ts                     # TypeScript types
├── ARCHITECTURE.md                         # This file
├── README.md                               # Project README
└── package.json                            # Dependencies
```

---

## Environment Setup

### Required Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
NODE_ENV=development
```

### Development Commands
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build production
npm run build

# Run linter
npm run lint

# Run tests (if configured)
npm test
```

---

## Database Security

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- **SELECT**: `auth.uid() = user_id`
- **INSERT**: `auth.uid() = user_id`
- **UPDATE**: `auth.uid() = user_id`
- **DELETE**: `auth.uid() = user_id` (where applicable)

### Exceptions
- `categories` table - Public read access
- `transactions` table - Currently has permissive policy (needs review)

### Security Advisories
Run periodic checks:
```bash
# Via Supabase MCP
mcp__claude_ai_Supabase__get_advisors --type=security
```

---

## Support & Troubleshooting

### Common Issues

**Build Errors**
- Check TypeScript types in `/src/types/database.ts`
- Ensure all imports are correct
- Run `npm run build` to see specific errors

**RLS Policy Errors**
- Verify user is authenticated
- Check policy definitions in migrations
- Test with different users

**Data Not Showing**
- Check browser console for errors
- Verify Supabase connection
- Check service layer error handling

**Styling Issues**
- Clear Tailwind cache: `rm -rf .next`
- Check `cn()` utility usage
- Verify shadcn components are installed

---

## Changelog

### 2026-01-31 - Plan Page Implementation
- ✅ Created `monthly_plan` table with RLS
- ✅ Implemented `PlanService` with CRUD operations
- ✅ Built Plan page with budget planning UI
- ✅ Created progress bar components
- ✅ Removed account dependencies from app
- ✅ Updated navigation (Accounts → Plan)
- ✅ Updated AddIncomeDialog to remove account selection

---

## Credits & Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **UI**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript
- **Deployment**: Vercel (configured)
