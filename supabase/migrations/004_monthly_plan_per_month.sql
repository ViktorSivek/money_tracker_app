-- Transform monthly_plan to be month-specific
-- Instead of one plan per user, allow one plan per user per month
-- ================================

-- Drop the unique constraint on user_id
ALTER TABLE monthly_plan DROP CONSTRAINT IF EXISTS monthly_plan_user_id_key;

-- Add month column (format: YYYY-MM-DD, but only year-month matters)
-- We'll store first day of the month
ALTER TABLE monthly_plan ADD COLUMN IF NOT EXISTS month DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date;

-- Add unique constraint on (user_id, month) instead
ALTER TABLE monthly_plan ADD CONSTRAINT monthly_plan_user_month_unique UNIQUE (user_id, month);

-- Update index
DROP INDEX IF EXISTS idx_monthly_plan_user_id;
CREATE INDEX IF NOT EXISTS idx_monthly_plan_user_month ON monthly_plan(user_id, month);

-- ================================
-- DONE!
-- ================================
-- After running this migration:
-- 1. Users can now have multiple plans (one per month)
-- 2. Each month has its own expected_income and investment_target
-- 3. The plan page will show month-by-month planning
