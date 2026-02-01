"use client";

/**
 * Plan Summary Card Component
 * Shows summary calculation: income - budgets - investments = remaining
 */

import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, cn } from "@/lib/utils";
import type { PlanSummary } from "@/lib/services";

interface PlanSummaryCardProps {
  summary: PlanSummary | null;
  isLoading: boolean;
}

export function PlanSummaryCard({ summary, isLoading }: PlanSummaryCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-linear-to-br from-card to-card/80 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = summary || {
    expectedIncome: 0,
    actualIncome: 0,
    investmentTarget: 0,
    totalBudgeted: 0,
    totalSpent: 0,
    remaining: 0,
  };

  const isNegativeRemaining = data.remaining < 0;

  return (
    <Card className="bg-linear-to-br from-card to-card/80 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Expected Income */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Expected Income</span>
            <span className="font-mono-numbers font-medium">
              {formatCurrency(data.expectedIncome, "CZK")}
            </span>
          </div>

          {/* Budgeted */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">- Budgeted</span>
            <span className="font-mono-numbers font-medium text-destructive">
              -{formatCurrency(data.totalBudgeted, "CZK")}
            </span>
          </div>

          {/* Investments */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">- Investments</span>
            <span className="font-mono-numbers font-medium text-destructive">
              -{formatCurrency(data.investmentTarget, "CZK")}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 pt-3">
            {/* Remaining */}
            <div className="flex items-center justify-between">
              <span className="font-medium">= Remaining</span>
              <span
                className={cn(
                  "font-mono-numbers font-bold text-lg",
                  isNegativeRemaining ? "text-destructive" : "text-chart-2"
                )}
              >
                {formatCurrency(data.remaining, "CZK")}
              </span>
            </div>

            {/* Warning if negative */}
            {isNegativeRemaining && (
              <p className="text-xs text-destructive mt-2">
                Your planned spending exceeds your expected income
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
