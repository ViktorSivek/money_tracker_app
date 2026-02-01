"use client";

/**
 * Income Progress Bar Component
 * Shows expected income as a marker at ~2/3 of the bar
 * Actual income fills the bar, can exceed expected income
 */

import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, cn } from "@/lib/utils";

interface IncomeProgressBarProps {
  expectedIncome: number;
  actualIncome: number;
  currency?: string;
}

export function IncomeProgressBar({
  expectedIncome,
  actualIncome,
  currency = "CZK",
}: IncomeProgressBarProps) {
  // Bar max is 1.5x expected income (so expected is at ~67%)
  const maxIncome = expectedIncome > 0 ? expectedIncome * 1.5 : 100000;

  // Calculate percentages
  const actualPercentage = Math.min((actualIncome / maxIncome) * 100, 100);
  const expectedPercentage = Math.min((expectedIncome / maxIncome) * 100, 100);

  // Determine if income exceeded or met expectations
  const isOverExpected = actualIncome > expectedIncome;
  const isNearExpected = actualIncome >= expectedIncome * 0.9 && actualIncome <= expectedIncome;
  const isUnderExpected = actualIncome < expectedIncome * 0.9;

  return (
    <Card className="bg-linear-to-br from-card to-card/80 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Income This Month
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actual vs Expected */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Actual</p>
            <p
              className={cn(
                "text-2xl font-bold font-mono-numbers",
                isOverExpected && "text-chart-2",
                isNearExpected && "text-chart-2",
                isUnderExpected && "text-muted-foreground"
              )}
            >
              {formatCurrency(actualIncome, currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Expected</p>
            <p className="text-lg font-medium font-mono-numbers">
              {formatCurrency(expectedIncome, currency)}
            </p>
          </div>
        </div>

        {/* Progress Bar with Expected Marker */}
        <div className="space-y-2">
          <div className="relative">
            {/* Progress Bar */}
            <Progress
              value={actualPercentage}
              className={cn(
                "h-3",
                isOverExpected && "[&>div]:bg-chart-2",
                isNearExpected && "[&>div]:bg-chart-2",
                isUnderExpected && "[&>div]:bg-muted-foreground"
              )}
            />

            {/* Expected Income Marker (vertical line) */}
            {expectedIncome > 0 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary"
                style={{
                  left: `${expectedPercentage}%`,
                }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
              </div>
            )}
          </div>

          {/* Progress Label */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {actualPercentage.toFixed(0)}% of max
            </span>
            {isOverExpected && (
              <span className="text-chart-2 font-medium">
                +{formatCurrency(actualIncome - expectedIncome, currency)} over expected
              </span>
            )}
            {isUnderExpected && expectedIncome > 0 && (
              <span className="text-muted-foreground">
                {formatCurrency(expectedIncome - actualIncome, currency)} to go
              </span>
            )}
            {isNearExpected && (
              <span className="text-chart-2 font-medium">On track!</span>
            )}
          </div>
        </div>

        {/* Set Expected Income Message */}
        {expectedIncome === 0 && (
          <p className="text-xs text-muted-foreground">
            Set your expected income to track progress
          </p>
        )}
      </CardContent>
    </Card>
  );
}
