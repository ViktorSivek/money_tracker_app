"use client";

/**
 * Category Budget Dialog Component
 * Dialog for adding or editing a category budget
 */

import { useState, useEffect } from "react";
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
import { createPlanService, EXPENSE_CATEGORIES, EXPENSE_CATEGORY_EMOJI } from "@/lib/services";
import type { CategoryBudgetWithSpending } from "@/lib/services";

interface CategoryBudgetDialogProps {
  budget?: CategoryBudgetWithSpending | null;
  existingCategories: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function CategoryBudgetDialog({
  budget,
  existingCategories,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
  trigger,
}: CategoryBudgetDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState(budget?.category || "");
  const [monthlyLimit, setMonthlyLimit] = useState(
    budget?.monthlyLimit?.toString() || ""
  );

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const isEditing = !!budget;

  // Filter out categories that already have budgets (unless editing)
  const availableCategories = EXPENSE_CATEGORIES.filter(
    (cat) => !existingCategories.includes(cat) || cat === budget?.category
  );

  // Reset form when dialog opens or budget changes
  useEffect(() => {
    if (open) {
      setCategory(budget?.category || "");
      setMonthlyLimit(budget?.monthlyLimit?.toString() || "");
      setError(null);
    }
  }, [open, budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const service = createPlanService(supabase);

      const parsedLimit = parseFloat(monthlyLimit.replace(/[^\d.-]/g, ""));

      if (!category) {
        setError("Please select a category");
        setIsLoading(false);
        return;
      }

      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        setError("Please enter a valid limit greater than 0");
        setIsLoading(false);
        return;
      }

      const emoji = EXPENSE_CATEGORY_EMOJI[category as keyof typeof EXPENSE_CATEGORY_EMOJI];

      if (isEditing && budget) {
        const result = await service.updateBudget(budget.id, parsedLimit, emoji);
        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
      } else {
        const result = await service.addBudget(category, parsedLimit, emoji);
        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
      }

      setOpen(false);
      onSuccess();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Budget dialog error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Budget" : "Add Category Budget"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Update the budget limit for ${budget.category}`
                : "Set a monthly spending limit for a category"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              {isEditing ? (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                  <span>{budget.emoji || "📊"}</span>
                  <span>{budget.category}</span>
                </div>
              ) : (
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        <span className="flex items-center gap-2">
                          <span>
                            {EXPENSE_CATEGORY_EMOJI[cat as keyof typeof EXPENSE_CATEGORY_EMOJI] || "📊"}
                          </span>
                          <span>{cat}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Monthly Limit */}
            <div className="grid gap-2">
              <Label htmlFor="limit">Monthly Limit (Kc)</Label>
              <Input
                id="limit"
                type="text"
                inputMode="decimal"
                placeholder="10,000"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="font-mono-numbers"
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Saving..." : "Adding..."}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Budget"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Default trigger button for adding budgets
export function AddBudgetButton({
  existingCategories,
  onSuccess,
}: {
  existingCategories: string[];
  onSuccess: () => void;
}) {
  return (
    <CategoryBudgetDialog
      existingCategories={existingCategories}
      onSuccess={onSuccess}
      trigger={
        <Button variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add Category Budget
        </Button>
      }
    />
  );
}
