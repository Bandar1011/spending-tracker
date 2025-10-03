"use client";
import { useMemo } from "react";
import dayjs from "dayjs";
import { effectivePaydayThisMonth, endOfMonthJST, hasIncomeLanded, nowJST, startOfMonthJST, TOKYO } from "@/lib/month";

export function useMonth(payday: number) {
  return useMemo(() => {
    const now = nowJST();
    const start = startOfMonthJST(now);
    const end = endOfMonthJST(now);
    const paydayDate = effectivePaydayThisMonth(payday, now);
    const landed = hasIncomeLanded(payday, now);
    const label = now.tz(TOKYO).format("MMMM YYYY");
    return {
      now,
      start,
      end,
      paydayDate,
      hasLanded: landed,
      monthLabel: label,
      isCurrentMonth: (iso: string) => {
        const d = dayjs(iso).tz(TOKYO);
        return d.year() === now.year() && d.month() === now.month();
      },
    };
  }, [payday]);
}

