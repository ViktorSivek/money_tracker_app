"use client";

/**
 * Daily Accumulation Chart Component
 * Shows day-by-day cumulative income and expenses for selected month
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart } from "@tremor/react";
import { TrendingUp } from "lucide-react";

interface DailyData {
  day: string;
  income: number;
  expenses: number;
}

interface MonthlyTrendChartProps {
  data: DailyData[];
  isLoading?: boolean;
}

// Custom formatter for currency values
const currencyFormatter = (value: number) => {
  return (
    new Intl.NumberFormat("cs-CZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + " Kč"
  );
};

export function MonthlyTrendChart({
  data,
  isLoading = false,
}: MonthlyTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="bg-linear-to-br from-card to-card/80 border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Check if we have any data
  const hasData = data.some((d) => d.income > 0 || d.expenses > 0);

  // Calculate max value with 30% padding for better visualization
  const maxDataValue = Math.max(
    ...data.map((d) => Math.max(d.income, d.expenses))
  );
  const paddedMaxValue = maxDataValue * 1.3; // Add 30% padding above highest value

  return (
    <Card className="bg-linear-to-br from-card to-card/80 border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">
            Daily Accumulation
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-80 text-muted-foreground text-sm">
            No data available for this month.
          </div>
        ) : (
          <AreaChart
            className="h-80 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-legend-item-text]:fill-foreground"
            data={data}
            index="day"
            categories={["income", "expenses"]}
            colors={["emerald", "rose"]}
            valueFormatter={currencyFormatter}
            showLegend={true}
            showGridLines={false}
            showAnimation={true}
            curveType="linear"
            yAxisWidth={90}
            enableLegendSlider={false}
            connectNulls={true}
            minValue={0}
            maxValue={paddedMaxValue}
            customTooltip={({ payload, active }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0]?.payload as DailyData;
              const savings = item.income - item.expenses;
              return (
                <div className="bg-background/95 backdrop-blur-sm border-2 border-border rounded-lg p-4 shadow-xl">
                  <p className="font-bold text-base mb-3 text-foreground">Day {item.day}</p>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between gap-8">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="font-semibold text-foreground">Income</span>
                      </div>
                      <span className="font-mono font-bold text-foreground">{currencyFormatter(item.income)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-8">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <span className="font-semibold text-foreground">Expenses</span>
                      </div>
                      <span className="font-mono font-bold text-foreground">{currencyFormatter(item.expenses)}</span>
                    </div>
                    <div className="pt-2.5 mt-2.5 border-t-2 border-border">
                      <div className="flex items-center justify-between gap-8">
                        <span className={`font-bold ${savings >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          Savings
                        </span>
                        <span className="font-mono font-bold text-lg text-foreground">{currencyFormatter(savings)}</span>
                      </div>
                    </div>
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
