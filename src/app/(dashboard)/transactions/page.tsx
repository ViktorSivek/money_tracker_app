import { createClient } from "@/lib/supabase/server";
import { TransactionList } from "@/components/transactions";
import type { Account } from "@/types/database";

async function getTransactionsPageData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get accounts for the AddIncomeDialog
  const { data: accounts } = (await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)) as { data: Account[] | null };

  return {
    accounts: accounts || [],
  };
}

export default async function TransactionsPage() {
  const data = await getTransactionsPageData();

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">
          Please log in to view your transactions
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your income and expenses
        </p>
      </div>

      {/* Transaction List with Filters */}
      <TransactionList accounts={data.accounts} />
    </div>
  );
}
