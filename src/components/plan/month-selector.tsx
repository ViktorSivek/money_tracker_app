"use client";

/**
 * Month Selector Component
 * Allows navigation between months
 */

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
  className?: string;
}

export function MonthSelector({
  selectedMonth,
  onMonthChange,
  className,
}: MonthSelectorProps) {
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    onMonthChange(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    onMonthChange(newMonth);
  };

  const goToCurrentMonth = () => {
    onMonthChange(new Date());
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return (
      selectedMonth.getMonth() === now.getMonth() &&
      selectedMonth.getFullYear() === now.getFullYear()
    );
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={goToPreviousMonth}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 px-4">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold whitespace-nowrap">{formatMonth(selectedMonth)}</h2>
        {!isCurrentMonth() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToCurrentMonth}
            className="ml-2 h-7 text-xs"
          >
            Today
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNextMonth}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
