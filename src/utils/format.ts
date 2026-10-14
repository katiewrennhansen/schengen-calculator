import { toDayNumber } from "./schengen.ts";

const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2025-03-31" -> "31 Mar 2025". Returns "–" for empty / invalid input. */
export function formatDate(iso: string | null): string {
  if (!iso) return "–";
  const day = toDayNumber(iso);
  if (day === null) return "–";
  return formatter.format(new Date(day * 86_400_000));
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
