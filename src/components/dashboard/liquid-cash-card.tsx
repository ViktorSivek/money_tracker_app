"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Banknote, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LiquidCashCardProps {
  totalLiquidAccounts: number;
  totalAllocatedGoals: number;
}

export function LiquidCashCard({
  totalLiquidAccounts,
  totalAllocatedGoals,
}: LiquidCashCardProps) {
  const liquidCash = totalLiquidAccounts - totalAllocatedGoals;

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Liquid Cash
            </p>
            <p className="text-3xl font-bold font-mono-numbers tracking-tight text-chart-2">
              {formatCurrency(liquidCash)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-chart-2/10">
            <Banknote className="w-6 h-6 text-chart-2" />
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Available to spend after goal allocations
        </p>

        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">In Accounts</p>
            <p className="text-sm font-semibold font-mono-numbers">
              {formatCurrency(totalLiquidAccounts)}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div>
              <p className="text-xs text-muted-foreground">
                Allocated to Goals
              </p>
              <p className="text-sm font-semibold font-mono-numbers text-chart-3">
                -{formatCurrency(totalAllocatedGoals)}
              </p>
            </div>
            <PiggyBank className="w-4 h-4 text-chart-3 mt-0.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
