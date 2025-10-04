"use client";
import { MoneyCard } from "@/components/MoneyCard";
import { PieChartPanel } from "@/components/PieChartPanel";
import { TransactionsTable } from "@/components/TransactionsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionDialog } from "@/components/TransactionDialog";
import { useStore, totalSpentThisMonth } from "@/lib/store";
import { useMonth } from "@/hooks/useMonth";
import { formatJPY } from "@/lib/format";

export default function Home() {
  const income = useStore((s) => s.income);
  const transactions = useStore((s) => s.transactions);
  const { monthLabel, hasLanded } = useMonth(income.payday);
  const totalSpent = totalSpentThisMonth(transactions);
  const availableIncome = hasLanded ? income.amount : 0;
  const projectedSavings = availableIncome - totalSpent;
  const hideValues = transactions.length === 0;

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Budget Pie</h1>
        <div className="flex items-center gap-3">
          <a className="text-sm text-muted-foreground hover:underline" href="/settings">Settings</a>
          <TransactionDialog />
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MoneyCard
          title={`This Month — ${monthLabel}`}
          primary={availableIncome}
          rows={[
            { label: "Total Spent", value: totalSpent },
            { label: "Remaining", value: availableIncome - totalSpent, tone: availableIncome - totalSpent < 0 ? "danger" : "default" },
            { label: "Projected Savings", value: projectedSavings, tone: projectedSavings < 0 ? "danger" : "muted" },
          ]}
          hideValues={hideValues}
        />
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <PieChartPanel />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Recent Transactions</h2>
        <TransactionsTable />
      </section>
    </div>
  );
}
