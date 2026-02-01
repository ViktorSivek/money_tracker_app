/**
 * Plan Service
 * Handles monthly plan data operations (expected income, investment target, budgets)
 * Now supports month-specific planning
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { MonthlyPlan, Budget, BudgetInsert } from "@/types/database";

export interface PlanServiceResult<T> {
  data: T | null;
  error: string | null;
}

export interface CategoryBudgetWithSpending {
  id: string;
  category: string;
  emoji: string | null;
  monthlyLimit: number;
  spent: number;
  percentage: number;
}

export interface PlanSummary {
  expectedIncome: number;
  actualIncome: number;
  investmentTarget: number;
  totalBudgeted: number;
  totalSpent: number;
  remaining: number;
}

/**
 * Get first day of month as YYYY-MM-DD string
 */
export function getMonthString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export class PlanService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * Get the user's monthly plan for a specific month
   */
  async getPlan(month: Date): Promise<PlanServiceResult<MonthlyPlan>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const monthString = getMonthString(month);

    const { data, error } = await this.supabase
      .from("monthly_plan")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", monthString)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as MonthlyPlan | null, error: null };
  }

  /**
   * Create or update the user's monthly plan for a specific month
   */
  async upsertPlan(
    month: Date,
    expectedIncome: number,
    investmentTarget: number
  ): Promise<PlanServiceResult<MonthlyPlan>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const monthString = getMonthString(month);

    const { data, error } = await this.supabase
      .from("monthly_plan")
      .upsert(
        {
          user_id: user.id,
          month: monthString,
          expected_income: expectedIncome,
          investment_target: investmentTarget,
        },
        { onConflict: "user_id,month" }
      )
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as MonthlyPlan, error: null };
  }

  /**
   * Update expected income only for a specific month
   */
  async updateExpectedIncome(
    month: Date,
    expectedIncome: number
  ): Promise<PlanServiceResult<MonthlyPlan>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const monthString = getMonthString(month);

    // First try to get existing plan
    const existing = await this.getPlan(month);

    const { data, error } = await this.supabase
      .from("monthly_plan")
      .upsert(
        {
          user_id: user.id,
          month: monthString,
          expected_income: expectedIncome,
          investment_target: existing.data?.investment_target ?? 0,
        },
        { onConflict: "user_id,month" }
      )
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as MonthlyPlan, error: null };
  }

  /**
   * Update investment target only for a specific month
   */
  async updateInvestmentTarget(
    month: Date,
    investmentTarget: number
  ): Promise<PlanServiceResult<MonthlyPlan>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const monthString = getMonthString(month);

    // First try to get existing plan
    const existing = await this.getPlan(month);

    const { data, error } = await this.supabase
      .from("monthly_plan")
      .upsert(
        {
          user_id: user.id,
          month: monthString,
          expected_income: existing.data?.expected_income ?? 0,
          investment_target: investmentTarget,
        },
        { onConflict: "user_id,month" }
      )
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as MonthlyPlan, error: null };
  }

  /**
   * Get all budgets for the user
   */
  async getBudgets(): Promise<PlanServiceResult<Budget[]>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await this.supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .order("category", { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Budget[], error: null };
  }

  /**
   * Get budgets with spending for a specific month
   */
  async getBudgetsWithSpending(
    month: Date
  ): Promise<PlanServiceResult<CategoryBudgetWithSpending[]>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    // Get budgets
    const budgetsResult = await this.getBudgets();
    if (budgetsResult.error) {
      return { data: null, error: budgetsResult.error };
    }

    // Get spending for the specific month
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const { data: transactions, error: txError } = await this.supabase
      .from("transactions")
      .select("category, amount")
      .lt("amount", 0) // Only expenses (negative amounts)
      .gte("transaction_date", startOfMonth.toISOString())
      .lte("transaction_date", endOfMonth.toISOString());

    if (txError) {
      return { data: null, error: txError.message };
    }

    // Calculate spending by category
    const spendingByCategory = new Map<string, number>();
    transactions?.forEach((tx) => {
      if (tx.category) {
        const current = spendingByCategory.get(tx.category) || 0;
        spendingByCategory.set(tx.category, current + Math.abs(tx.amount));
      }
    });

    // Combine budgets with spending
    const budgetsWithSpending: CategoryBudgetWithSpending[] =
      budgetsResult.data?.map((budget) => {
        const spent = spendingByCategory.get(budget.category) || 0;
        const limit = Number(budget.monthly_limit);
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;

        return {
          id: budget.id,
          category: budget.category,
          emoji: budget.emoji,
          monthlyLimit: limit,
          spent,
          percentage,
        };
      }) || [];

    return { data: budgetsWithSpending, error: null };
  }

  /**
   * Get actual income for a specific month from income table only
   */
  async getActualIncome(month: Date): Promise<PlanServiceResult<number>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const { data: incomeData, error: incomeError } = await this.supabase
      .from("income")
      .select("amount")
      .eq("user_id", user.id)
      .gte("income_date", startOfMonth.toISOString().split("T")[0])
      .lte("income_date", endOfMonth.toISOString().split("T")[0]);

    if (incomeError) {
      console.error("Error fetching income:", incomeError);
      return { data: null, error: incomeError.message };
    }

    const totalIncome = incomeData?.reduce((sum, inc) => sum + Number(inc.amount), 0) || 0;

    return { data: totalIncome, error: null };
  }

  /**
   * Add a new budget
   */
  async addBudget(
    category: string,
    monthlyLimit: number,
    emoji?: string
  ): Promise<PlanServiceResult<Budget>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const budgetData: BudgetInsert = {
      user_id: user.id,
      category,
      monthly_limit: monthlyLimit,
      emoji: emoji || null,
    };

    const { data, error } = await this.supabase
      .from("budgets")
      .insert(budgetData)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Budget, error: null };
  }

  /**
   * Update a budget
   */
  async updateBudget(
    budgetId: string,
    monthlyLimit: number,
    emoji?: string
  ): Promise<PlanServiceResult<Budget>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const updateData: Record<string, unknown> = {
      monthly_limit: monthlyLimit,
    };

    if (emoji !== undefined) {
      updateData.emoji = emoji;
    }

    const { data, error } = await this.supabase
      .from("budgets")
      .update(updateData)
      .eq("id", budgetId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Budget, error: null };
  }

  /**
   * Delete a budget
   */
  async deleteBudget(budgetId: string): Promise<PlanServiceResult<boolean>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { error } = await this.supabase
      .from("budgets")
      .delete()
      .eq("id", budgetId)
      .eq("user_id", user.id);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  }

  /**
   * Get plan summary for a specific month
   * Includes actual income vs expected, spending, etc.
   */
  async getPlanSummary(month: Date): Promise<PlanServiceResult<PlanSummary>> {
    const planResult = await this.getPlan(month);
    const budgetsResult = await this.getBudgets();
    const actualIncomeResult = await this.getActualIncome(month);
    const budgetsWithSpendingResult = await this.getBudgetsWithSpending(month);

    if (planResult.error) {
      return { data: null, error: planResult.error };
    }

    if (budgetsResult.error) {
      return { data: null, error: budgetsResult.error };
    }

    if (actualIncomeResult.error) {
      return { data: null, error: actualIncomeResult.error };
    }

    const expectedIncome = planResult.data?.expected_income
      ? Number(planResult.data.expected_income)
      : 0;
    const actualIncome = actualIncomeResult.data || 0;
    const investmentTarget = planResult.data?.investment_target
      ? Number(planResult.data.investment_target)
      : 0;
    const totalBudgeted =
      budgetsResult.data?.reduce(
        (sum, b) => sum + Number(b.monthly_limit),
        0
      ) || 0;
    const totalSpent =
      budgetsWithSpendingResult.data?.reduce((sum, b) => sum + b.spent, 0) || 0;

    const remaining = expectedIncome - totalBudgeted - investmentTarget;

    return {
      data: {
        expectedIncome,
        actualIncome,
        investmentTarget,
        totalBudgeted,
        totalSpent,
        remaining,
      },
      error: null,
    };
  }
}

/**
 * Factory function to create PlanService instance
 */
export function createPlanService(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>
): PlanService {
  return new PlanService(supabase);
}
