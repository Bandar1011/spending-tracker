"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOKYO } from "@/lib/month";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(tz);

export type Account = { currentBalance: number };
export type Income = { amount: number; payday: number; timezone: "Asia/Tokyo" };
export type Category = { id: string; name: string; isArchived: boolean };
export type Transaction = { id: string; categoryId?: string | null; amount: number; occurredAt: string; note?: string };

type UIState = { messages: Array<{ id: string; title: string; description?: string; variant?: "default" | "success" | "error" }>; };

export type StoreState = {
  account: Account;
  income: Income;
  categories: Category[];
  transactions: Transaction[];
  ui: UIState;
  // actions
  setAccount: (patch: Partial<Account>) => void;
  setIncome: (patch: Partial<Income>) => void;
  upsertCategories: (cats: Category[]) => void;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  resetAll: () => void;
};

const seed: Omit<StoreState, "setAccount" | "setIncome" | "upsertCategories" | "addTransaction" | "deleteTransaction" | "resetAll"> = {
  account: { currentBalance: 0 },
  income: { amount: 200_000, payday: 27, timezone: "Asia/Tokyo" },
  categories: [
    { id: uuid(), name: "Food", isArchived: false },
    { id: uuid(), name: "Rent", isArchived: false },
    { id: uuid(), name: "Utilities", isArchived: false },
    { id: uuid(), name: "Going Out", isArchived: false },
    { id: uuid(), name: "Snacks", isArchived: false },
  ],
  transactions: [],
  ui: { messages: [] },
};

// Seed a couple of demo transactions in current month
const now = dayjs().tz(TOKYO);
const monthStart = now.startOf("month");
const demoTx = [
  { amount: 1200, note: "Coffee", daysFromStart: 1 },
  { amount: 4500, note: "Groceries", daysFromStart: 3 },
  { amount: 18000, note: "Dining", daysFromStart: 8 },
].map((x) => ({
  id: uuid(),
  categoryId: null,
  amount: x.amount,
  occurredAt: monthStart.add(x.daysFromStart, "day").toISOString(),
  note: x.note,
}));

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...seed,
      transactions: demoTx,
      setAccount: (patch) => set((s) => ({ account: { ...s.account, ...patch } })),
      setIncome: (patch) => set((s) => ({ income: { ...s.income, ...patch } })),
      upsertCategories: (cats) => set(() => ({ categories: cats })),
      addTransaction: (tx) =>
        set((s) => ({ transactions: [...s.transactions, { id: uuid(), ...tx }] })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      resetAll: () => set(() => ({ ...seed, transactions: demoTx })),
    }),
    { name: "budget-pie-store" }
  )
);

export function groupActualByCategory(categories: Category[], txs: Transaction[], year: number, monthIndex: number) {
  const byId: Record<string, number> = {};
  const uncategorized = { id: "__uncategorized__", name: "Uncategorized", isArchived: false } as Category;
  const catMap = new Map<string, Category>([[uncategorized.id, uncategorized], ...categories.map((c) => [c.id, c])]);
  for (const t of txs) {
    const d = dayjs(t.occurredAt).tz(TOKYO);
    if (d.year() !== year || d.month() !== monthIndex) continue;
    const key = t.categoryId ?? uncategorized.id;
    byId[key] = (byId[key] ?? 0) + t.amount;
  }
  const entries = Array.from(Object.entries(byId)).map(([id, total]) => ({ id, total, name: catMap.get(id)?.name ?? "Unknown" }));
  return { entries, uncategorizedId: uncategorized.id };
}

export function totalSpentThisMonth(txs: Transaction[], nowDate = dayjs().tz(TOKYO)) {
  const y = nowDate.year();
  const m = nowDate.month();
  return txs.reduce((sum, t) => {
    const d = dayjs(t.occurredAt).tz(TOKYO);
    if (d.year() === y && d.month() === m) return sum + t.amount;
    return sum;
  }, 0);
}

