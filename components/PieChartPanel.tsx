"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatJPY } from "@/lib/format";
import { groupActualByCategory, useStore } from "@/lib/store";
import { useMemo } from "react";
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
import { TOKYO } from "@/lib/month";

type Props = { title?: string; mode?: "actual" | "planned" };

export function PieChartPanel({ title = "Actual Spend", mode = "actual" }: Props) {
  const income = useStore((s) => s.income);
  const categories = useStore((s) => s.categories);
  const txs = useStore((s) => s.transactions);

  const now = useMemo(() => dayjs().tz(TOKYO), []);
  const y = now.year();
  const m = now.month();

  const actual = useMemo(() => groupActualByCategory(categories, txs, y, m), [categories, txs, y, m]);

  const planned = useMemo(() => {
    const entries = categories
      .filter((c) => !c.isArchived && (c.plannedAmount ?? 0) > 0)
      .map((c) => ({ id: c.id, name: c.name, total: Math.round(c.plannedAmount || 0) }));
    return { entries } as any;
  }, [categories]);

  const series = mode === "planned" ? planned.entries : actual.entries;
  const baseSeries = useMemo(() => {
    const sum = (series ?? []).reduce((s: number, e: any) => s + (e?.total ?? 0), 0);
    if (!sum) return [{ id: "__none__", name: "No spend", total: 1, isPlaceholder: true }];
    return series;
  }, [series]);

  const withPercent = useMemo(() => {
    const incomeAmount = Math.max(1, income.amount || 1);
    return baseSeries.map((e: any) => ({
      ...e,
      percent: e.isPlaceholder ? 0 : Math.round((e.total / incomeAmount) * 100),
    }));
  }, [baseSeries, income.amount]);

  const colors = ["#22c55e", "#06b6d4", "#ef4444", "#f59e0b", "#8b5cf6", "#10b981", "#eab308", "#3b82f6", "#14b8a6", "#f97316"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="total" data={withPercent} nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {withPercent.map((d: any, i) => (
                  <Cell key={i} fill={d.isPlaceholder ? "#ffffff" : colors[i % colors.length]} stroke={d.isPlaceholder ? "#e5e7eb" : undefined} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any, _n: any, ctx: any) => formatJPY(ctx?.payload?.isPlaceholder ? 0 : Number(v))} />
              <Legend formatter={(value: string) => {
                const item = withPercent.find((r) => r.name === value) as any;
                const actualV = item?.total ?? 0;
                const p = item?.percent ?? 0;
                const amount = item?.isPlaceholder ? 0 : actualV;
                const label = item?.isPlaceholder ? "No spend" : value;
                return `${label} — ${formatJPY(amount)} (${p}%)`;
              }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

