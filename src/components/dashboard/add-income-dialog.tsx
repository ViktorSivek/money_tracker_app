"use client";

/**
 * Add Income Dialog Component
 * Form to add new income entries with optional account balance update
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
import { createIncomeService } from "@/lib/services";
import {
  INCOME_CATEGORIES,
  INCOME_CATEGORY_EMOJI,
  type IncomeCategory,
} from "@/types/database";
import type { Account } from "@/types/database";

interface AddIncomeDialogProps {
  accounts: Account[];
  onSuccess?: () => void;
}

export function AddIncomeDialog({ accounts, onSuccess }: AddIncomeDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IncomeCategory>("Salary");
  const [incomeDate, setIncomeDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [accountId, setAccountId] = useState<string>("none");

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("Salary");
    setIncomeDate(new Date().toISOString().split("T")[0]);
    setAccountId("none");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const incomeService = createIncomeService(supabase);

      const parsedAmount = parseFloat(amount.replace(/[^\d.-]/g, ""));

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Please enter a valid amount greater than 0");
        setIsLoading(false);
        return;
      }

      // Check if a real account is selected (not "none")
      const selectedAccountId = accountId !== "none" ? accountId : undefined;

      // If account is selected, use the atomic function
      if (selectedAccountId) {
        const result = await incomeService.addWithBalanceUpdate({
          amount: parsedAmount,
          description: description || undefined,
          incomeDate: new Date(incomeDate),
          category,
          accountId: selectedAccountId,
        });

        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
      } else {
        // Just add income without balance update
        const result = await incomeService.add({
          amount: parsedAmount,
          description: description || undefined,
          incomeDate: new Date(incomeDate),
          category,
        });

        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
      }

      // Success
      resetForm();
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Add income error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Income</DialogTitle>
            <DialogDescription>
              Record your income. Optionally update your account balance.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Amount */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (Kč)</Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="85,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono-numbers"
                required
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as IncomeCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        <span>{INCOME_CATEGORY_EMOJI[cat]}</span>
                        <span>{cat}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={incomeDate}
                onChange={(e) => setIncomeDate(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                type="text"
                placeholder="January Salary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Account to update */}
            <div className="grid gap-2">
              <Label htmlFor="account">Update Account Balance (optional)</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select account to update" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    Don&apos;t update any account
                  </SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <span className="flex items-center gap-2">
                        <span>{account.icon}</span>
                        <span>{account.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                If selected, the income amount will be added to this
                account&apos;s balance.
              </p>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Income"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
