"use client";

/**
 * Add Expense Dialog Component
 * Form to add new manual expense entries
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  createExpenseService,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_EMOJI,
  type ExpenseCategory,
} from "@/lib/services";

interface AddExpenseDialogProps {
  onSuccess?: () => void;
}

export function AddExpenseDialog({ onSuccess }: AddExpenseDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Other");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("Other");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const expenseService = createExpenseService(supabase);

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

      const result = await expenseService.add({
        amount: parsedAmount,
        description: description.trim(),
        expenseDate: new Date(expenseDate),
        category,
      });

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // Success
      resetForm();
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Add expense error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Record a manual expense entry.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Amount */}
            <div className="grid gap-2">
              <Label htmlFor="expense-amount">Amount (Kc)</Label>
              <Input
                id="expense-amount"
                type="text"
                inputMode="decimal"
                placeholder="1,500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono-numbers"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="expense-description">Description</Label>
              <Input
                id="expense-description"
                type="text"
                placeholder="Grocery shopping"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="expense-category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as ExpenseCategory)}
              >
                <SelectTrigger id="expense-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        <span>{EXPENSE_CATEGORY_EMOJI[cat]}</span>
                        <span>{cat}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="grid gap-2">
              <Label htmlFor="expense-date">Date</Label>
              <Input
                id="expense-date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
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
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
