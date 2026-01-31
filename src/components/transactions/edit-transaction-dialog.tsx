"use client";

/**
 * Edit Transaction Dialog Component
 * Form to edit existing income or expense entries
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  createTransactionService,
  createExpenseService,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_EMOJI,
  type ExpenseCategory,
  type UnifiedTransaction,
} from "@/lib/services";
import {
  INCOME_CATEGORIES,
  INCOME_CATEGORY_EMOJI,
  type IncomeCategory,
} from "@/types/database";

interface EditTransactionDialogProps {
  transaction: UnifiedTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onSuccess,
}: EditTransactionDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState("");

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setAmount(Math.abs(transaction.amount).toString());
      setDescription(transaction.description);
      setCategory(transaction.category || "Other");
      setDate(transaction.date);
      setError(null);
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const parsedAmount = parseFloat(amount.replace(/[^\d.-]/g, ""));

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Please enter a valid amount greater than 0");
        setIsLoading(false);
        return;
      }

      if (!description.trim()) {
        setError("Please enter a description");
        setIsLoading(false);
        return;
      }

      if (transaction.source === "income") {
        // Update income entry
        const transactionService = createTransactionService(supabase);
        const result = await transactionService.updateIncome({
          id: transaction.id,
          amount: parsedAmount,
          description: description.trim(),
          incomeDate: new Date(date),
          category: category,
        });

        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
      } else {
        // Update expense entry
        const expenseService = createExpenseService(supabase);
        const result = await expenseService.update({
          id: transaction.id,
          amount: parsedAmount,
          description: description.trim(),
          expenseDate: new Date(date),
          category: category as ExpenseCategory,
        });

        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
      }

      // Success
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Edit transaction error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!transaction) return null;

  const isIncome = transaction.type === "income";
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const categoryEmojis = isIncome ? INCOME_CATEGORY_EMOJI : EXPENSE_CATEGORY_EMOJI;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit {isIncome ? "Income" : "Expense"}
            </DialogTitle>
            <DialogDescription>
              Update the details of this {isIncome ? "income" : "expense"} entry.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Amount */}
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Amount (Kc)</Label>
              <Input
                id="edit-amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono-numbers"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        <span>
                          {categoryEmojis[cat as keyof typeof categoryEmojis]}
                        </span>
                        <span>{cat}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="grid gap-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </p>
            )}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
