export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Income category enum
export type IncomeCategory =
  | "Salary"
  | "Freelance"
  | "Investment"
  | "Bonus"
  | "Gift"
  | "Other";

export const INCOME_CATEGORIES: IncomeCategory[] = [
  "Salary",
  "Freelance",
  "Investment",
  "Bonus",
  "Gift",
  "Other",
];

export const INCOME_CATEGORY_EMOJI: Record<IncomeCategory, string> = {
  Salary: "💼",
  Freelance: "💻",
  Investment: "📈",
  Bonus: "🎉",
  Gift: "🎁",
  Other: "💰",
};

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          balance: number;
          currency: string;
          is_investment: boolean;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          balance?: number;
          currency?: string;
          is_investment?: boolean;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          balance?: number;
          currency?: string;
          is_investment?: boolean;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          monthly_limit: number;
          emoji: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          monthly_limit: number;
          emoji?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          monthly_limit?: number;
          emoji?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          emoji: string;
          color: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          emoji: string;
          color?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          emoji?: string;
          color?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          emoji: string;
          color: string;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          emoji?: string;
          color?: string;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          emoji?: string;
          color?: string;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      investments: {
        Row: {
          id: string;
          user_id: string;
          ticker: string;
          name: string | null;
          quantity: number;
          average_buy_price: number;
          current_price: number | null;
          currency: string;
          asset_type: string;
          last_updated: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticker: string;
          name?: string | null;
          quantity: number;
          average_buy_price: number;
          current_price?: number | null;
          currency?: string;
          asset_type?: string;
          last_updated?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ticker?: string;
          name?: string | null;
          quantity?: number;
          average_buy_price?: number;
          current_price?: number | null;
          currency?: string;
          asset_type?: string;
          last_updated?: string | null;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          transaction_date: string;
          amount: number;
          currency: string;
          original_description: string | null;
          merchant_clean: string | null;
          category: string | null;
          unique_id: string;
        };
        Insert: {
          id?: string;
          transaction_date: string;
          amount: number;
          currency?: string;
          original_description?: string | null;
          merchant_clean?: string | null;
          category?: string | null;
          unique_id: string;
        };
        Update: {
          id?: string;
          transaction_date?: string;
          amount?: number;
          currency?: string;
          original_description?: string | null;
          merchant_clean?: string | null;
          category?: string | null;
          unique_id?: string;
        };
      };
      income: {
        Row: {
          id: string;
          user_id: string;
          account_id: string | null;
          amount: number;
          description: string | null;
          income_date: string;
          category: IncomeCategory;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id?: string | null;
          amount: number;
          description?: string | null;
          income_date: string;
          category?: IncomeCategory;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string | null;
          amount?: number;
          description?: string | null;
          income_date?: string;
          category?: IncomeCategory;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      user_net_worth: {
        Row: {
          user_id: string;
          total_accounts: number;
          total_investments: number;
          net_worth: number;
        };
      };
      user_liquid_cash: {
        Row: {
          user_id: string;
          total_liquid_accounts: number;
          total_allocated_goals: number;
          liquid_cash: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types for easier usage
export type Account = Database["public"]["Tables"]["accounts"]["Row"];
export type AccountInsert = Database["public"]["Tables"]["accounts"]["Insert"];
export type AccountUpdate = Database["public"]["Tables"]["accounts"]["Update"];

export type Budget = Database["public"]["Tables"]["budgets"]["Row"];
export type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];
export type BudgetUpdate = Database["public"]["Tables"]["budgets"]["Update"];

export type Category = Database["public"]["Tables"]["categories"]["Row"];

export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
export type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];

export type Investment = Database["public"]["Tables"]["investments"]["Row"];
export type InvestmentInsert =
  Database["public"]["Tables"]["investments"]["Insert"];
export type InvestmentUpdate =
  Database["public"]["Tables"]["investments"]["Update"];

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export type Income = Database["public"]["Tables"]["income"]["Row"];
export type IncomeInsert = Database["public"]["Tables"]["income"]["Insert"];
export type IncomeUpdate = Database["public"]["Tables"]["income"]["Update"];

// Monthly summary types for dashboard
export interface MonthlySummary {
  month: Date;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
}

export interface MonthlyTrendData {
  month: string; // "Jan 2026"
  income: number;
  expenses: number;
  savings: number;
}
