/**
 * Monthly Summary Service
 * Aggregates income and expenses for monthly overview and trends
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Income, Transaction, MonthlyTrendData } from "@/types/database";

export interface MonthlySummaryData {
  month: Date;
  year: number;
  monthIndex: number; // 0-11
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number; // percentage
}

export interface MonthlyServiceResult<T> {
  data: T | null;
  error: string | null;
}

export class MonthlySummaryService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * Get summary for a specific month
   */
  async getMonthSummary(
    year: number,
    month: number
  ): Promise<MonthlyServiceResult<MonthlySummaryData>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Fetch income for the month
    const { data: incomeData, error: incomeError } = await this.supabase
      .from("income")
      .select("amount")
      .eq("user_id", user.id)
      .gte("income_date", startDateStr)
      .lte("income_date", endDateStr);

    if (incomeError) {
      return { data: null, error: incomeError.message };
    }

    // Fetch expenses (transactions with negative amounts) for the month
    const { data: transactionData, error: transactionError } =
      await this.supabase
        .from("transactions")
        .select("amount")
        .gte("transaction_date", startDateStr)
        .lte("transaction_date", endDateStr);

    if (transactionError) {
      return { data: null, error: transactionError.message };
    }

    const totalIncome =
      (incomeData as Pick<Income, "amount">[])?.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      ) || 0;

    // Expenses are negative amounts in transactions
    const totalExpenses = Math.abs(
      (transactionData as Pick<Transaction, "amount">[])
        ?.filter((tx) => tx.amount < 0)
        .reduce((sum, tx) => sum + Number(tx.amount), 0) || 0
    );

    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    return {
      data: {
        month: startDate,
        year,
        monthIndex: month,
        totalIncome,
        totalExpenses,
        savings,
        savingsRate,
      },
      error: null,
    };
  }

  /**
   * Get trend data for the last N months
   */
  async getMonthlyTrend(
    monthsBack: number = 6
  ): Promise<MonthlyServiceResult<MonthlyTrendData[]>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const now = new Date();
    const trendData: MonthlyTrendData[] = [];

    // Calculate date range for all months at once
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthsBack + 1,
      1
    );

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Fetch all income in the range
    const { data: incomeData, error: incomeError } = await this.supabase
      .from("income")
      .select("amount, income_date")
      .eq("user_id", user.id)
      .gte("income_date", startDateStr)
      .lte("income_date", endDateStr);

    if (incomeError) {
      return { data: null, error: incomeError.message };
    }

    // Fetch all transactions in the range
    const { data: transactionData, error: transactionError } =
      await this.supabase
        .from("transactions")
        .select("amount, transaction_date")
        .gte("transaction_date", startDateStr)
        .lte("transaction_date", endDateStr);

    if (transactionError) {
      return { data: null, error: transactionError.message };
    }

    // Group by month
    const incomeByMonth = new Map<string, number>();
    const expensesByMonth = new Map<string, number>();

    // Process income
    (incomeData as Array<{ amount: number; income_date: string }>)?.forEach(
      (item) => {
        const date = new Date(item.income_date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        incomeByMonth.set(
          key,
          (incomeByMonth.get(key) || 0) + Number(item.amount)
        );
      }
    );

    // Process expenses (negative transactions)
    (
      transactionData as Array<{ amount: number; transaction_date: string }>
    )?.forEach((tx) => {
      if (tx.amount < 0) {
        const date = new Date(tx.transaction_date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        expensesByMonth.set(
          key,
          (expensesByMonth.get(key) || 0) + Math.abs(Number(tx.amount))
        );
      }
    });

    // Build trend data for each month
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      const income = incomeByMonth.get(key) || 0;
      const expenses = expensesByMonth.get(key) || 0;

      trendData.push({
        month: monthName,
        income,
        expenses,
        savings: income - expenses,
      });
    }

    return { data: trendData, error: null };
  }

  /**
   * Get cumulative savings over time (for line chart)
   */
  async getCumulativeSavings(
    monthsBack: number = 12
  ): Promise<MonthlyServiceResult<MonthlyTrendData[]>> {
    const trendResult = await this.getMonthlyTrend(monthsBack);

    if (trendResult.error || !trendResult.data) {
      return trendResult;
    }

    let cumulative = 0;
    const cumulativeData = trendResult.data.map((item) => {
      cumulative += item.savings;
      return {
        ...item,
        savings: cumulative,
      };
    });

    return { data: cumulativeData, error: null };
  }

  /**
   * Get daily accumulation data for a specific month
   * Shows cumulative income and expenses day by day
   */
  async getDailyAccumulation(
    year: number,
    month: number
  ): Promise<MonthlyServiceResult<Array<{
    day: string;
    income: number;
    expenses: number;
  }>>> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month
    const daysInMonth = endDate.getDate();

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Fetch all income for the month
    const { data: incomeData, error: incomeError } = await this.supabase
      .from("income")
      .select("amount, income_date")
      .eq("user_id", user.id)
      .gte("income_date", startDateStr)
      .lte("income_date", endDateStr);

    if (incomeError) {
      return { data: null, error: incomeError.message };
    }

    // Fetch all transactions for the month
    const { data: transactionData, error: transactionError } =
      await this.supabase
        .from("transactions")
        .select("amount, transaction_date")
        .gte("transaction_date", startDateStr)
        .lte("transaction_date", endDateStr);

    if (transactionError) {
      return { data: null, error: transactionError.message };
    }

    // Group by day
    const incomeByDay = new Map<number, number>();
    const expensesByDay = new Map<number, number>();

    // Process income
    (incomeData as Array<{ amount: number; income_date: string }>)?.forEach(
      (item) => {
        const date = new Date(item.income_date);
        const day = date.getDate();
        incomeByDay.set(day, (incomeByDay.get(day) || 0) + Number(item.amount));
      }
    );

    // Process expenses (negative transactions)
    (transactionData as Array<{ amount: number; transaction_date: string }>)?.forEach(
      (tx) => {
        if (tx.amount < 0) {
          const date = new Date(tx.transaction_date);
          const day = date.getDate();
          expensesByDay.set(
            day,
            (expensesByDay.get(day) || 0) + Math.abs(Number(tx.amount))
          );
        }
      }
    );

    // Build daily accumulation data
    const dailyData = [];
    let cumulativeIncome = 0;
    let cumulativeExpenses = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      cumulativeIncome += incomeByDay.get(day) || 0;
      cumulativeExpenses += expensesByDay.get(day) || 0;

      dailyData.push({
        day: `${day}`,
        income: cumulativeIncome,
        expenses: cumulativeExpenses,
      });
    }

    return { data: dailyData, error: null };
  }
}

/**
 * Factory function to create MonthlySummaryService instance
 */
export function createMonthlySummaryService(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>
): MonthlySummaryService {
  return new MonthlySummaryService(supabase);
}
