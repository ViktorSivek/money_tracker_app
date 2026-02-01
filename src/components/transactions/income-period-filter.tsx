"use client";

/**
 * Income Period Filter Component
 * Quick filter buttons for income time periods
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type IncomePeriod = "this-month" | "last-month" | "this-year" | "all-time" | "custom";

interface IncomePeriodFilterProps {
  selectedPeriod: IncomePeriod;
  onPeriodChange: (period: IncomePeriod) => void;
}

export function IncomePeriodFilter({
  selectedPeriod,
  onPeriodChange,
}: IncomePeriodFilterProps) {
  const periods: { value: IncomePeriod; label: string }[] = [
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
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
