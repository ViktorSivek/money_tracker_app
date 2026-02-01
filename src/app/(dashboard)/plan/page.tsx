"use client";

/**
 * Plan Page
 * Budget planning with expected income, investment targets, and category budgets
 */

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import {
  IncomeTargetCard,
  InvestmentTargetCard,
  CategoryBudgetList,
  PlanSummaryCard,
} from "@/components/plan";
import { createClient } from "@/lib/supabase/client";
import {
  createPlanService,
  type CategoryBudgetWithSpending,
  type PlanSummary,
} from "@/lib/services";

export default function PlanPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [expectedIncome, setExpectedIncome] = useState(0);
  const [investmentTarget, setInvestmentTarget] = useState(0);
  const [budgets, setBudgets] = useState<CategoryBudgetWithSpending[]>([]);
  const [summary, setSummary] = useState<PlanSummary | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const service = createPlanService(supabase);

      // Fetch all plan data in parallel
      const [planResult, budgetsResult, summaryResult] = await Promise.all([
        service.getPlan(),
        service.getBudgetsWithSpending(),
        service.getPlanSummary(),
      ]);

      if (planResult.data) {
        setExpectedIncome(Number(planResult.data.expected_income) || 0);
        setInvestmentTarget(Number(planResult.data.investment_target) || 0);
      }

      if (budgetsResult.data) {
        setBudgets(budgetsResult.data);
      }

      if (summaryResult.data) {
        setSummary(summaryResult.data);
      }
    } catch (error) {
      console.error("Error fetching plan data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Plan</h1>
          <p className="text-sm text-muted-foreground">
            Set your monthly budget plan
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
          Set your monthly budget plan
        </p>
      </div>

      {/* Income and Investment Target Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <IncomeTargetCard
          expectedIncome={expectedIncome}
          onUpdate={fetchData}
        />
        <InvestmentTargetCard
          investmentTarget={investmentTarget}
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
