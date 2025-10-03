"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { formatJPY } from "@/lib/format";
import dayjs from "dayjs";
import { TOKYO } from "@/lib/month";

export function TransactionsTable() {
  const txs = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const [desc] = useState(true);
  const rows = useMemo(() => {
    const out = txs.map((t) => ({
      ...t,
      d: dayjs(t.occurredAt).tz(TOKYO),
      categoryName: t.categoryId ? categories.find((c) => c.id === t.categoryId)?.name ?? "Unknown" : "Uncategorized",
    }));
    out.sort((a, b) => (desc ? b.d.valueOf() - a.d.valueOf() : a.d.valueOf() - b.d.valueOf()));
    return out;
  }, [txs, categories, desc]);
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">日付</TableHead>
            <TableHead>カテゴリ</TableHead>
            <TableHead className="text-right">金額</TableHead>
            <TableHead>メモ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.d.format("YYYY/MM/DD")}</TableCell>
              <TableCell>{r.categoryName}</TableCell>
              <TableCell className="text-right">{formatJPY(r.amount)}</TableCell>
              <TableCell>{r.note ?? ""}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                取引がありません
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

