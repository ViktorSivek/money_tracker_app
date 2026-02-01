import { TransactionList } from "@/components/transactions";

export default function TransactionsPage() {
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
      <TransactionList />
    </div>
  );
}
