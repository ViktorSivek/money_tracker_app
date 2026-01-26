/**
 * Income Service
 * Handles all income-related data operations
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Income, IncomeCategory, IncomeInsert } from "@/types/database";

export interface AddIncomeParams {
  amount: number;
  description?: string;
  incomeDate: Date;
  category: IncomeCategory;
  accountId?: string; // If provided, also updates account balance
}

export interface IncomeServiceResult<T> {
  data: T | null;
  error: string | null;
}

export class IncomeService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * Get all income entries for the current user
   */
  async getAll(): Promise<IncomeServiceResult<Income[]>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data, error } = await this.supabase
      .from("income")
      .select("*")
      .eq("user_id", user.id)
      .order("income_date", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Income[], error: null };
  }

  /**
   * Get income entries for a specific month
   */
  async getByMonth(
    year: number,
    month: number
  ): Promise<IncomeServiceResult<Income[]>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month

    const { data, error } = await this.supabase
      .from("income")
      .select("*")
      .eq("user_id", user.id)
      .gte("income_date", startDate.toISOString().split("T")[0])
      .lte("income_date", endDate.toISOString().split("T")[0])
      .order("income_date", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Income[], error: null };
  }

  /**
   * Get total income for a specific month
   */
  async getMonthlyTotal(
    year: number,
    month: number
  ): Promise<IncomeServiceResult<number>> {
    const result = await this.getByMonth(year, month);

    if (result.error) {
      return { data: null, error: result.error };
    }

    const total =
      result.data?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
    return { data: total, error: null };
  }

  /**
   * Add a new income entry
   * Optionally updates the linked account balance
   */
  async add(params: AddIncomeParams): Promise<IncomeServiceResult<Income>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const incomeData: IncomeInsert = {
      user_id: user.id,
      amount: params.amount,
      description: params.description || null,
      income_date: params.incomeDate.toISOString().split("T")[0],
      category: params.category,
      account_id: params.accountId || null,
    };

    // Insert income record
    const { data: income, error: incomeError } = await this.supabase
      .from("income")
      .insert(incomeData)
      .select()
      .single();

    if (incomeError) {
      return { data: null, error: incomeError.message };
    }

    // If account is linked, update its balance
    if (params.accountId) {
      const { error: accountError } = await this.supabase.rpc(
        "add_income_with_balance_update",
        {
          p_user_id: user.id,
          p_account_id: params.accountId,
          p_amount: params.amount,
          p_description: params.description || null,
          p_income_date: params.incomeDate.toISOString().split("T")[0],
          p_category: params.category,
        }
      );

      // Note: We already inserted, so if RPC fails, we just log it
      // In production, this should be a transaction
      if (accountError) {
        console.error("Failed to update account balance:", accountError);
      }
    }

    return { data: income as Income, error: null };
  }

  /**
   * Add income and update account balance atomically
   * Uses the database function for transaction safety
   */
  async addWithBalanceUpdate(
    params: AddIncomeParams
  ): Promise<IncomeServiceResult<string>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    if (!params.accountId) {
      return { data: null, error: "Account ID is required for balance update" };
    }

    const { data, error } = await this.supabase.rpc(
      "add_income_with_balance_update",
      {
        p_user_id: user.id,
        p_account_id: params.accountId,
        p_amount: params.amount,
        p_description: params.description || null,
        p_income_date: params.incomeDate.toISOString().split("T")[0],
        p_category: params.category,
      }
    );

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as string, error: null };
  }

  /**
   * Delete an income entry
   */
  async delete(incomeId: string): Promise<IncomeServiceResult<boolean>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const { error } = await this.supabase
      .from("income")
      .delete()
      .eq("id", incomeId)
      .eq("user_id", user.id);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  }

  /**
   * Update an income entry
   */
  async update(
    incomeId: string,
    updates: Partial<AddIncomeParams>
  ): Promise<IncomeServiceResult<Income>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const updateData: Record<string, unknown> = {};
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.incomeDate !== undefined) {
      updateData.income_date = updates.incomeDate.toISOString().split("T")[0];
    }
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.accountId !== undefined)
      updateData.account_id = updates.accountId;

    const { data, error } = await this.supabase
      .from("income")
      .update(updateData)
      .eq("id", incomeId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Income, error: null };
  }
}

/**
 * Factory function to create IncomeService instance
 */
export function createIncomeService(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>
): IncomeService {
  return new IncomeService(supabase);
}
