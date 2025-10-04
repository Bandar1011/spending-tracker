"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { parseJPYInput } from "@/lib/format";
import { useMonth } from "@/hooks/useMonth";
import { paydaySchema } from "@/lib/validation";
import { toast } from "sonner";
import { CategoryFormList } from "@/components/CategoryFormList";

export default function SettingsPage() {
  const account = useStore((s) => s.account);
  const income = useStore((s) => s.income);
  const setAccount = useStore((s) => s.setAccount);
  const setIncome = useStore((s) => s.setIncome);
  const resetAll = useStore((s) => s.resetAll);
  const { hasLanded } = useMonth(income.payday);
  const [draft, setDraft] = useState({
    balance: account.currentBalance,
    amount: income.amount,
    payday: income.payday,
  });

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Link href="/" className="text-sm text-muted-foreground hover:underline">Return</Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block text-sm">Current balance (¥)</label>
          <Input inputMode="numeric" value={draft.balance} onChange={(e) => setDraft((d) => ({ ...d, balance: parseJPYInput(e.target.value) }))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="block text-sm">Monthly income (¥)</label>
            <Input inputMode="numeric" value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: parseJPYInput(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-sm">Payday (1–31)</label>
            <Input inputMode="numeric" value={draft.payday}
              onChange={(e) => {
                const v = Number(e.target.value);
                const res = paydaySchema.safeParse(v);
                if (res.success) setDraft((d) => ({ ...d, payday: v }));
              }} />
          </div>
          <div className="text-sm text-muted-foreground">Timezone: Asia/Tokyo</div>
          <div className="text-sm">
            Income status: {hasLanded ? "Landed" : "Not yet landed"}
          </div>
          <div className="pt-2">
            <Button onClick={() => {
              setAccount({ currentBalance: draft.balance });
              setIncome({ amount: draft.amount, payday: draft.payday });
              toast.success("Settings saved");
            }}>Save</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryFormList />
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button variant="destructive" onClick={() => { resetAll(); toast.success("Reset complete"); }}>Reset</Button>
      </div>
    </div>
  );
}

