"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatJPY } from "@/lib/format";

type MoneyCardProps = {
  title: string;
  primary: number;
  rows?: Array<{ label: string; value: number; tone?: "default" | "danger" | "muted" }>;
};

export function MoneyCard({ title, primary, rows = [] }: MoneyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatJPY(primary)}</div>
        <div className="mt-3 space-y-1">
          {rows.map((r, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className={r.tone === "danger" ? "text-red-600" : r.tone === "muted" ? "text-muted-foreground" : ""}>
                {formatJPY(r.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

