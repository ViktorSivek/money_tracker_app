"use client";

/**
 * Transactions Page
 * Clean tabbed interface for Income and Expenses
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeriodFilter, type Period } from "@/components/transactions/period-filter";
import { IncomeTab } from "@/components/transactions/income-tab";
import { ExpensesTab } from "@/components/transactions/expenses-tab";

export default function TransactionsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("this-month");
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const handleMonthChange = (newMonth: Date) => {
    setSelectedMonth(newMonth);
    setSelectedPeriod("custom");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Track and manage your income and expenses
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="income" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-2 h-12">
          <TabsTrigger value="income" className="text-base">Income</TabsTrigger>
          <TabsTrigger value="expenses" className="text-base">Expenses</TabsTrigger>
        </TabsList>

        {/* Period Filter - Shared across tabs */}
        <div>
          <PeriodFilter
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>

        <TabsContent value="income">
          <IncomeTab
            selectedPeriod={selectedPeriod}
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpensesTab
            selectedPeriod={selectedPeriod}
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
