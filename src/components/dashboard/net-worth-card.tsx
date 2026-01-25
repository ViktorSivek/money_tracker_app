"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface NetWorthCardProps {
  totalAccounts: number;
  totalInvestments: number;
  previousNetWorth?: number;
}

export function NetWorthCard({
  totalAccounts,
  totalInvestments,
  previousNetWorth,
}: NetWorthCardProps) {
  const netWorth = totalAccounts + totalInvestments;
  const change = previousNetWorth ? netWorth - previousNetWorth : 0;
  const changePercentage = previousNetWorth
    ? ((netWorth - previousNetWorth) / previousNetWorth) * 100
    : 0;
  const isPositive = change >= 0;

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Net Worth
            </p>
            <p className="text-3xl font-bold font-mono-numbers tracking-tight">
              {formatCurrency(netWorth)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
        </div>

        {previousNetWorth !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                isPositive ? "text-chart-2" : "text-destructive"
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-mono-numbers">
                {formatPercentage(changePercentage)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">vs last month</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Accounts</p>
            <p className="text-sm font-semibold font-mono-numbers">
              {formatCurrency(totalAccounts)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Investments</p>
            <p className="text-sm font-semibold font-mono-numbers">
              {formatCurrency(totalInvestments)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
