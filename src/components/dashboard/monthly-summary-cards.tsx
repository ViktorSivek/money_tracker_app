"use client";

/**
 * Monthly Summary Cards Component
 * Displays Income, Expenses, and Savings for a selected month
 */

import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { CurrencyCode } from "@/lib/constants";

interface MonthlySummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  isLoading?: boolean;
  currency?: CurrencyCode;
}

export function MonthlySummaryCards({
  totalIncome,
  totalExpenses,
  savings,
  savingsRate,
  isLoading = false,
  currency = "CZK",
}: MonthlySummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Income Card */}
      <Card className="bg-linear-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-chart-2" />
            <span className="text-xs text-muted-foreground font-medium">
              Income
            </span>
          </div>
          <p className="text-lg font-bold font-mono-numbers text-chart-2">
            {formatCurrency(totalIncome, currency, { showSign: true })}
          </p>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card className="bg-linear-to-br from-destructive/10 to-destructive/5 border-destructive/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <span className="text-xs text-muted-foreground font-medium">
              Expenses
            </span>
          </div>
          <p className="text-lg font-bold font-mono-numbers text-destructive">
            {formatCurrency(-totalExpenses, currency, { showSign: true })}
          </p>
        </CardContent>
      </Card>

      {/* Savings Card */}
      <Card
        className={`bg-linear-to-br ${
          savings >= 0
            ? "from-primary/10 to-primary/5 border-primary/20"
            : "from-destructive/10 to-destructive/5 border-destructive/20"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <PiggyBank
              className={`h-4 w-4 ${
                savings >= 0 ? "text-primary" : "text-destructive"
              }`}
            />
            <span className="text-xs text-muted-foreground font-medium">
              Savings
            </span>
          </div>
          <p
            className={`text-lg font-bold font-mono-numbers ${
              savings >= 0 ? "text-primary" : "text-destructive"
            }`}
          >
            {formatCurrency(savings, currency, { showSign: true })}
          </p>
          {totalIncome > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {savingsRate.toFixed(0)}% of income
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
