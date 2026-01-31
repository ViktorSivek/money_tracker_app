/**
 * Transaction Service
 * Handles combined transaction and income operations for the transactions page
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Transaction, Income } from "@/types/database";

export type TransactionType = "income" | "expense" | "all";

export interface UnifiedTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string | null;
  date: string;
  source: "income" | "transaction"; // Which table it comes from
  isManual: boolean; // Manual entries can be edited/deleted
  canEdit: boolean;
  canDelete: boolean;
}

export interface TransactionFilters {
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  category?: string;
  search?: string;
}

export interface TransactionServiceResult<T> {
  data: T | null;
  error: string | null;
}

export class TransactionService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * Get all transactions (expenses from transactions table + income from income table)
   * Combined and sorted by date
   */
  async getAll(
    filters?: TransactionFilters
  ): Promise<TransactionServiceResult<UnifiedTransaction[]>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const unified: UnifiedTransaction[] = [];

    // Fetch transactions (expenses) - only if type is 'expense' or 'all'
    if (!filters?.type || filters.type === "all" || filters.type === "expense") {
      let transactionQuery = this.supabase
        .from("transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (filters?.startDate) {
        transactionQuery = transactionQuery.gte(
          "transaction_date",
          filters.startDate
        );
      }
      if (filters?.endDate) {
        transactionQuery = transactionQuery.lte(
          "transaction_date",
          filters.endDate
        );
      }
      if (filters?.category && filters.category !== "all") {
        transactionQuery = transactionQuery.eq("category", filters.category);
      }
      if (filters?.search) {
        transactionQuery = transactionQuery.or(
          `merchant_clean.ilike.%${filters.search}%,original_description.ilike.%${filters.search}%`
        );
      }

      const { data: transactions, error: txError } = await transactionQuery;

      if (txError) {
        return { data: null, error: txError.message };
      }

      // Transform transactions to unified format
      (transactions as Transaction[])?.forEach((tx) => {
        const isManual = tx.unique_id?.startsWith("manual-expense-") ?? false;
        unified.push({
          id: tx.id,
          type: tx.amount < 0 ? "expense" : "income",
          amount: tx.amount,
          description: tx.merchant_clean || tx.original_description || "Unknown",
          category: tx.category,
          date: tx.transaction_date,
          source: "transaction",
          isManual,
          canEdit: true, // All expenses can be edited
          canDelete: true, // All expenses can be deleted
        });
      });
    }

    // Fetch income - only if type is 'income' or 'all'
    if (!filters?.type || filters.type === "all" || filters.type === "income") {
      let incomeQuery = this.supabase
        .from("income")
        .select("*")
        .eq("user_id", user.id)
        .order("income_date", { ascending: false });

      if (filters?.startDate) {
        incomeQuery = incomeQuery.gte("income_date", filters.startDate);
      }
      if (filters?.endDate) {
        incomeQuery = incomeQuery.lte("income_date", filters.endDate);
      }
      if (filters?.category && filters.category !== "all") {
        incomeQuery = incomeQuery.eq("category", filters.category);
      }
      if (filters?.search) {
        incomeQuery = incomeQuery.ilike("description", `%${filters.search}%`);
      }

      const { data: incomeData, error: incomeError } = await incomeQuery;

      if (incomeError) {
        return { data: null, error: incomeError.message };
      }

      // Transform income to unified format
      (incomeData as Income[])?.forEach((inc) => {
        unified.push({
          id: inc.id,
          type: "income",
          amount: Number(inc.amount),
          description: inc.description || inc.category,
          category: inc.category,
          date: inc.income_date,
          source: "income",
          isManual: true, // All income entries are manual
          canEdit: true,
          canDelete: true,
        });
      });
    }

    // Sort by date descending
    unified.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return { data: unified, error: null };
  }

  /**
   * Get unique categories from both tables
   */
  async getCategories(): Promise<TransactionServiceResult<string[]>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const categories = new Set<string>();

    // Get transaction categories
    const { data: txCategories } = await this.supabase
      .from("transactions")
      .select("category")
      .not("category", "is", null);

    txCategories?.forEach((tx) => {
      if (tx.category) categories.add(tx.category);
    });

    // Get income categories
    const { data: incCategories } = await this.supabase
      .from("income")
      .select("category")
      .eq("user_id", user.id);

    incCategories?.forEach((inc) => {
      if (inc.category) categories.add(inc.category);
    });

    return { data: Array.from(categories).sort(), error: null };
  }

  /**
   * Update an income entry
   */
  async updateIncome(params: {
    id: string;
    amount?: number;
    description?: string;
    incomeDate?: Date;
    category?: string;
  }): Promise<TransactionServiceResult<boolean>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const updateData: Record<string, unknown> = {};

    if (params.amount !== undefined) {
      updateData.amount = params.amount;
    }
    if (params.description !== undefined) {
      updateData.description = params.description;
    }
    if (params.incomeDate !== undefined) {
      updateData.income_date = params.incomeDate.toISOString().split("T")[0];
    }
    if (params.category !== undefined) {
      updateData.category = params.category;
    }

    const { error } = await this.supabase
      .from("income")
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  }

  /**
   * Delete an income entry
   */
  async deleteIncome(incomeId: string): Promise<TransactionServiceResult<boolean>> {
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
   * Get summary stats for the current filters
   */
  async getSummary(
    filters?: TransactionFilters
  ): Promise<
    TransactionServiceResult<{
      totalIncome: number;
      totalExpenses: number;
      netAmount: number;
      transactionCount: number;
    }>
  > {
    const result = await this.getAll(filters);

    if (result.error || !result.data) {
      return { data: null, error: result.error };
    }

    const totalIncome = result.data
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpenses = result.data
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      data: {
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
        transactionCount: result.data.length,
      },
      error: null,
    };
  }
}

/**
 * Factory function to create TransactionService instance
 */
export function createTransactionService(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>
): TransactionService {
  return new TransactionService(supabase);
}
