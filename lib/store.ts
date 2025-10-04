"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOKYO, startOfBudgetPeriod, nextBudgetPeriodStart } from "@/lib/month";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(tz);

export type Account = { currentBalance: number };
export type Income = { amount: number; payday: number; timezone: "Asia/Tokyo" };
export type Category = { id: string; name: string; isArchived: boolean; plannedAmount?: number };
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
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, "id">>) => void;
  deleteTransaction: (id: string) => void;
  resetAll: () => void;
};

const seed: Omit<StoreState, "setAccount" | "setIncome" | "upsertCategories" | "addTransaction" | "updateTransaction" | "deleteTransaction" | "resetAll"> = {
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

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...seed,
      setAccount: (patch) => set((s) => ({ account: { ...s.account, ...patch } })),
      setIncome: (patch) => set((s) => ({ income: { ...s.income, ...patch } })),
      upsertCategories: (cats) => set(() => ({ categories: cats })),
      addTransaction: (tx) =>
        set((s) => ({ transactions: [...s.transactions, { id: uuid(), ...tx }] })),
      updateTransaction: (id, patch) =>
        set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      resetAll: () => set(() => ({ ...seed, transactions: [] })),
    }),
    {
      name: "budget-pie-store",
      version: 3,
      migrate: (persisted, version) => {
        const state = (persisted as any) ?? {};
        if (version < 2) {
          if (Array.isArray(state.transactions)) {
            const isDemo = (t: any) => {
              const demoNotes = new Set(["Coffee", "Groceries", "Dining"]);
              const demoAmounts = new Set([1200, 4500, 18000]);
              return demoNotes.has(t?.note) && demoAmounts.has(Number(t?.amount)) && (t?.categoryId ?? null) === null;
            };
            state.transactions = state.transactions.filter((t: any) => !isDemo(t));
          }
        }
        if (version < 3) {
          if (Array.isArray(state.categories)) {
            const income = state?.income?.amount ?? 0;
            state.categories = state.categories.map((c: any) => {
              if (c.allocation != null && c.plannedAmount == null) {
                return { ...c, plannedAmount: Math.round(((Number(c.allocation) || 0) / 100) * income), allocation: undefined };
              }
              return c;
            });
          }
        }
        return state as any;
      },
    }
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
  const store = useStore.getState();
  const start = startOfBudgetPeriod(store.income.payday, nowDate);
  const end = nextBudgetPeriodStart(store.income.payday, nowDate);
  return txs.reduce((sum, t) => {
    const d = dayjs(t.occurredAt).tz(TOKYO);
    if ((d.isSame(start) || d.isAfter(start)) && d.isBefore(end)) return sum + t.amount;
    return sum;
  }, 0);
}


