"use client";

/**
 * Expenses Tab Component
 * Optimized with parallel queries and reduced API calls
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { MonthSelector } from "@/components/plan/month-selector";
import { AddExpenseDialog } from "./add-expense-dialog";
import { type Period } from "./period-filter";
import { TransactionSummaryCards } from "./transaction-summary-cards";
import { TransactionTable, type TransactionRow } from "./transaction-table";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import { createClient } from "@/lib/supabase/client";
import { createTransactionService, createExpenseService, type UnifiedTransaction } from "@/lib/services";
import { toast } from "sonner";

interface ExpensesTabProps {
  selectedPeriod: Period;
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}

export function ExpensesTab({ selectedPeriod, selectedMonth, onMonthChange }: ExpensesTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [periodTotal, setPeriodTotal] = useState(0);
  const [periodLabel, setPeriodLabel] = useState("This Month");

  const [editTransaction, setEditTransaction] = useState<UnifiedTransaction | null>(null);
  const [deleteTransaction, setDeleteTransaction] = useState<UnifiedTransaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const transactionService = createTransactionService(supabase);

      const now = new Date();
      let periodStart: string;
      let periodEnd: string;
      let label: string;

      // Determine period dates
      switch (selectedPeriod) {
        case "this-month":
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
          label = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          break;

        case "this-year":
          periodStart = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
          periodEnd = new Date(now.getFullYear(), 11, 31).toISOString().split("T")[0];
          label = `${now.getFullYear()} Total`;
          break;

        case "all-time":
          periodStart = "1970-01-01"; // Far past date
          periodEnd = new Date(now.getFullYear() + 1, 11, 31).toISOString().split("T")[0];
          label = "All Time";
          break;

        case "custom":
          periodStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).toISOString().split("T")[0];
          periodEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).toISOString().split("T")[0];
          label = selectedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          break;

        default:
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
          label = "This Month";
      }

      // Fetch period data
      const periodResult = await transactionService.getAll({
        startDate: periodStart,
        endDate: periodEnd
      });

      // Process period data - filter for expenses only
      const periodExpenses = (periodResult.data || []).filter((tx) => tx.type === "expense");
      const expenseData: TransactionRow[] = periodExpenses.map((tx) => ({
        id: tx.id,
        date: tx.date,
        category: tx.category || "Uncategorized",
        description: tx.description || "Expense",
        amount: tx.amount,
        isManual: tx.isManual,
        canEdit: tx.canEdit,
        canDelete: tx.canDelete,
      }));

      const periodTotalCalc = expenseData.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      if (!mountedRef.current) return;

      setTransactions(expenseData);
      setPeriodTotal(periodTotalCalc);
      setPeriodLabel(label);
    } catch (error) {
      console.error("Error fetching expense data:", error);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [selectedPeriod, selectedMonth]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (transaction: TransactionRow) => {
    const unified: UnifiedTransaction = {
      id: transaction.id,
      type: "expense",
      amount: transaction.amount,
      description: transaction.description || transaction.category,
      category: transaction.category,
      date: transaction.date,
      source: "transaction",
      isManual: transaction.isManual || false,
      canEdit: transaction.canEdit || false,
      canDelete: transaction.canDelete || false,
    };
    setEditTransaction(unified);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (transaction: TransactionRow) => {
    const unified: UnifiedTransaction = {
      id: transaction.id,
      type: "expense",
      amount: transaction.amount,
      description: transaction.description || transaction.category,
      category: transaction.category,
      date: transaction.date,
      source: "transaction",
      isManual: transaction.isManual || false,
      canEdit: transaction.canEdit || false,
      canDelete: transaction.canDelete || false,
    };
    setDeleteTransaction(unified);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTransaction) return;

    const supabase = createClient();
    const expenseService = createExpenseService(supabase);

    const result = await expenseService.delete(deleteTransaction.id);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Expense deleted successfully");
      fetchData();
    }
  };

  const showMonthNavigator = selectedPeriod === "this-month" || selectedPeriod === "custom";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Month Navigator */}
      {showMonthNavigator && (
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
        />
      )}

      {/* Summary Card */}
      <TransactionSummaryCards
        periodTotal={periodTotal}
        periodLabel={periodLabel}
        isLoading={isLoading}
        type="expense"
      />

      {/* Transaction Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Expense Transactions</h2>
          <AddExpenseDialog onSuccess={fetchData} />
        </div>
        <TransactionTable
          transactions={transactions}
          isLoading={isLoading}
          periodLabel={periodLabel}
          type="expense"
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyAction={<AddExpenseDialog onSuccess={fetchData} />}
        />
      </div>

      {/* Dialogs */}
      <EditTransactionDialog
        transaction={editTransaction}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={fetchData}
      />
      <DeleteTransactionDialog
        transaction={deleteTransaction}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
