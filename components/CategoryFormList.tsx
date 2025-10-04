"use client";
import { useEffect, useMemo, useState } from "react";
import { Category, useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clampPercent } from "@/lib/format";
import { toast } from "sonner";

export function CategoryFormList() {
  const categories = useStore((s) => s.categories);
  const upsertCategories = useStore((s) => s.upsertCategories);
  const [rows, setRows] = useState<Category[]>(categories);

  useEffect(() => setRows(categories), [categories]);

  const totals = useMemo(() => {
    const income = useStore.getState().income.amount || 0;
    const plannedTotal = rows.reduce((sum, r) => sum + (r.plannedAmount ?? 0), 0);
    const percent = income > 0 ? Math.min(100, Math.round((plannedTotal / income) * 100)) : 0;
    return { plannedTotal, percent, over: plannedTotal > income && income > 0 };
  }, [rows]);

  function updateRow(id: string, patch: Partial<Category>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    const id = crypto.randomUUID();
    setRows((prev) => [...prev, { id, name: "", isArchived: false, plannedAmount: 0 } as Category]);
  }

  function save() {
    if (totals.over) {
      toast.error("合計が 100% を超えています");
      return;
    }
    upsertCategories(rows.map((r) => ({ ...r, plannedAmount: Number(r.plannedAmount || 0) })));
    toast.success("Categories saved");
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-muted-foreground">Manage categories</div>
          <div className="space-x-2">
            <Button variant="secondary" onClick={addRow}>Add Row</Button>
            <Button onClick={save} disabled={totals.over}>Save</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-12 gap-2 items-center">
              <Input className="col-span-6" value={r.name} onChange={(e) => updateRow(r.id, { name: e.target.value })} placeholder="Category name" />
              <Input className="col-span-3" inputMode="numeric" value={r.plannedAmount ?? 0}
                onChange={(e) => updateRow(r.id, { plannedAmount: Number(e.target.value || 0) })}
                placeholder="¥ Planned" />
              <div className="col-span-1 text-sm text-muted-foreground">{r.isArchived ? "Archived" : "Active"}</div>
              <Button className="col-span-2" variant={r.isArchived ? "secondary" : "outline"} onClick={() => updateRow(r.id, { isArchived: !r.isArchived })}>
                {r.isArchived ? "Unarchive" : "Archive"}
              </Button>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="text-center text-muted-foreground py-6">No categories. Add a row.</div>
          )}
        </div>
        <div className="pt-3 text-sm">
          <div>Planned total: ¥{totals.plannedTotal.toLocaleString()}</div>
          <div className={totals.over ? "text-red-600" : ""}>Usage: {totals.percent}% of income</div>
        </div>
      </CardContent>
    </Card>
  );
}

