export function toIsoDate(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);

  const newDate = value as {
    year?: number;
    month?: number;
    day?: number;
  };

  if (
    typeof newDate.year === "number" &&
    typeof newDate.month === "number" &&
    typeof newDate.day === "number"
  ) {
    return `${newDate.year}-${String(newDate.month).padStart(2, "0")}-${String(newDate.day).padStart(2, "0")}`;
  }

  return String(value).slice(0, 10);
}
