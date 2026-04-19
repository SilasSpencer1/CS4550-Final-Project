const DOW_SHORT = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MON_SHORT = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

function timeStr(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${ampm}` : `${hour}:${String(m).padStart(2, "0")}${ampm}`;
}

export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${DOW_SHORT[date.getDay()]} ${MON_SHORT[date.getMonth()]} ${date.getDate()}`;
}

export function formatTime(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return timeStr(date);
}

export function formatDateTime(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${formatDate(date)} · ${timeStr(date)}`;
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  const sameDay = s.toDateString() === e.toDateString();
  if (sameDay) return `${formatDate(s)} · ${timeStr(s)} – ${timeStr(e)}`;
  return `${formatDateTime(s)} – ${formatDateTime(e)}`;
}

export function formatRelative(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diffMs = date.getTime() - Date.now();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(diffHours) < 1) return "right now";
  if (diffHours === 1) return "in an hour";
  if (diffHours > 0 && diffHours < 24) return `in ${diffHours}h`;
  if (diffHours < 0 && diffHours > -24) return `${-diffHours}h ago`;
  const days = Math.round(diffHours / 24);
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0 && days < 7) return `in ${days}d`;
  if (days < 0 && days > -7) return `${-days}d ago`;
  return formatDate(date);
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
