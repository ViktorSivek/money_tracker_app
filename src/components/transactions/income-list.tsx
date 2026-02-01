"use client";

/**
 * Income List Component
 * Displays filtered income entries
 */

import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { INCOME_CATEGORY_EMOJI, type Income } from "@/types/database";

interface IncomeListProps {
  income: Income[];
  isLoading?: boolean;
  periodLabel: string;
  onEdit?: (income: Income) => void;
  onDelete?: (income: Income) => void;
}

export function IncomeList({
  income,
  isLoading = false,
  periodLabel,
  onEdit,
  onDelete,
}: IncomeListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!income || income.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No income entries for {periodLabel}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add your first income entry to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group by month for year/all-time views
  const groupedIncome = income.reduce((acc, entry) => {
    const date = new Date(entry.income_date);
    const monthKey = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });

    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(entry);
    return acc;
  }, {} as Record<string, Income[]>);

  const shouldGroup = income.length > 3; // Group if more than 3 entries

  if (shouldGroup) {
    return (
      <div className="space-y-6">
        {Object.entries(groupedIncome).map(([monthKey, entries]) => (
          <div key={monthKey} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {monthKey}
            </h3>
            <div className="space-y-3">
              {entries.map((entry) => (
                <IncomeCard
                  key={entry.id}
                  income={entry}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {income.map((entry) => (
        <IncomeCard
          key={entry.id}
          income={entry}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function IncomeCard({
  income,
  onEdit,
  onDelete,
}: {
  income: Income;
  onEdit?: (income: Income) => void;
  onDelete?: (income: Income) => void;
}) {
  const emoji = INCOME_CATEGORY_EMOJI[income.category];
  const date = new Date(income.income_date);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Emoji & Category */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-2xl">{emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{income.category}</p>
              {income.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {income.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p className="text-xl font-bold font-mono-numbers text-chart-2">
              {formatCurrency(Number(income.amount), "CZK")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(income)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(income)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
