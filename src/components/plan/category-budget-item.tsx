"use client";

/**
 * Category Budget Item Component
 * Shows a single category budget with progress bar
 */

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BudgetProgressBar } from "./budget-progress-bar";
import { formatCurrency, cn } from "@/lib/utils";
import type { CategoryBudgetWithSpending } from "@/lib/services";

interface CategoryBudgetItemProps {
  budget: CategoryBudgetWithSpending;
  onEdit: (budget: CategoryBudgetWithSpending) => void;
  onDelete: (budget: CategoryBudgetWithSpending) => void;
}

export function CategoryBudgetItem({
  budget,
  onEdit,
  onDelete,
}: CategoryBudgetItemProps) {
  const percentage = budget.percentage;

  // Determine text color based on percentage
  const getTextColor = () => {
    if (percentage < 80) return "text-chart-2";
    if (percentage <= 100) return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <div className="py-3 group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{budget.emoji || "📊"}</span>
          <span className="font-medium">{budget.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-mono-numbers", getTextColor())}>
            {formatCurrency(budget.spent, "CZK")}
          </span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-mono-numbers text-muted-foreground">
            {formatCurrency(budget.monthlyLimit, "CZK")}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(budget)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(budget)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <BudgetProgressBar spent={budget.spent} limit={budget.monthlyLimit} />
    </div>
  );
}
