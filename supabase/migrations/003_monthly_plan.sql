-- WealthOS - Monthly Plan Table Migration
-- Run this in Supabase SQL Editor after 002_income_table.sql
-- ================================

-- ================================
-- MONTHLY PLAN TABLE
-- Stores user's expected income and investment target
-- ================================
CREATE TABLE IF NOT EXISTS monthly_plan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expected_income NUMERIC(15, 2) NOT NULL DEFAULT 0,
  investment_target NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE monthly_plan ENABLE ROW LEVEL SECURITY;

-- RLS Policies for monthly_plan
CREATE POLICY "Users can view own plan" ON monthly_plan
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plan" ON monthly_plan
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plan" ON monthly_plan
  FOR UPDATE USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE TRIGGER update_monthly_plan_updated_at
  BEFORE UPDATE ON monthly_plan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_monthly_plan_user_id ON monthly_plan(user_id);

-- ================================
-- DONE!
-- ================================
-- After running this migration:
-- 1. Check that monthly_plan table is created
-- 2. Verify RLS policies are enabled
-- 3. Users can store their monthly budget plan
