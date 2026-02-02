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
import { createTransactionService } from "@/lib/services";
import type {
  Goal,
  Investment,
  Budget,
  Category,
} from "@/types/database";

async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

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

  // Use TransactionService to get all transactions from both tables
  const transactionService = createTransactionService(supabase);

  // Get all transactions for account balance calculation
  const allTransactionsResult = await transactionService.getAll();

  // Calculate account balance (all income - all expenses)
  const totalIncome =
    allTransactionsResult.data
      ?.filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

  const totalExpenses =
    allTransactionsResult.data
      ?.filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

  const accountBalance = totalIncome - totalExpenses;

  // Get current month transactions for recent transactions display
  const { start, end } = getCurrentMonthRange();
  const monthTransactionsResult = await transactionService.getAll({
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  });

  // Get recent transactions (last 5, both income and expenses)
  const recentTransactions = monthTransactionsResult.data?.slice(0, 5) || [];

  // Calculate totals
  const totalInvestments =
    investments?.reduce(
      (sum, inv) => sum + Number(inv.quantity) * Number(inv.current_price || 0),
      0
    ) || 0;

  const totalAllocatedGoals =
    goals?.reduce((sum, goal) => sum + Number(goal.current_amount), 0) || 0;

  // Calculate spending by category for current month
  const categoryEmojis = new Map(
    categories?.map((c) => [c.name, c.emoji]) || []
  );

  const spendingByCategory = new Map<string, number>();
  monthTransactionsResult.data?.forEach((tx) => {
    if (tx.type === "expense" && tx.category) {
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

  return {
    accountBalance,
    totalInvestments,
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
    accountBalance,
    totalInvestments,
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

      {/* Main KPI Cards - Net Worth and Liquid Cash */}
      <div className="grid gap-4 md:grid-cols-2">
        <NetWorthCard
          totalAccounts={accountBalance}
          totalInvestments={totalInvestments}
        />
        <LiquidCashCard
          totalLiquidAccounts={accountBalance}
          totalAllocatedGoals={totalAllocatedGoals}
        />
      </div>

      {/* Monthly Overview - Month Selector, Income, Expenses, Savings, Graph */}
      <MonthlyOverview />

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
                          tx.type === "expense" ? "bg-destructive/10" : "bg-chart-2/10"
                        }`}
                      >
                        {tx.type === "expense" ? (
                          <ArrowUpRight className="w-4 h-4 text-destructive" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-chart-2" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-37.5">
                          {tx.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.category || "Uncategorized"} •{" "}
                          {formatDate(tx.date, {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold font-mono-numbers ${
                        tx.type === "expense" ? "text-destructive" : "text-chart-2"
                      }`}
                    >
                      {formatCurrency(tx.type === "expense" ? -Math.abs(tx.amount) : Math.abs(tx.amount), "CZK", { showSign: true })}
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
