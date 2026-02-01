"use client";

/**
 * Transaction Summary Card Component (Single Bubble)
 * Shows only the selected period total
 */

import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionSummaryCardsProps {
  periodTotal: number;
  periodLabel: string;
  isLoading?: boolean;
  type?: "income" | "expense";
}

export function TransactionSummaryCards({
  periodTotal,
  periodLabel,
  isLoading = false,
  type = "income",
}: TransactionSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center px-4 md:px-0">
        <Card className="bg-gradient-to-br from-card to-card/80 border w-full max-w-xl">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="text-center space-y-2 sm:space-y-3">
              <Skeleton className="h-7 w-7 sm:h-9 sm:w-9 rounded-full mx-auto" />
              <div>
                <Skeleton className="h-3 w-24 sm:h-4 sm:w-32 mx-auto mb-1 sm:mb-2" />
                <Skeleton className="h-9 w-36 sm:h-12 sm:w-48 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 md:px-0">
      <Card className={cn(
        "bg-gradient-to-br from-card to-card/80 border w-full max-w-xl",
        type === "income" ? "from-chart-2/5 border-chart-2/20" : "from-destructive/5 border-destructive/20"
      )}>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className={cn(
              "inline-flex p-2 sm:p-3 rounded-full mx-auto",
              type === "income" ? "bg-chart-2/10" : "bg-destructive/10"
            )}>
              <TrendingUp className={cn("h-5 w-5 sm:h-6 sm:w-6", type === "income" ? "text-chart-2" : "text-destructive")} />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1 sm:mb-2">
                {periodLabel}
              </p>
              <p className={cn(
                "text-3xl sm:text-4xl md:text-5xl font-bold font-mono-numbers",
                type === "income" ? "text-chart-2" : "text-destructive"
              )}>
                {formatCurrency(periodTotal, "CZK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
