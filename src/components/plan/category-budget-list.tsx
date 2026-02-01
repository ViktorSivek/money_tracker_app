"use client";

/**
 * Category Budget List Component
 * Lists all category budgets with progress tracking
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategoryBudgetItem } from "./category-budget-item";
import { CategoryBudgetDialog, AddBudgetButton } from "./category-budget-dialog";
import { createClient } from "@/lib/supabase/client";
import { createPlanService } from "@/lib/services";
import type { CategoryBudgetWithSpending } from "@/lib/services";

interface CategoryBudgetListProps {
  budgets: CategoryBudgetWithSpending[];
  isLoading: boolean;
  onUpdate: () => void;
}

export function CategoryBudgetList({
  budgets,
  isLoading,
  onUpdate,
}: CategoryBudgetListProps) {
  const [editingBudget, setEditingBudget] =
    useState<CategoryBudgetWithSpending | null>(null);
  const [deletingBudget, setDeletingBudget] =
    useState<CategoryBudgetWithSpending | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const existingCategories = budgets.map((b) => b.category);

  const handleEdit = (budget: CategoryBudgetWithSpending) => {
    setEditingBudget(budget);
  };

  const handleDelete = (budget: CategoryBudgetWithSpending) => {
    setDeletingBudget(budget);
  };

  const confirmDelete = async () => {
    if (!deletingBudget) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const service = createPlanService(supabase);

      const result = await service.deleteBudget(deletingBudget.id);
      if (!result.error) {
        onUpdate();
      }
    } finally {
      setIsDeleting(false);
      setDeletingBudget(null);
    }
  };

  return (
    <>
      <Card className="bg-linear-to-br from-card to-card/80 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Category Budgets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No category budgets set yet
              </p>
              <AddBudgetButton
                existingCategories={existingCategories}
                onSuccess={onUpdate}
              />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="divide-y divide-border/50">
                {budgets.map((budget) => (
                  <CategoryBudgetItem
                    key={budget.id}
                    budget={budget}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              <div className="pt-4">
                <AddBudgetButton
                  existingCategories={existingCategories}
                  onSuccess={onUpdate}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <CategoryBudgetDialog
        budget={editingBudget}
        existingCategories={existingCategories}
        open={!!editingBudget}
        onOpenChange={(open) => !open && setEditingBudget(null)}
        onSuccess={() => {
          setEditingBudget(null);
          onUpdate();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingBudget}
        onOpenChange={(open) => !open && setDeletingBudget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the budget for{" "}
              <span className="font-medium">{deletingBudget?.category}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
