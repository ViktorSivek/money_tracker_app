import { createClient } from "@/lib/supabase/server";
import {
  NetWorthCard,
  LiquidCashCard,
  BudgetHealthCard,
  MonthlyOverview,
} from "@/components/dashboard";
import { getCurrentMonthRange } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  Account,
  Goal,
  Investment,
  Budget,
  Category,
  Transaction,
} from "@/types/database";

async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get accounts
  const { data: accounts } = (await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)) as { data: Account[] | null };

  // Get goals
  const { data: goals } = (await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)) as { data: Goal[] | null };

  // Get investments
  const { data: investments } = (await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id)) as { data: Investment[] | null };

  // Get budgets
  const { data: budgets } = (await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)) as { data: Budget[] | null };

  // Get categories for emoji lookup
  const { data: categories } = (await supabase
    .from("categories")
    .select("name, emoji")) as {
    data: Pick<Category, "name" | "emoji">[] | null;
  };

  // Get current month transactions
  const { start, end } = getCurrentMonthRange();
  const { data: transactions } = (await supabase
    .from("transactions")
    .select("*")
    .gte("transaction_date", start.toISOString())
    .lte("transaction_date", end.toISOString())
    .order("transaction_date", { ascending: false })) as {
    data: Transaction[] | null;
  };

  // Calculate totals
  const totalAccounts =
    accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

  const totalInvestments =
    investments?.reduce(
      (sum, inv) => sum + Number(inv.quantity) * Number(inv.current_price || 0),
      0
    ) || 0;

  const totalLiquidAccounts =
    accounts
      ?.filter((acc) => !acc.is_investment)
      .reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

  const totalAllocatedGoals =
    goals?.reduce((sum, goal) => sum + Number(goal.current_amount), 0) || 0;

  // Calculate spending by category for current month
  const categoryEmojis = new Map(
    categories?.map((c) => [c.name, c.emoji]) || []
  );

  const spendingByCategory = new Map<string, number>();
  transactions?.forEach((tx) => {
    if (tx.amount < 0 && tx.category) {
      const current = spendingByCategory.get(tx.category) || 0;
      spendingByCategory.set(tx.category, current + Math.abs(tx.amount));
    }
  });

  // Build budget items with spending
  const budgetItems =
    budgets?.map((budget) => ({
      category: budget.category,
      emoji: categoryEmojis.get(budget.category) || budget.emoji,
      spent: spendingByCategory.get(budget.category) || 0,
      limit: Number(budget.monthly_limit),
    })) || [];

  // Get recent transactions (last 5)
  const recentTransactions = transactions?.slice(0, 5) || [];

  return {
    accounts: accounts || [],
    totalAccounts,
    totalInvestments,
    totalLiquidAccounts,
    totalAllocatedGoals,
    budgetItems,
    recentTransactions,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">
          Please log in to view your dashboard
        </p>
      </div>
    );
  }

  const {
    accounts,
    totalAccounts,
    totalInvestments,
    totalLiquidAccounts,
    totalAllocatedGoals,
    budgetItems,
    recentTransactions,
  } = data;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your financial command center
        </p>
      </div>

      {/* Monthly Overview - Income, Expenses, Savings */}
      <MonthlyOverview accounts={accounts} />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <NetWorthCard
          totalAccounts={totalAccounts}
          totalInvestments={totalInvestments}
        />
        <LiquidCashCard
          totalLiquidAccounts={totalLiquidAccounts}
          totalAllocatedGoals={totalAllocatedGoals}
        />
      </div>

      {/* Budget Health & Recent Transactions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BudgetHealthCard budgets={budgetItems} />

        {/* Recent Transactions */}
        <Card className="bg-linear-to-br from-card to-card/80 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No transactions this month
              </p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          tx.amount < 0 ? "bg-destructive/10" : "bg-chart-2/10"
                        }`}
                      >
                        {tx.amount < 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-destructive" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-chart-2" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-37.5">
                          {tx.merchant_clean ||
                            tx.original_description ||
                            "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.category || "Uncategorized"} •{" "}
                          {formatDate(tx.transaction_date, {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold font-mono-numbers ${
                        tx.amount < 0 ? "text-destructive" : "text-chart-2"
                      }`}
                    >
                      {formatCurrency(tx.amount, "CZK", { showSign: true })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
