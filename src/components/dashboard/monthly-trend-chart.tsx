"use client";

/**
 * Monthly Trend Chart Component
 * Displays income vs expenses trend over time using Tremor charts
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, BarChart } from "@tremor/react";
import { BarChart3, LineChart, TrendingUp } from "lucide-react";
import type { MonthlyTrendData } from "@/types/database";

interface MonthlyTrendChartProps {
  data: MonthlyTrendData[];
  isLoading?: boolean;
}

type ChartType = "area" | "bar";

// Custom formatter for currency values
const currencyFormatter = (value: number) => {
  return (
    new Intl.NumberFormat("cs-CZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(value) + " Kč"
  );
};

export function MonthlyTrendChart({
  data,
  isLoading = false,
}: MonthlyTrendChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area");

  if (isLoading) {
    return (
      <Card className="bg-linear-to-br from-card to-card/80 border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Check if we have any data
  const hasData = data.some(
    (d) => d.income > 0 || d.expenses > 0 || d.savings !== 0
  );

  return (
    <Card className="bg-linear-to-br from-card to-card/80 border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Monthly Trend
            </CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant={chartType === "area" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setChartType("area")}
              aria-label="Area chart"
            >
              <LineChart className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={chartType === "bar" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setChartType("bar")}
              aria-label="Bar chart"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            No data available. Add income to see trends.
          </div>
        ) : chartType === "area" ? (
          <AreaChart
            className="h-[250px]"
            data={data}
            index="month"
            categories={["income", "expenses"]}
            colors={["emerald", "rose"]}
            valueFormatter={currencyFormatter}
            showLegend={true}
            showGridLines={false}
            showAnimation={true}
            curveType="monotone"
            yAxisWidth={65}
            customTooltip={({ payload, active }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0]?.payload as MonthlyTrendData;
              return (
                <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                  <p className="font-semibold text-sm mb-2">{item.month}</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-chart-2">
                      Income: {currencyFormatter(item.income)}
                    </p>
                    <p className="text-destructive">
                      Expenses: {currencyFormatter(item.expenses)}
                    </p>
                    <p
                      className={
                        item.savings >= 0 ? "text-primary" : "text-destructive"
                      }
                    >
                      Savings: {currencyFormatter(item.savings)}
                    </p>
                  </div>
                </div>
              );
            }}
          />
        ) : (
          <BarChart
            className="h-[250px]"
            data={data}
            index="month"
            categories={["income", "expenses", "savings"]}
            colors={["emerald", "rose", "cyan"]}
            valueFormatter={currencyFormatter}
            showLegend={true}
            showGridLines={false}
            showAnimation={true}
            yAxisWidth={65}
            customTooltip={({ payload, active }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0]?.payload as MonthlyTrendData;
              return (
                <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                  <p className="font-semibold text-sm mb-2">{item.month}</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-chart-2">
                      Income: {currencyFormatter(item.income)}
                    </p>
                    <p className="text-destructive">
                      Expenses: {currencyFormatter(item.expenses)}
                    </p>
                    <p
                      className={
                        item.savings >= 0 ? "text-primary" : "text-destructive"
                      }
                    >
                      Savings: {currencyFormatter(item.savings)}
                    </p>
                  </div>
                </div>
              );
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
