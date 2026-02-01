import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCIES, type CurrencyCode, DEFAULT_CURRENCY } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = DEFAULT_CURRENCY,
  options?: { showSign?: boolean; compact?: boolean; minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const config = CURRENCIES[currency];
  const {
    showSign = false,
    compact = false,
    minimumFractionDigits,
    maximumFractionDigits
  } = options || {};

  const formatter = new Intl.NumberFormat(config.locale, {
    style: "decimal",
    minimumFractionDigits: minimumFractionDigits ?? (compact ? 0 : 2),
    maximumFractionDigits: maximumFractionDigits ?? (compact ? 0 : 2),
    notation: compact ? "compact" : "standard",
  });

  const formatted = formatter.format(Math.abs(amount));
  const sign = showSign && amount !== 0 ? (amount > 0 ? "+" : "-") : "";

  if (config.position === "before") {
    return `${sign}${config.symbol}${formatted}`;
  }
  return `${sign}${formatted} ${config.symbol}`;
}

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

/**
 * Format a date relative to now
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return target.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Format a date for display
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const target = new Date(date);
  return target.toLocaleDateString(
    "cs-CZ",
    options || {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

/**
 * Get the current month's date range
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

/**
 * Calculate percentage of budget used
 */
export function calculateBudgetPercentage(
  spent: number,
  limit: number
): number {
  if (limit <= 0) return 0;
  return Math.abs(spent) / limit;
}

/**
 * Get budget status color based on percentage
 */
export function getBudgetStatusColor(percentage: number): string {
  if (percentage < 0.8) return "bg-chart-2"; // Green
  if (percentage <= 1) return "bg-chart-3"; // Yellow/Orange
  return "bg-destructive"; // Red
}

/**
 * Get budget status text color based on percentage
 */
export function getBudgetStatusTextColor(percentage: number): string {
  if (percentage < 0.8) return "text-chart-2";
  if (percentage <= 1) return "text-chart-3";
  return "text-destructive";
}

/**
 * Calculate P&L for investments
 */
export function calculatePnL(
  quantity: number,
  avgPrice: number,
  currentPrice: number
): { value: number; percentage: number } {
  const costBasis = quantity * avgPrice;
  const currentValue = quantity * currentPrice;
  const value = currentValue - costBasis;
  const percentage = costBasis > 0 ? (value / costBasis) * 100 : 0;
  return { value, percentage };
}
