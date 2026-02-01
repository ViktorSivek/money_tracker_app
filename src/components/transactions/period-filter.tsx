"use client";

/**
 * Period Filter Component
 * Shared filter for both Income and Expenses
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Period = "this-month" | "last-month" | "this-year" | "all-time" | "custom";

interface PeriodFilterProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
}

export function PeriodFilter({
  selectedPeriod,
  onPeriodChange,
}: PeriodFilterProps) {
  const periods: { value: Period; label: string }[] = [
    { value: "this-month", label: "This Month" },
    { value: "this-year", label: "This Year" },
    { value: "all-time", label: "All Time" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? "default" : "outline"}
          size="sm"
          onClick={() => onPeriodChange(period.value)}
          className={cn(
            "transition-all",
            selectedPeriod === period.value && "shadow-md"
          )}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}
