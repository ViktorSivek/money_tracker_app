# WealthOS - MVP Implementation Plan

**Goal:** Track income, expenses, and savings on a monthly basis.

---

## MVP Scope

### Core User Stories

1. **As a user, I want to add my monthly income** so I can track how much I earn.
2. **As a user, I want to see my expenses by month** so I can understand my spending.
3. **As a user, I want to see how much I save each month** (Income - Expenses).
4. **As a user, I want to filter transactions by month** to analyze specific periods.
5. **As a user, I want to see a summary of all months** to track trends over time.

---

## Data Model

### Income Tracking Approach

**Decision:** Create a simple `income` table for manual income entries.

```sql
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT,                    -- e.g., "Salary", "Freelance"
  income_date DATE NOT NULL,
  category TEXT DEFAULT 'Salary',      -- Salary, Freelance, Investment, Other
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Existing Tables Used

- `transactions` - Expenses from n8n (negative amounts)
- `accounts` - For updating balances when income is added

---

## Feature Breakdown

### Phase 1: Income Management

**Components:**

- `AddIncomeDialog` - Form to add income entry
- `IncomeList` - Display income entries

**Functionality:**

- Add income with: amount, date, description, category
- Option to also update account balance when adding income
- View list of income entries

**UI Location:**

- "Add Income" button on Dashboard
- Income section in Settings or dedicated page

---

### Phase 2: Monthly Overview Dashboard

**Components:**

- `MonthSelector` - Navigate between months (← Jan 2026 →)
- `MonthlyIncomeCard` - Total income for selected month
- `MonthlyExpensesCard` - Total expenses for selected month
- `MonthlySavingsCard` - Income - Expenses

**Dashboard Layout:**

```
┌─────────────────────────────────────────┐
│     ← January 2026 →    [Add Income]    │
├─────────────┬─────────────┬─────────────┤
│   Income    │  Expenses   │   Savings   │
│  +85,000 Kč │  -42,000 Kč │  +43,000 Kč │
├─────────────┴─────────────┴─────────────┤
│         Budget Health (existing)         │
├─────────────────────────────────────────┤
│       Recent Transactions (existing)     │
└─────────────────────────────────────────┘
```

---

### Phase 3: Transactions Page

**Components:**

- `TransactionsList` - Paginated list of transactions
- `MonthFilter` - Filter by month
- `CategoryFilter` - Filter by category
- `CategoryBreakdown` - Spending by category chart

**Features:**

- View all transactions
- Filter by month (default: current month)
- Filter by category
- Show category breakdown (pie chart or bar chart)
- Search transactions

---

### Phase 4: Monthly Summary View (Optional Enhancement)

**Components:**

- `MonthlySummaryTable` - All months overview

**Layout:**

```
┌──────────┬──────────┬──────────┬──────────┐
│  Month   │  Income  │ Expenses │ Savings  │
├──────────┼──────────┼──────────┼──────────┤
│ Jan 2026 │ 85,000   │ 42,000   │ 43,000   │
│ Dec 2025 │ 85,000   │ 55,000   │ 30,000   │
│ Nov 2025 │ 85,000   │ 38,000   │ 47,000   │
└──────────┴──────────┴──────────┴──────────┘
```

---

## Implementation Order

```
1. [ ] Database: Add income table migration
2. [ ] Add Income Dialog component
3. [ ] Month Selector component
4. [ ] Update Dashboard with monthly cards
5. [ ] Transactions page with filters
6. [ ] Category breakdown visualization
7. [ ] (Optional) Monthly summary table
```

---

## UI/UX Guidelines

- **Keep the dark "Cyberpunk Fintech" theme**
- **Monospace fonts for all numbers**
- **Color coding:**
  - Green (chart-2): Income, Savings (positive)
  - Red (destructive): Expenses (negative)
  - Cyan (primary): Neutral/interactive elements
- **Mobile-first:** All features must work on mobile

---

## API Endpoints Needed

All data fetching via Supabase client:

```typescript
// Income
supabase.from('income').select('*').eq('user_id', userId)
supabase.from('income').insert({ ... })

// Monthly totals
supabase.from('income')
  .select('amount')
  .gte('income_date', startOfMonth)
  .lte('income_date', endOfMonth)

supabase.from('transactions')
  .select('amount, category')
  .gte('transaction_date', startOfMonth)
  .lte('transaction_date', endOfMonth)
```

---

## Success Criteria

MVP is complete when:

- [ ] User can add income entries
- [ ] Dashboard shows current month's income, expenses, savings
- [ ] User can navigate to previous months
- [ ] Transactions page shows filtered list
- [ ] Category breakdown is visible

---

## Future Enhancements (Post-MVP)

- Recurring income (auto-add monthly salary)
- Budget alerts when overspending
- Export monthly reports
- Spending trends chart (line graph over months)
- Income vs Expenses comparison chart
