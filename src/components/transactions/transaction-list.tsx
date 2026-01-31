"use client";

/**
 * Transaction List Component
 * Displays a list of transactions with tabs for expenses/income
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  MoreHorizontal,
  Trash2,
  Pencil,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  createTransactionService,
  createExpenseService,
  type UnifiedTransaction,
  type TransactionFilters,
  type TransactionType,
} from "@/lib/services";
import { TransactionFiltersComponent } from "./transaction-filters";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { AddExpenseDialog } from "./add-expense-dialog";
import { AddIncomeDialog } from "@/components/dashboard/add-income-dialog";
import type { Account } from "@/types/database";

interface TransactionListProps {
  accounts: Account[];
}

export function TransactionList({ accounts }: TransactionListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "expense",
    category: "all",
  });

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<UnifiedTransaction | null>(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<UnifiedTransaction | null>(null);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const service = createTransactionService(supabase);

      const [transactionsResult, categoriesResult] = await Promise.all([
        service.getAll(filters),
        service.getCategories(),
      ]);

      if (transactionsResult.error) {
        setError(transactionsResult.error);
        return;
      }

      setTransactions(transactionsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (err) {
      setError("Failed to load transactions");
      console.error("Load transactions error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Update filter type when tab changes
  const handleTabChange = (tab: string) => {
    const newTab = tab as "expense" | "income";
    setActiveTab(newTab);
    setFilters((prev) => ({
      ...prev,
      type: newTab as TransactionType,
      category: "all", // Reset category when switching tabs
    }));
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;

    try {
      const supabase = createClient();

      if (transactionToDelete.source === "income") {
        const service = createTransactionService(supabase);
        const result = await service.deleteIncome(transactionToDelete.id);
        if (result.error) {
          setError(result.error);
          return;
        }
      } else {
        const service = createExpenseService(supabase);
        const result = await service.delete(transactionToDelete.id);
        if (result.error) {
          setError(result.error);
          return;
        }
      }

      // Refresh the list
      await loadTransactions();
      router.refresh();
    } catch (err) {
      setError("Failed to delete transaction");
      console.error("Delete transaction error:", err);
    }
  };

  const openDeleteDialog = (transaction: UnifiedTransaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (transaction: UnifiedTransaction) => {
    setTransactionToEdit(transaction);
    setEditDialogOpen(true);
  };

  const handleTransactionUpdated = () => {
    loadTransactions();
  };

  return (
    <div className="space-y-6">
      {/* Tabs for Expense/Income */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="expense" className="gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="income" className="gap-2">
              <ArrowDownLeft className="h-4 w-4" />
              Income
            </TabsTrigger>
          </TabsList>

          {/* Add Button based on active tab */}
          {activeTab === "expense" ? (
            <AddExpenseDialog onSuccess={handleTransactionUpdated} />
          ) : (
            <AddIncomeDialog
              accounts={accounts}
              onSuccess={handleTransactionUpdated}
            />
          )}
        </div>

        {/* Filters */}
        <Card className="bg-linear-to-br from-card to-card/80 border-border/50 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Transaction Lists */}
        <TabsContent value="expense">
          <TransactionTable
            transactions={transactions}
            isLoading={isLoading}
            error={error}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            emptyMessage="No expenses found"
            emptyAction={
              <AddExpenseDialog onSuccess={handleTransactionUpdated} />
            }
          />
        </TabsContent>

        <TabsContent value="income">
          <TransactionTable
            transactions={transactions}
            isLoading={isLoading}
            error={error}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            emptyMessage="No income found"
            emptyAction={
              <AddIncomeDialog
                accounts={accounts}
                onSuccess={handleTransactionUpdated}
              />
            }
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteTransactionDialog
        transaction={transactionToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />

      {/* Edit Dialog */}
      <EditTransactionDialog
        transaction={transactionToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleTransactionUpdated}
      />
    </div>
  );
}

// Extracted TransactionTable component for reuse
interface TransactionTableProps {
  transactions: UnifiedTransaction[];
  isLoading: boolean;
  error: string | null;
  onEdit: (transaction: UnifiedTransaction) => void;
  onDelete: (transaction: UnifiedTransaction) => void;
  emptyMessage: string;
  emptyAction: React.ReactNode;
}

function TransactionTable({
  transactions,
  isLoading,
  error,
  onEdit,
  onDelete,
  emptyMessage,
  emptyAction,
}: TransactionTableProps) {
  return (
    <Card className="bg-linear-to-br from-card to-card/80 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Transactions
          {!isLoading && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({transactions.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

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
                key={`${tx.source}-${tx.id}`}
                className="flex items-center justify-between py-3 group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`p-2.5 rounded-lg shrink-0 ${
                      tx.type === "expense"
                        ? "bg-destructive/10"
                        : "bg-chart-2/10"
                    }`}
                  >
                    {tx.type === "expense" ? (
                      <ArrowUpRight className="w-4 h-4 text-destructive" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-chart-2" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {tx.description}
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
                      {tx.isManual && (
                        <>
                          <span>•</span>
                          <span className="text-primary">Manual</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <p
                    className={`text-sm font-semibold font-mono-numbers ${
                      tx.type === "expense"
                        ? "text-destructive"
                        : "text-chart-2"
                    }`}
                  >
                    {formatCurrency(tx.amount, "CZK", { showSign: true })}
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
                        {tx.canEdit && (
                          <DropdownMenuItem onClick={() => onEdit(tx)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {tx.canEdit && tx.canDelete && <DropdownMenuSeparator />}
                        {tx.canDelete && (
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
