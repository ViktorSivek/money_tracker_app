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
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <Skeleton className="h-10 w-10 rounded-full mx-auto" />
                <div>
                  <Skeleton className="h-3 w-16 mb-2 mx-auto" />
                  <Skeleton className="h-7 w-24 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Income Card */}
      <Card className="bg-gradient-to-br from-chart-2/5 to-card border-chart-2/20">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="inline-flex p-2.5 rounded-full bg-chart-2/10 mx-auto">
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1.5">
                Income
              </p>
              <p className="text-2xl font-bold font-mono-numbers text-chart-2">
                {formatCurrency(totalIncome, currency, { showSign: true, minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card className="bg-gradient-to-br from-destructive/5 to-card border-destructive/20">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="inline-flex p-2.5 rounded-full bg-destructive/10 mx-auto">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1.5">
                Expenses
              </p>
              <p className="text-2xl font-bold font-mono-numbers text-destructive">
                {formatCurrency(-totalExpenses, currency, { showSign: true, minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Card */}
      <Card
        className={`bg-gradient-to-br ${
          savings >= 0
            ? "from-primary/5 to-card border-primary/20"
            : "from-destructive/5 to-card border-destructive/20"
        }`}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className={`inline-flex p-2.5 rounded-full mx-auto ${
              savings >= 0 ? "bg-primary/10" : "bg-destructive/10"
            }`}>
              <PiggyBank
                className={`h-5 w-5 ${
                  savings >= 0 ? "text-primary" : "text-destructive"
                }`}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1.5">
                Savings
              </p>
              <p
                className={`text-2xl font-bold font-mono-numbers ${
                  savings >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {formatCurrency(savings, currency, { showSign: true, minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              {totalIncome > 0 && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  {savingsRate.toFixed(0)}% of income
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
