"use client";

/**
 * Transaction Filters Component
 * Provides filtering controls for the transaction list
 */

import { Search, Filter, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransactionFilters } from "@/lib/services";

type TimePeriod = "all" | "this_week" | "this_month" | "this_year";

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  categories: string[];
  isLoading?: boolean;
  showTypeFilter?: boolean;
}

function getTimePeriodDates(period: TimePeriod): { startDate?: string; endDate?: string } {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  switch (period) {
    case "this_week": {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      return {
        startDate: monday.toISOString().split("T")[0],
        endDate: today,
      };
    }
    case "this_month": {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: firstDay.toISOString().split("T")[0],
        endDate: today,
      };
    }
    case "this_year": {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      return {
        startDate: firstDay.toISOString().split("T")[0],
        endDate: today,
      };
    }
    default:
      return { startDate: undefined, endDate: undefined };
  }
}

function detectTimePeriod(startDate?: string, endDate?: string): TimePeriod {
  if (!startDate && !endDate) return "all";

  const periods: TimePeriod[] = ["this_week", "this_month", "this_year"];
  for (const period of periods) {
    const dates = getTimePeriodDates(period);
    if (dates.startDate === startDate && dates.endDate === endDate) {
      return period;
    }
  }
  return "all"; // Custom date range
}

export function TransactionFiltersComponent({
  filters,
  onFiltersChange,
  categories,
  isLoading,
  showTypeFilter = false,
}: TransactionFiltersProps) {
  const currentPeriod = detectTimePeriod(filters.startDate, filters.endDate);

  const hasActiveFilters =
    (showTypeFilter && filters.type !== "all") ||
    filters.category !== "all" ||
    filters.startDate ||
    filters.endDate ||
    filters.search;

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      type: showTypeFilter ? "all" : filters.type,
      category: "all",
      startDate: undefined,
      endDate: undefined,
      search: undefined,
    });
  };

  const handleTimePeriodChange = (period: TimePeriod) => {
    const dates = getTimePeriodDates(period);
    onFiltersChange({
      ...filters,
      ...dates,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Time Period Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={filters.search || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value || undefined })
            }
            className="pl-9"
            disabled={isLoading}
          />
        </div>

        {/* Time Period Quick Filter */}
        <Select
          value={currentPeriod}
          onValueChange={(value) => handleTimePeriodChange(value as TimePeriod)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.category || "all"}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, category: value })
          }
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range (collapsible) */}
      {currentPeriod === "all" && (filters.startDate || filters.endDate) && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  startDate: e.target.value || undefined,
                })
              }
              placeholder="Start date"
              disabled={isLoading}
            />
          </div>
          <div className="flex-1">
            <Input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  endDate: e.target.value || undefined,
                })
              }
              placeholder="End date"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters active</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
