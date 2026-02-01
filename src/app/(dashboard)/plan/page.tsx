"use client";

/**
 * Plan Page
 * Month-by-month budget planning with expected income, investment targets, and category budgets
 */

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import {
  IncomeTargetCard,
  InvestmentTargetCard,
  CategoryBudgetList,
  PlanSummaryCard,
  MonthSelector,
  IncomeProgressBar,
} from "@/components/plan";
import { createClient } from "@/lib/supabase/client";
import {
  createPlanService,
  type CategoryBudgetWithSpending,
  type PlanSummary,
} from "@/lib/services";

export default function PlanPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [expectedIncome, setExpectedIncome] = useState(0);
  const [actualIncome, setActualIncome] = useState(0);
  const [investmentTarget, setInvestmentTarget] = useState(0);
  const [budgets, setBudgets] = useState<CategoryBudgetWithSpending[]>([]);
  const [summary, setSummary] = useState<PlanSummary | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const service = createPlanService(supabase);

      // Fetch all plan data for the selected month
      const [planResult, budgetsResult, summaryResult] = await Promise.all([
        service.getPlan(selectedMonth),
        service.getBudgetsWithSpending(selectedMonth),
        service.getPlanSummary(selectedMonth),
      ]);

      if (planResult.data) {
        setExpectedIncome(Number(planResult.data.expected_income) || 0);
        setInvestmentTarget(Number(planResult.data.investment_target) || 0);
      } else {
        // No plan for this month yet
        setExpectedIncome(0);
        setInvestmentTarget(0);
      }

      if (budgetsResult.data) {
        setBudgets(budgetsResult.data);
      }

      if (summaryResult.data) {
        setSummary(summaryResult.data);
        setActualIncome(summaryResult.data.actualIncome);
      }
    } catch (error) {
      console.error("Error fetching plan data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMonthChange = (newMonth: Date) => {
    setSelectedMonth(newMonth);
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Plan</h1>
          <p className="text-sm text-muted-foreground">
            Plan your budget month by month
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Plan</h1>
        <p className="text-sm text-muted-foreground">
          Plan your budget month by month
        </p>
      </div>

      {/* Month Selector */}
      <MonthSelector
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
      />

      {/* Income Progress Bar */}
      <IncomeProgressBar
        expectedIncome={expectedIncome}
        actualIncome={actualIncome}
        currency="CZK"
      />

      {/* Income and Investment Target Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <IncomeTargetCard
          expectedIncome={expectedIncome}
          month={selectedMonth}
          onUpdate={fetchData}
        />
        <InvestmentTargetCard
          investmentTarget={investmentTarget}
          month={selectedMonth}
          onUpdate={fetchData}
        />
      </div>

      {/* Category Budgets */}
      <CategoryBudgetList
        budgets={budgets}
        isLoading={false}
        onUpdate={fetchData}
      />

      {/* Summary Card */}
      <PlanSummaryCard summary={summary} isLoading={false} />
    </div>
  );
}
