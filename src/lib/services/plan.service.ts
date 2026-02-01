/**
 * Plan Service
 * Handles monthly plan data operations (expected income, investment target, budgets)
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
  investmentTarget: number;
  totalBudgeted: number;
  remaining: number;
}

export class PlanService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * Get the user's monthly plan
   */
  async getPlan(): Promise<PlanServiceResult<MonthlyPlan>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await this.supabase
      .from("monthly_plan")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      return { data: null, error: error.message };
    }

    return { data: data as MonthlyPlan | null, error: null };
  }

  /**
   * Create or update the user's monthly plan
   */
  async upsertPlan(
    expectedIncome: number,
    investmentTarget: number
  ): Promise<PlanServiceResult<MonthlyPlan>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await this.supabase
      .from("monthly_plan")
      .upsert(
        {
          user_id: user.id,
          expected_income: expectedIncome,
          investment_target: investmentTarget,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as MonthlyPlan, error: null };
  }

  /**
   * Update expected income only
   */
  async updateExpectedIncome(
    expectedIncome: number
  ): Promise<PlanServiceResult<MonthlyPlan>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    // First try to get existing plan
    const existing = await this.getPlan();

    const { data, error } = await this.supabase
      .from("monthly_plan")
      .upsert(
        {
          user_id: user.id,
          expected_income: expectedIncome,
          investment_target: existing.data?.investment_target ?? 0,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as MonthlyPlan, error: null };
  }

  /**
   * Update investment target only
   */
  async updateInvestmentTarget(
    investmentTarget: number
  ): Promise<PlanServiceResult<MonthlyPlan>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    // First try to get existing plan
    const existing = await this.getPlan();

    const { data, error } = await this.supabase
      .from("monthly_plan")
      .upsert(
        {
          user_id: user.id,
          expected_income: existing.data?.expected_income ?? 0,
          investment_target: investmentTarget,
        },
        { onConflict: "user_id" }
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
   * Get budgets with current month spending
   */
  async getBudgetsWithSpending(): Promise<
    PlanServiceResult<CategoryBudgetWithSpending[]>
  > {
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

    // Get current month spending by category from transactions
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

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
   * Get plan summary (income - budgets - investments = remaining)
   */
  async getPlanSummary(): Promise<PlanServiceResult<PlanSummary>> {
    const planResult = await this.getPlan();
    const budgetsResult = await this.getBudgets();

    if (planResult.error) {
      return { data: null, error: planResult.error };
    }

    if (budgetsResult.error) {
      return { data: null, error: budgetsResult.error };
    }

    const expectedIncome = planResult.data?.expected_income
      ? Number(planResult.data.expected_income)
      : 0;
    const investmentTarget = planResult.data?.investment_target
      ? Number(planResult.data.investment_target)
      : 0;
    const totalBudgeted =
      budgetsResult.data?.reduce(
        (sum, b) => sum + Number(b.monthly_limit),
        0
      ) || 0;
    const remaining = expectedIncome - totalBudgeted - investmentTarget;

    return {
      data: {
        expectedIncome,
        investmentTarget,
        totalBudgeted,
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
