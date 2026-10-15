import { parseDate, type DateValue } from "@internationalized/date";

type CalendarDateLike = {
  year: number;
  month: number;
  day: number;
};

function isCalendarDateLike(value: unknown): value is CalendarDateLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "year" in value &&
    "month" in value &&
    "day" in value &&
    typeof value.year === "number" &&
    typeof value.month === "number" &&
    typeof value.day === "number"
  );
}

export function parseIsoDate(
  value: string | null | undefined,
): DateValue | null {
  if (!value) return null;
  return parseDate(value);
}

export function toIsoDate(
  value: DateValue | Date | string | null | undefined,
): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (isCalendarDateLike(value)) {
    return `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
  }

  return "";
}
