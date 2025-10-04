import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(tz);

export const TOKYO = "Asia/Tokyo";

export function nowJST() {
  return dayjs().tz(TOKYO);
}

export function startOfMonthJST(date = nowJST()) {
  return date.tz(TOKYO).startOf("month");
}

export function endOfMonthJST(date = nowJST()) {
  return date.tz(TOKYO).endOf("month");
}

export function effectivePaydayThisMonth(payday: number, baseDate = nowJST()) {
  const start = startOfMonthJST(baseDate);
  const lastDay = start.endOf("month").date();
  const day = Math.min(Math.max(1, payday), lastDay);
  return start.date(day).startOf("day");
}

export function hasIncomeLanded(payday: number, baseDate = nowJST()) {
  const paydayDate = effectivePaydayThisMonth(payday, baseDate);
  return baseDate.isSame(paydayDate) || baseDate.isAfter(paydayDate);
}

export function isSameMonthJST(aIso: string, baseDate = nowJST()) {
  const a = dayjs(aIso).tz(TOKYO);
  return a.year() === baseDate.year() && a.month() === baseDate.month();
}

// Budget period helpers: a period runs from payday of one month to the payday of the next
export function startOfBudgetPeriod(payday: number, baseDate = nowJST()) {
  const currentPayday = effectivePaydayThisMonth(payday, baseDate);
  // If we are before this month's payday, the period started on last month's payday
  if (baseDate.isBefore(currentPayday)) {
    const prev = baseDate.subtract(1, "month");
    return effectivePaydayThisMonth(payday, prev);
  }
  return currentPayday;
}

export function nextBudgetPeriodStart(payday: number, baseDate = nowJST()) {
  const start = startOfBudgetPeriod(payday, baseDate);
  const nextBase = start.add(1, "month");
  return effectivePaydayThisMonth(payday, nextBase);
}


