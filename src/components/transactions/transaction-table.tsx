"use client";

/**
 * Transaction Table Component
 * Original design - reusable for both Income and Expenses
 */

import {
  ArrowDownLeft,
  ArrowUpRight,
  MoreHorizontal,
  Trash2,
  Pencil,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface TransactionRow {
  id: string;
  date: string; // ISO date string
  category: string;
  description?: string | null;
  amount: number;
  isManual?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface TransactionTableProps {
  transactions: TransactionRow[];
  isLoading?: boolean;
  periodLabel: string;
  type: "income" | "expense";
  onEdit?: (transaction: TransactionRow) => void;
  onDelete?: (transaction: TransactionRow) => void;
  emptyAction?: React.ReactNode;
}

export function TransactionTable({
  transactions,
  isLoading = false,
  periodLabel,
  type,
  onEdit,
  onDelete,
  emptyAction,
}: TransactionTableProps) {
  const emptyMessage = `No ${type} entries for ${periodLabel}`;

  return (
    <Card className="bg-linear-to-br from-card to-card/80 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {type === "income" ? "Income" : "Expense"} Transactions
          {!isLoading && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({transactions.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{emptyMessage}</p>
            {emptyAction}
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`p-2.5 rounded-lg shrink-0 ${
                      type === "expense"
                        ? "bg-destructive/10"
                        : "bg-chart-2/10"
                    }`}
                  >
                    {type === "expense" ? (
                      <ArrowUpRight className="w-4 h-4 text-destructive" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-chart-2" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {tx.description || tx.category}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{tx.category || "Uncategorized"}</span>
                      <span>•</span>
                      <span>
                        {formatDate(tx.date, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <p
                    className={`text-sm font-semibold font-mono-numbers ${
                      type === "expense"
                        ? "text-destructive"
                        : "text-chart-2"
                    }`}
                  >
                    {formatCurrency(Math.abs(tx.amount), "CZK", { showSign: true })}
                  </p>

                  {(tx.canEdit || tx.canDelete) && (
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
                        {tx.canEdit && onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(tx)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {tx.canEdit && tx.canDelete && <DropdownMenuSeparator />}
                        {tx.canDelete && onDelete && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(tx)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
