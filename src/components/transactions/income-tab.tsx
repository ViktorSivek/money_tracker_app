"use client";

/**
 * Income Tab Component
 * Optimized with parallel queries and reduced API calls
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { MonthSelector } from "@/components/plan/month-selector";
import { AddIncomeDialog } from "@/components/dashboard/add-income-dialog";
import { type Period } from "./period-filter";
import { TransactionSummaryCards } from "./transaction-summary-cards";
import { TransactionTable, type TransactionRow } from "./transaction-table";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import { createClient } from "@/lib/supabase/client";
import { createIncomeService, type UnifiedTransaction } from "@/lib/services";
import { toast } from "sonner";

interface IncomeTabProps {
  selectedPeriod: Period;
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}

export function IncomeTab({ selectedPeriod, selectedMonth, onMonthChange }: IncomeTabProps) {
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
      const incomeService = createIncomeService(supabase);

      const now = new Date();
      let incomeData: TransactionRow[] = [];
      let total = 0;
      let label = "This Month";

      // Fetch period-specific data based on selection
      let periodPromise;

      switch (selectedPeriod) {
        case "this-month":
          periodPromise = incomeService.getByMonth(now.getFullYear(), now.getMonth());
          label = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          break;

        case "this-year": {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          const endOfYear = new Date(now.getFullYear(), 11, 31);
          periodPromise = incomeService.getByDateRange(startOfYear, endOfYear);
          label = `${now.getFullYear()} Total`;
          break;
        }

        case "all-time":
          periodPromise = incomeService.getAll();
          label = "All Time";
          break;

        case "custom":
          periodPromise = incomeService.getByMonth(selectedMonth.getFullYear(), selectedMonth.getMonth());
          label = selectedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          break;

        default:
          periodPromise = incomeService.getByMonth(now.getFullYear(), now.getMonth());
          label = "This Month";
      }

      // Wait for period data
      const periodResult = await periodPromise;

      if (!mountedRef.current) return;

      // Process period data
      incomeData = (periodResult.data || []).map((inc) => ({
        id: inc.id,
        date: inc.income_date,
        category: inc.category,
        description: inc.description || inc.category,
        amount: Number(inc.amount),
        isManual: true,
        canEdit: true,
        canDelete: true,
      }));

      total = incomeData.reduce((sum, inc) => sum + inc.amount, 0);

      setTransactions(incomeData);
      setPeriodTotal(total);
      setPeriodLabel(label);
    } catch (error) {
      console.error("Error fetching income data:", error);
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
      type: "income",
      amount: transaction.amount,
      description: transaction.description || transaction.category,
      category: transaction.category,
      date: transaction.date,
      source: "income",
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
      type: "income",
      amount: transaction.amount,
      description: transaction.description || transaction.category,
      category: transaction.category,
      date: transaction.date,
      source: "income",
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
    const incomeService = createIncomeService(supabase);

    const result = await incomeService.delete(deleteTransaction.id);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Income deleted successfully");
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
        type="income"
      />

      {/* Transaction Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Income Transactions</h2>
          <AddIncomeDialog onSuccess={fetchData} />
        </div>
        <TransactionTable
          transactions={transactions}
          isLoading={isLoading}
          periodLabel={periodLabel}
          type="income"
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyAction={<AddIncomeDialog onSuccess={fetchData} />}
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
