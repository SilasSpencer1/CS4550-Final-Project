import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatDateRange,
  formatRelative,
  formatCurrency,
} from "./format";

describe("format", () => {
  it("formatDate returns lowercase dow + mon + day", () => {
    // Apr 26 2026 is a Sunday
    const d = new Date(2026, 3, 26, 12, 0);
    expect(formatDate(d)).toBe("sun apr 26");
  });

  it("formatTime uses compact am/pm with no leading zero", () => {
    expect(formatTime(new Date(2026, 3, 26, 8, 0))).toBe("8am");
    expect(formatTime(new Date(2026, 3, 26, 20, 30))).toBe("8:30pm");
    expect(formatTime(new Date(2026, 3, 26, 12, 0))).toBe("12pm");
    expect(formatTime(new Date(2026, 3, 26, 0, 0))).toBe("12am");
  });

  it("formatDateTime joins with separator", () => {
    expect(formatDateTime(new Date(2026, 3, 26, 14, 0))).toBe("sun apr 26 · 2pm");
  });

  it("formatDateRange compacts same-day events", () => {
    const start = new Date(2026, 3, 26, 18, 0);
    const end = new Date(2026, 3, 26, 22, 0);
    expect(formatDateRange(start, end)).toBe("sun apr 26 · 6pm – 10pm");
  });

  it("formatDateRange spans days when needed", () => {
    const start = new Date(2026, 3, 26, 18, 0);
    const end = new Date(2026, 3, 27, 1, 0);
    expect(formatDateRange(start, end)).toContain("–");
    expect(formatDateRange(start, end)).toContain("sun apr 26");
    expect(formatDateRange(start, end)).toContain("mon apr 27");
  });

  it("formatRelative returns 'right now' for sub-hour deltas", () => {
    expect(formatRelative(new Date())).toBe("right now");
  });

  it("formatRelative supports hours, tomorrow, yesterday, days", () => {
    const plus4h = new Date(Date.now() + 4 * 60 * 60 * 1000);
    expect(formatRelative(plus4h)).toBe("in 4h");
    const ago2h = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatRelative(ago2h)).toBe("2h ago");
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(formatRelative(tomorrow)).toBe("tomorrow");
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatRelative(yesterday)).toBe("yesterday");
  });

  it("formatCurrency defaults to USD", () => {
    expect(formatCurrency(42)).toBe("$42.00");
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });
});
