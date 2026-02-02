"use client";

/**
 * Monthly Overview Component
 * Client-side wrapper that manages month selection and data fetching
 */

import { useState, useEffect, useCallback } from "react";
import { MonthSelector } from "./month-selector";
import { MonthlySummaryCards } from "./monthly-summary-cards";
import { MonthlyTrendChart } from "./monthly-trend-chart";
import { createClient } from "@/lib/supabase/client";
import {
  createMonthlySummaryService,
  type MonthlySummaryData,
} from "@/lib/services";

interface MonthlyOverviewProps {
  initialYear?: number;
  initialMonth?: number;
}

export function MonthlyOverview({
  initialYear,
  initialMonth,
}: MonthlyOverviewProps) {
  const now = new Date();
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? now.getMonth());
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<MonthlySummaryData | null>(
    null
  );
  const [dailyData, setDailyData] = useState<Array<{
    day: string;
    income: number;
    expenses: number;
  }>>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const summaryService = createMonthlySummaryService(supabase);

      // Fetch current month summary
      const summaryResult = await summaryService.getMonthSummary(year, month);
      if (summaryResult.data) {
        setSummaryData(summaryResult.data);
      }

      // Fetch daily accumulation data for the selected month
      const dailyResult = await summaryService.getDailyAccumulation(year, month);
      if (dailyResult.data) {
        setDailyData(dailyResult.data);
      }
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  return (
    <div className="space-y-4">
      {/* Month Selector */}
      <div className="flex justify-center">
        <MonthSelector year={year} month={month} onChange={handleMonthChange} />
      </div>

      {/* Monthly Summary Cards */}
      <MonthlySummaryCards
        totalIncome={summaryData?.totalIncome ?? 0}
        totalExpenses={summaryData?.totalExpenses ?? 0}
        savings={summaryData?.savings ?? 0}
        savingsRate={summaryData?.savingsRate ?? 0}
        isLoading={isLoading}
      />

      {/* Daily Accumulation Chart */}
      <MonthlyTrendChart data={dailyData} isLoading={isLoading} />
    </div>
  );
}
