"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart } from "lucide-react";
import {
  formatCurrency,
  calculateBudgetPercentage,
  getBudgetStatusColor,
  cn,
} from "@/lib/utils";

interface BudgetItem {
  category: string;
  emoji?: string | null;
  spent: number;
  limit: number;
}

interface BudgetHealthCardProps {
  budgets: BudgetItem[];
}

export function BudgetHealthCard({ budgets }: BudgetHealthCardProps) {
  // Sort by percentage used (highest first)
  const sortedBudgets = [...budgets].sort((a, b) => {
    const percentA = calculateBudgetPercentage(a.spent, a.limit);
    const percentB = calculateBudgetPercentage(b.spent, b.limit);
    return percentB - percentA;
  });

  // Take top 5 for display
  const displayBudgets = sortedBudgets.slice(0, 5);

  // Calculate overall health
  const totalSpent = budgets.reduce((sum, b) => sum + Math.abs(b.spent), 0);
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const overallPercentage = calculateBudgetPercentage(totalSpent, totalLimit);

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Budget Health
          </CardTitle>
          <div className="p-2 rounded-lg bg-chart-1/10">
            <PieChart className="w-4 h-4 text-chart-1" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {Math.round(overallPercentage * 100)}% of monthly budget used
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayBudgets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No budgets set up yet
          </p>
        ) : (
          displayBudgets.map((budget) => {
            const percentage = calculateBudgetPercentage(
              budget.spent,
              budget.limit
            );
            const progressValue = Math.min(percentage * 100, 100);
            const statusColor = getBudgetStatusColor(percentage);

            return (
              <div key={budget.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{budget.emoji || "📦"}</span>
                    <span className="font-medium truncate max-w-[120px]">
                      {budget.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-numbers text-xs">
                    <span
                      className={cn(
                        percentage > 1 ? "text-destructive" : "text-foreground"
                      )}
                    >
                      {formatCurrency(Math.abs(budget.spent), "CZK", {
                        compact: true,
                      })}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(budget.limit, "CZK", { compact: true })}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={progressValue} className="h-2 bg-muted" />
                  <div
                    className={cn(
                      "absolute top-0 left-0 h-2 rounded-full transition-all",
                      statusColor
                    )}
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>
            );
          })
        )}

        {budgets.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{budgets.length - 5} more categories
          </p>
        )}
      </CardContent>
    </Card>
  );
}
