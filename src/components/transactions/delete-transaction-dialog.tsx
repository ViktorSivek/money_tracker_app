"use client";

/**
 * Delete Transaction Dialog Component
 * Confirmation dialog for deleting income entries
 */

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { UnifiedTransaction } from "@/lib/services";

interface DeleteTransactionDialogProps {
  transaction: UnifiedTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onConfirm,
}: DeleteTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete {transaction.type === "income" ? "Income" : "Expense"} Entry
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {transaction.type === "income" ? "income" : "expense"} entry? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Description</span>
              <span className="text-sm font-medium">{transaction.description}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Category</span>
              <span className="text-sm">{transaction.category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="text-sm">
                {formatDate(transaction.date, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className={`text-base font-semibold font-mono-numbers ${
                transaction.type === "income" ? "text-chart-2" : "text-destructive"
              }`}>
                {formatCurrency(Math.abs(transaction.amount), "CZK", {
                  showSign: true,
                })}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
