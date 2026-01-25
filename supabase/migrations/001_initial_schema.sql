-- WealthOS Database Schema
-- Run this in Supabase SQL Editor
-- ================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- ACCOUNTS TABLE
-- Bank accounts and cash tracking
-- ================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance NUMERIC(15, 2) DEFAULT 0,
  currency TEXT DEFAULT 'CZK',
  is_investment BOOLEAN DEFAULT false,
  icon TEXT DEFAULT '💳',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);

-- ================================
-- CATEGORIES TABLE
-- Predefined expense categories
-- ================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert predefined categories
INSERT INTO categories (name, emoji, color, sort_order) VALUES
  ('Housing', '🏠', '#8b5cf6', 1),
  ('Food & Groceries', '🛒', '#22c55e', 2),
  ('Restaurants & Dining', '🍽️', '#f97316', 3),
  ('Transportation', '🚗', '#3b82f6', 4),
  ('Healthcare', '💊', '#ef4444', 5),
  ('Entertainment', '🎬', '#ec4899', 6),
  ('Shopping', '🛍️', '#a855f7', 7),
  ('Subscriptions', '📱', '#06b6d4', 8),
  ('Travel', '✈️', '#14b8a6', 9),
  ('Education', '📚', '#f59e0b', 10),
  ('Personal Care', '💇', '#d946ef', 11),
  ('Gifts & Donations', '🎁', '#f43f5e', 12),
  ('Investments', '📈', '#10b981', 13),
  ('Fees & Charges', '🏦', '#64748b', 14),
  ('Income', '💰', '#22c55e', 15),
  ('Other', '📦', '#94a3b8', 99)
ON CONFLICT (name) DO NOTHING;

-- Categories are global, no RLS needed (read-only for users)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- ================================
-- BUDGETS TABLE
-- Monthly budget limits per category
-- ================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  monthly_limit NUMERIC(15, 2) NOT NULL,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budgets
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- ================================
-- GOALS TABLE
-- Savings goals ("Virtual Buckets")
-- ================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) DEFAULT 0,
  emoji TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#6366f1',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goals
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- ================================
-- INVESTMENTS TABLE
-- Portfolio tracking (prices updated by n8n)
-- ================================
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  name TEXT,
  quantity NUMERIC(15, 6) NOT NULL,
  average_buy_price NUMERIC(15, 4) NOT NULL,
  current_price NUMERIC(15, 4),
  currency TEXT DEFAULT 'USD',
  asset_type TEXT DEFAULT 'stock', -- 'stock', 'crypto', 'etf'
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, ticker)
);

-- Enable RLS
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investments
CREATE POLICY "Users can view own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments" ON investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments" ON investments
  FOR DELETE USING (auth.uid() = user_id);

-- ================================
-- UPDATE TRIGGERS
-- Auto-update 'updated_at' columns
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_ticker ON investments(ticker);

-- ================================
-- VIEWS FOR DASHBOARD CALCULATIONS
-- ================================

-- View: Net Worth calculation
CREATE OR REPLACE VIEW user_net_worth AS
SELECT 
  user_id,
  COALESCE(SUM(balance), 0) as total_accounts,
  0 as total_investments, -- Will be calculated in app with current prices
  COALESCE(SUM(balance), 0) as net_worth
FROM accounts
GROUP BY user_id;

-- View: Liquid Cash calculation
CREATE OR REPLACE VIEW user_liquid_cash AS
SELECT 
  a.user_id,
  COALESCE(SUM(a.balance) FILTER (WHERE a.is_investment = false), 0) as total_liquid_accounts,
  COALESCE((SELECT SUM(current_amount) FROM goals g WHERE g.user_id = a.user_id), 0) as total_allocated_goals,
  COALESCE(SUM(a.balance) FILTER (WHERE a.is_investment = false), 0) - 
    COALESCE((SELECT SUM(current_amount) FROM goals g WHERE g.user_id = a.user_id), 0) as liquid_cash
FROM accounts a
GROUP BY a.user_id;

-- ================================
-- SAMPLE DATA (Optional - for testing)
-- Uncomment to insert test data
-- ================================

/*
-- Test user accounts (replace USER_ID with actual user UUID after signup)
INSERT INTO accounts (user_id, name, balance, currency, is_investment, icon) VALUES
  ('USER_ID', 'Revolut', 50000.00, 'CZK', false, '💳'),
  ('USER_ID', 'Cash', 5000.00, 'CZK', false, '💵'),
  ('USER_ID', 'Savings', 100000.00, 'CZK', false, '🏦');

-- Test budgets
INSERT INTO budgets (user_id, category, monthly_limit, emoji) VALUES
  ('USER_ID', 'Food & Groceries', 8000.00, '🛒'),
  ('USER_ID', 'Restaurants & Dining', 5000.00, '🍽️'),
  ('USER_ID', 'Transportation', 3000.00, '🚗'),
  ('USER_ID', 'Entertainment', 2000.00, '🎬'),
  ('USER_ID', 'Subscriptions', 1500.00, '📱');

-- Test goals
INSERT INTO goals (user_id, name, target_amount, current_amount, emoji) VALUES
  ('USER_ID', 'New MacBook', 50000.00, 15000.00, '💻'),
  ('USER_ID', 'Emergency Fund', 150000.00, 80000.00, '🛡️'),
  ('USER_ID', 'Vacation', 30000.00, 5000.00, '✈️');

-- Test investments
INSERT INTO investments (user_id, ticker, name, quantity, average_buy_price, current_price, currency, asset_type) VALUES
  ('USER_ID', 'AAPL', 'Apple Inc.', 10, 150.00, 175.00, 'USD', 'stock'),
  ('USER_ID', 'BTC', 'Bitcoin', 0.5, 30000.00, 42000.00, 'USD', 'crypto'),
  ('USER_ID', 'VOO', 'Vanguard S&P 500', 5, 400.00, 450.00, 'USD', 'etf');
*/

-- ================================
-- DONE!
-- ================================
-- After running this migration:
-- 1. Check that all tables are created in Supabase Table Editor
-- 2. Verify RLS policies are enabled
-- 3. Create a test user via Supabase Auth
-- 4. Optionally run the sample data (uncomment above)
