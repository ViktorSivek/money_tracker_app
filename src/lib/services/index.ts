/**
 * Services Index
 * Clean exports for all service modules
 */

export {
  IncomeService,
  createIncomeService,
  type AddIncomeParams,
  type IncomeServiceResult,
} from "./income.service";

export {
  MonthlySummaryService,
  createMonthlySummaryService,
  type MonthlySummaryData,
  type MonthlyServiceResult,
} from "./monthly-summary.service";

export {
  TransactionService,
  createTransactionService,
  type UnifiedTransaction,
  type TransactionFilters,
  type TransactionType,
  type TransactionServiceResult,
} from "./transaction.service";

export {
  ExpenseService,
  createExpenseService,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_EMOJI,
  type ExpenseCategory,
  type AddExpenseParams,
  type UpdateExpenseParams,
  type ExpenseServiceResult,
} from "./expense.service";
