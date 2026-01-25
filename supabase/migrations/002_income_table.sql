-- WealthOS - Income Table Migration
-- Run this in Supabase SQL Editor after 001_initial_schema.sql
-- ================================

-- ================================
-- INCOME TABLE
-- Manual income entries (salary, freelance, etc.)
-- ================================
CREATE TABLE IF NOT EXISTS income (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,  -- Optional: link to account for balance update
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT,                                             -- e.g., "January Salary", "Freelance project"
  income_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Salary',                      -- Salary, Freelance, Investment, Bonus, Other
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- RLS Policies for income
CREATE POLICY "Users can view own income" ON income
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income" ON income
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income" ON income
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own income" ON income
  FOR DELETE USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE TRIGGER update_income_updated_at
  BEFORE UPDATE ON income
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON income(income_date);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, income_date);

-- ================================
-- INCOME CATEGORIES (Reference)
-- ================================
-- These are the supported income categories:
-- - Salary       (regular employment income)
-- - Freelance    (contract/gig work)
-- - Investment   (dividends, interest, capital gains)
-- - Bonus        (one-time bonuses)
-- - Gift         (received gifts/transfers)
-- - Other        (miscellaneous income)

-- ================================
-- FUNCTION: Add income with optional account balance update
-- ================================
CREATE OR REPLACE FUNCTION add_income_with_balance_update(
  p_user_id UUID,
  p_account_id UUID,
  p_amount NUMERIC,
  p_description TEXT,
  p_income_date DATE,
  p_category TEXT DEFAULT 'Salary'
)
RETURNS UUID AS $$
DECLARE
  v_income_id UUID;
BEGIN
  -- Insert income record
  INSERT INTO income (user_id, account_id, amount, description, income_date, category)
  VALUES (p_user_id, p_account_id, p_amount, p_description, p_income_date, p_category)
  RETURNING id INTO v_income_id;
  
  -- Update account balance if account_id is provided
  IF p_account_id IS NOT NULL THEN
    UPDATE accounts
    SET balance = balance + p_amount
    WHERE id = p_account_id AND user_id = p_user_id;
  END IF;
  
  RETURN v_income_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- VIEW: Monthly Income Summary
-- ================================
CREATE OR REPLACE VIEW monthly_income_summary AS
SELECT 
  user_id,
  DATE_TRUNC('month', income_date)::DATE as month,
  SUM(amount) as total_income,
  COUNT(*) as income_count,
  jsonb_object_agg(
    COALESCE(category, 'Other'),
    category_total
  ) as by_category
FROM (
  SELECT 
    user_id,
    income_date,
    category,
    SUM(amount) OVER (PARTITION BY user_id, DATE_TRUNC('month', income_date), category) as category_total,
    amount
  FROM income
) sub
GROUP BY user_id, DATE_TRUNC('month', income_date);

-- ================================
-- DONE!
-- ================================
-- After running this migration:
-- 1. Check that income table is created
-- 2. Verify RLS policies are enabled
-- 3. Test the add_income_with_balance_update function
