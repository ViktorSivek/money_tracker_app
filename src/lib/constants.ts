// Currency configuration
export const CURRENCIES = {
  CZK: { symbol: "Kč", locale: "cs-CZ", position: "after" },
  EUR: { symbol: "€", locale: "de-DE", position: "before" },
  USD: { symbol: "$", locale: "en-US", position: "before" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const DEFAULT_CURRENCY: CurrencyCode = "CZK";

// Category colors for charts
export const CATEGORY_COLORS: Record<string, string> = {
  Housing: "#8b5cf6",
  "Food & Groceries": "#22c55e",
  "Restaurants & Dining": "#f97316",
  Transportation: "#3b82f6",
  Healthcare: "#ef4444",
  Entertainment: "#ec4899",
  Shopping: "#a855f7",
  Subscriptions: "#06b6d4",
  Travel: "#14b8a6",
  Education: "#f59e0b",
  "Personal Care": "#d946ef",
  "Gifts & Donations": "#f43f5e",
  Investments: "#10b981",
  "Fees & Charges": "#64748b",
  Income: "#22c55e",
  Other: "#94a3b8",
};

// Budget thresholds
export const BUDGET_THRESHOLDS = {
  SAFE: 0.8, // < 80% = green
  WARNING: 1.0, // 80-100% = yellow
  // > 100% = red
} as const;
