"use client";

/**
 * Budget Progress Bar Component
 * Shows spending progress with threshold marker and color coding
 */

import { cn } from "@/lib/utils";

interface BudgetProgressBarProps {
  spent: number;
  limit: number;
  className?: string;
}

export function BudgetProgressBar({
  spent,
  limit,
  className,
}: BudgetProgressBarProps) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const cappedPercentage = Math.min(percentage, 120); // Cap at 120% for visual

  // Determine color based on percentage
  const getBarColor = () => {
    if (percentage < 80) return "bg-chart-2"; // Green
    if (percentage <= 100) return "bg-yellow-500"; // Yellow
    return "bg-destructive"; // Red
  };

  return (
    <div className={cn("relative h-2 w-full", className)}>
      {/* Background track */}
      <div className="absolute inset-0 bg-muted rounded-full overflow-hidden">
        {/* Progress bar */}
        <div
          className={cn("h-full transition-all duration-300", getBarColor())}
          style={{ width: `${Math.min(cappedPercentage, 100)}%` }}
        />
        {/* Overspent extension (past 100%) */}
        {percentage > 100 && (
          <div
            className="absolute top-0 h-full bg-destructive/60"
            style={{
              left: "100%",
              width: `${Math.min(cappedPercentage - 100, 20)}%`,
              transform: "translateX(-100%)",
            }}
          />
        )}
      </div>

      {/* Threshold marker at 100% */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-foreground/40"
        style={{ left: "100%" }}
      />
    </div>
  );
}
