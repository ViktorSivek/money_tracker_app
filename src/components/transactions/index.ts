/**
 * Transaction Components Index
 * Clean exports for all transaction-related components
 */

// Legacy components (kept for reference)
export { TransactionList } from "./transaction-list";
export { TransactionFiltersComponent } from "./transaction-filters";
export { DeleteTransactionDialog } from "./delete-transaction-dialog";
export { AddExpenseDialog } from "./add-expense-dialog";
export { EditTransactionDialog } from "./edit-transaction-dialog";

// New shared components
export { PeriodFilter } from "./period-filter";
export { TransactionSummaryCards } from "./transaction-summary-cards";
export { TransactionTable } from "./transaction-table";

// Tab components
export { IncomeTab } from "./income-tab";
export { ExpensesTab } from "./expenses-tab";

// Types
export type { Period } from "./period-filter";
export type { TransactionRow } from "./transaction-table";
