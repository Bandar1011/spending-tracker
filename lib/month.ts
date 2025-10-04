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


