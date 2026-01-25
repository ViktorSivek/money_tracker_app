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
