"use client";

/**
 * Dynamic Income Summary Cards Component
 * Shows period-specific income + this year + all time
 */

import { TrendingUp, Calendar, Infinity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DynamicIncomeSummaryProps {
  periodTotal: number;
  periodLabel: string;
  thisYearTotal: number;
  allTimeTotal: number;
  isLoading?: boolean;
}

export function DynamicIncomeSummary({
  periodTotal,
  periodLabel,
  thisYearTotal,
  allTimeTotal,
  isLoading = false,
}: DynamicIncomeSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Period Total (Dynamic) */}
      <Card className="bg-gradient-to-br from-chart-2/10 to-card/80 border-chart-2/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-2/20">
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">
                {periodLabel}
              </p>
              <p className="text-2xl font-bold font-mono-numbers text-chart-2 truncate">
                {formatCurrency(periodTotal, "CZK")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* This Year Total */}
      <Card className="bg-gradient-to-br from-primary/10 to-card/80 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                This Year
              </p>
              <p className="text-2xl font-bold font-mono-numbers text-primary truncate">
                {formatCurrency(thisYearTotal, "CZK")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Time Total */}
      <Card className="bg-gradient-to-br from-chart-1/10 to-card/80 border-chart-1/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-1/20">
              <Infinity className="h-5 w-5 text-chart-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                All Time
              </p>
              <p className="text-2xl font-bold font-mono-numbers text-chart-1 truncate">
                {formatCurrency(allTimeTotal, "CZK")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
