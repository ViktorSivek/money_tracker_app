/**
 * Expense Service
 * Handles manual expense operations using the existing transactions table
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Health",
  "Travel",
  "Education",
  "Personal",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  "Food & Dining": "🍽️",
  "Transportation": "🚗",
  "Shopping": "🛍️",
  "Entertainment": "🎬",
  "Bills & Utilities": "📄",
  "Health": "💊",
  "Travel": "✈️",
  "Education": "📚",
  "Personal": "👤",
  "Other": "📦",
};

export interface AddExpenseParams {
  amount: number;
  description: string;
  expenseDate: Date;
  category: ExpenseCategory;
}

export interface UpdateExpenseParams {
  id: string;
  amount?: number;
  description?: string;
  expenseDate?: Date;
  category?: ExpenseCategory;
}

export interface ExpenseServiceResult<T> {
  data: T | null;
  error: string | null;
}

export class ExpenseService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * Add a manual expense to the transactions table
   */
  async add(params: AddExpenseParams): Promise<ExpenseServiceResult<{ id: string }>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    // Generate unique_id for manual entry
    const uniqueId = `manual-expense-${crypto.randomUUID()}`;

    // Amount should be negative for expenses
    const expenseAmount = -Math.abs(params.amount);

    const { data, error } = await this.supabase
      .from("transactions")
      .insert({
        transaction_date: params.expenseDate.toISOString().split("T")[0],
        amount: expenseAmount,
        currency: "CZK",
        original_description: params.description,
        merchant_clean: params.description,
        category: params.category,
        unique_id: uniqueId,
      })
      .select("id")
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: { id: data.id }, error: null };
  }

  /**
   * Update a manual expense
   * Only allows updating expenses with unique_id starting with 'manual-expense-'
   */
  async update(params: UpdateExpenseParams): Promise<ExpenseServiceResult<boolean>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    // First check if this is a manual expense
    const { data: existing } = await this.supabase
      .from("transactions")
      .select("unique_id")
      .eq("id", params.id)
      .single();

    if (!existing?.unique_id?.startsWith("manual-expense-")) {
      return { data: null, error: "Can only edit manual expenses" };
    }

    const updateData: Record<string, unknown> = {};

    if (params.amount !== undefined) {
      updateData.amount = -Math.abs(params.amount);
    }
    if (params.description !== undefined) {
      updateData.original_description = params.description;
      updateData.merchant_clean = params.description;
    }
    if (params.expenseDate !== undefined) {
      updateData.transaction_date = params.expenseDate.toISOString().split("T")[0];
    }
    if (params.category !== undefined) {
      updateData.category = params.category;
    }

    const { error } = await this.supabase
      .from("transactions")
      .update(updateData)
      .eq("id", params.id);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  }

  /**
   * Delete a manual expense
   * Only allows deleting expenses with unique_id starting with 'manual-expense-'
   */
  async delete(expenseId: string): Promise<ExpenseServiceResult<boolean>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    // First check if this is a manual expense
    const { data: existing } = await this.supabase
      .from("transactions")
      .select("unique_id")
      .eq("id", expenseId)
      .single();

    if (!existing?.unique_id?.startsWith("manual-expense-")) {
      return { data: null, error: "Can only delete manual expenses" };
    }

    const { error } = await this.supabase
      .from("transactions")
      .delete()
      .eq("id", expenseId);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  }
}

/**
 * Factory function to create ExpenseService instance
 */
export function createExpenseService(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>
): ExpenseService {
  return new ExpenseService(supabase);
}
