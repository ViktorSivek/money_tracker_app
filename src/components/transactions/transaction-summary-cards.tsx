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
      <div className="flex justify-center">
        <Card className="bg-gradient-to-br from-card to-card/80 border w-full max-w-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-3">
              <Skeleton className="h-9 w-9 rounded-full mx-auto" />
              <div>
                <Skeleton className="h-4 w-32 mx-auto mb-2" />
                <Skeleton className="h-12 w-48 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Card className={cn(
        "bg-gradient-to-br from-card to-card/80 border w-full max-w-xl",
        type === "income" ? "from-chart-2/5 border-chart-2/20" : "from-destructive/5 border-destructive/20"
      )}>
        <CardContent className="p-8">
          <div className="text-center space-y-3">
            <div className={cn(
              "inline-flex p-3 rounded-full mx-auto",
              type === "income" ? "bg-chart-2/10" : "bg-destructive/10"
            )}>
              <TrendingUp className={cn("h-6 w-6", type === "income" ? "text-chart-2" : "text-destructive")} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">
                {periodLabel}
              </p>
              <p className={cn(
                "text-5xl font-bold font-mono-numbers",
                type === "income" ? "text-chart-2" : "text-destructive"
              )}>
                {formatCurrency(periodTotal, "CZK")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
