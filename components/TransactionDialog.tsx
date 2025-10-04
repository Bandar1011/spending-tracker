"use client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { parseJPYInput } from "@/lib/format";
import dayjs from "dayjs";
import { TOKYO } from "@/lib/month";
import { amountSchema } from "@/lib/validation";
import { toast } from "sonner";

const UNCATEGORIZED_VALUE = "__uncategorized__";

export function TransactionDialog() {
  const categories = useStore((s) => s.categories);
  const activeCategories = categories?.filter((c) => !c.isArchived) ?? [];
  const addTransaction = useStore((s) => s.addTransaction);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(dayjs().tz(TOKYO).format("YYYY-MM-DD"));
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  function onSubmit() {
    const parsedAmount = Number(amount);
    const res = amountSchema.safeParse(parsedAmount);
    if (!res.success) {
      toast.error("Invalid amount");
      return;
    }
    addTransaction({
      amount: parsedAmount,
      categoryId,
      occurredAt: dayjs.tz(date, TOKYO).toISOString(),
      note: note || undefined,
    });
    toast.success("Transaction added");
    setOpen(false);
    setAmount(0);
    setNote("");
    setCategoryId(null);
    setDate(dayjs().tz(TOKYO).format("YYYY-MM-DD"));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Transaction</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Amount (¥)</label>
            <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(parseJPYInput(e.target.value))} placeholder="¥0" />
          </div>
          <div>
            <label className="block text-sm mb-1">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Category</label>
            <Select value={categoryId ?? UNCATEGORIZED_VALUE} onValueChange={(v) => setCategoryId(v === UNCATEGORIZED_VALUE ? null : v)}>
              <SelectTrigger>
                <SelectValue placeholder="選択 (未分類可)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNCATEGORIZED_VALUE}>Uncategorized</SelectItem>
                {activeCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm mb-1">Note</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type EditProps = { id: string; open: boolean; onOpenChange: (v: boolean) => void };

export function EditTransactionDialog({ id, open, onOpenChange }: EditProps) {
  const tx = useStore((s) => s.transactions.find((t) => t.id === id));
  const categories = useStore((s) => s.categories);
  const activeCategories = categories?.filter((c) => !c.isArchived) ?? [];
  const updateTransaction = useStore((s) => s.updateTransaction);
  const [amount, setAmount] = useState<number>(tx?.amount ?? 0);
  const [date, setDate] = useState<string>(tx ? dayjs(tx.occurredAt).tz(TOKYO).format("YYYY-MM-DD") : dayjs().tz(TOKYO).format("YYYY-MM-DD"));
  const [categoryId, setCategoryId] = useState<string | null>(tx?.categoryId ?? null);
  const [note, setNote] = useState<string>(tx?.note ?? "");

  if (!tx) return null;

  function onSave() {
    const parsedAmount = Number(amount);
    const res = amountSchema.safeParse(parsedAmount);
    if (!res.success) {
      toast.error("Invalid amount");
      return;
    }
    updateTransaction(id, {
      amount: parsedAmount,
      categoryId,
      occurredAt: dayjs.tz(date, TOKYO).toISOString(),
      note: note || undefined,
    });
    toast.success("Transaction updated");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Amount (¥)</label>
            <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(parseJPYInput(e.target.value))} placeholder="¥0" />
          </div>
          <div>
            <label className="block text-sm mb-1">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Category</label>
            <Select value={categoryId ?? UNCATEGORIZED_VALUE} onValueChange={(v) => setCategoryId(v === UNCATEGORIZED_VALUE ? null : v)}>
              <SelectTrigger>
                <SelectValue placeholder="選択 (未分類可)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNCATEGORIZED_VALUE}>Uncategorized</SelectItem>
                {activeCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm mb-1">Note</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


