export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return "";
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate) return "";
  if (!endDate || endDate === startDate) return formatShortDate(startDate);
  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
}

export function dDay(isoDate: string): string {
  if (!isoDate) return "";
  const target = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return "";
  const now = new Date();
  const diff = Math.round(
    (target.getTime() - new Date(now.toDateString()).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "D-DAY";
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}

export function isoDateFromTimestamp(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Labels a timestamp as a trip day relative to the meeting's start date,
 * e.g. "Day 01 (26.07.29)". Used to group receipts by the day they were
 * actually spent rather than dumping them all in one flat list.
 */
export function dayLabel(meetingStartDate: string, ts: number): string {
  const receiptDateIso = isoDateFromTimestamp(ts);
  const start = new Date(`${meetingStartDate}T00:00:00`);
  const receiptDate = new Date(`${receiptDateIso}T00:00:00`);
  const diffDays = Math.round(
    (receiptDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const dayNum = Math.max(1, diffDays + 1);
  return `Day ${String(dayNum).padStart(2, "0")} (${formatShortDate(receiptDateIso)})`;
}

export function initial(nickname: string): string {
  return nickname?.trim()?.[0]?.toUpperCase() ?? "?";
}

export function randomJoinCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function cx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  (Object.keys(out) as (keyof T)[]).forEach((key) => {
    if (out[key] === undefined) delete out[key];
  });
  return out;
}
