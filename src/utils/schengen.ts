/**
 * Schengen 90/180 day rule engine.
 *
 * Rules implemented (Regulation (EU) 2016/399, Annex IV handbook method):
 *  - Day of entry and day of exit both count as full days of stay.
 *  - For any given day D, look back over the 180-day window [D-179, D].
 *    The number of days present in the Schengen area inside that window
 *    must never exceed 90.
 *  - The window is rolling: there is no reset date.
 *
 * All dates are handled as UTC "day numbers" (days since the Unix epoch) so
 * that time zones and daylight-saving changes can never shift a result.
 */

import type {
  CalculationResult,
  Plan,
  TripInput,
  TripResult,
  ValidationErrors,
} from "../types.ts";

export const MAX_DAYS = 90;
export const WINDOW_DAYS = 180;

const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/* ----------------------------- date helpers ----------------------------- */

/** "YYYY-MM-DD" -> day number, or null if empty / not a real calendar date. */
export function toDayNumber(iso: string): number | null {
  if (!ISO_DATE.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d);
  const date = new Date(ms);
  // Reject things like 2025-02-31 which Date.UTC silently rolls over.
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return ms / MS_PER_DAY;
}

/** Day number -> "YYYY-MM-DD". */
export function fromDayNumber(day: number): string {
  return new Date(day * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Today's date in the user's local time zone, as "YYYY-MM-DD". */
export function todayIso(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
}

/* ------------------------------- core maths ------------------------------ */

/** Number of Schengen days inside the 180-day window ending on `day`. */
export function countInWindow(days: ReadonlySet<number>, day: number): number {
  let count = 0;
  for (let d = day - (WINDOW_DAYS - 1); d <= day; d++) {
    if (days.has(d)) count++;
  }
  return count;
}

/**
 * Starting a continuous stay on `entry`, how long can you stay before any
 * day of that stay would breach the 90/180 rule?
 *
 * `priorDays` are the Schengen days that came before `entry`.
 * Returns the last permitted day (null when not even the entry day is allowed)
 * and the number of permitted days.
 */
export function maxContinuousStay(
  priorDays: ReadonlySet<number>,
  entry: number,
): { lastDay: number | null; days: number } {
  const days = new Set<number>();
  for (const d of priorDays) if (d < entry) days.add(d);

  let last = entry - 1;
  // A continuous stay can never exceed 90 days, so 180 iterations is a safe cap.
  for (let d = entry; d < entry + WINDOW_DAYS; d++) {
    days.add(d);
    if (countInWindow(days, d) > MAX_DAYS) break;
    last = d;
  }
  const length = last - entry + 1;
  return length > 0
    ? { lastDay: last, days: length }
    : { lastDay: null, days: 0 };
}

let tripId = 0;

export function createTrip(patch: Partial<TripInput> = {}): TripInput {
  return {
    id: `trip-${tripId++}`,
    entry: "",
    exit: "",
    ...patch,
  };
}

/* ------------------------------- validation ------------------------------ */

/** A row with neither date filled in is treated as blank and ignored. */
export const isBlank = (t: TripInput) => !t.entry && !t.exit;

export function validateTrips(trips: TripInput[]): ValidationErrors {
  const errors: ValidationErrors = {};
  const set = (id: string, field: "entry" | "exit", msg: string) => {
    errors[id] = { ...errors[id], [field]: errors[id]?.[field] ?? msg };
  };

  const parsed: { id: string; entry: number; exit: number }[] = [];

  for (const t of trips) {
    if (isBlank(t)) continue;
    const entry = toDayNumber(t.entry);
    const exit = toDayNumber(t.exit);

    if (entry === null) set(t.id, "entry", "Enter a valid entry date");
    if (exit === null) set(t.id, "exit", "Enter a valid exit date");
    if (entry === null || exit === null) continue;

    if (exit < entry) {
      set(t.id, "exit", "Exit can't be before entry");
      continue;
    }
    parsed.push({ id: t.id, entry, exit });
  }

  // Overlap check. Sharing exactly one day (exit == next entry) is allowed:
  // that day is only counted once.
  const sorted = [...parsed].sort((a, b) => a.entry - b.entry);
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      if (b.entry > a.exit) break;
      if (b.entry === a.exit) continue;
      set(a.id, "exit", "Overlaps another stay");
      set(b.id, "entry", "Overlaps another stay");
    }
  }

  return errors;
}

/* ------------------------------ calculation ------------------------------ */

/**
 * Calculate results for a list of VALID trips (run validateTrips first).
 * Blank rows are skipped. Results come back in chronological order.
 */
export function calculate(
  trips: TripInput[],
  referenceDate: string,
): CalculationResult {
  const valid = trips
    .filter((t) => !isBlank(t))
    .map((t) => ({
      id: t.id,
      entry: toDayNumber(t.entry) as number,
      exit: toDayNumber(t.exit) as number,
    }))
    .sort((a, b) => a.entry - b.entry || a.exit - b.exit);

  // Every day spent in Schengen. Re-entering on the same day you left only counts once.
  const allDays = new Set<number>();
  for (const t of valid) for (let d = t.entry; d <= t.exit; d++) allDays.add(d);

  const results: TripResult[] = valid.map((t) => {
    let worst = 0;
    let firstOver: number | null = null;
    for (let d = t.entry; d <= t.exit; d++) {
      const c = countInWindow(allDays, d);
      worst = Math.max(worst, c);
      if (c > MAX_DAYS && firstOver === null) firstOver = d;
    }

    const allowance = maxContinuousStay(allDays, t.entry);

    return {
      id: t.id,
      entry: fromDayNumber(t.entry),
      exit: fromDayNumber(t.exit),
      daysOfStay: t.exit - t.entry + 1,
      daysInLast180: countInWindow(allDays, t.exit),
      lastDayToStay:
        allowance.lastDay === null ? null : fromDayNumber(allowance.lastDay),
      maxStayDays: allowance.days,
      overstay: worst > MAX_DAYS,
      excessDays: Math.max(0, worst - MAX_DAYS),
      firstOverstayDate: firstOver === null ? null : fromDayNumber(firstOver),
    };
  });

  return { trips: results, plan: buildPlan(allDays, referenceDate) };
}

function buildPlan(allDays: ReadonlySet<number>, referenceDate: string): Plan {
  const ref = toDayNumber(referenceDate) ?? (toDayNumber(todayIso()) as number);
  const used = countInWindow(allDays, ref);

  // Earliest day on/after the reference date on which a new stay may begin.
  let nextEntry: number | null = null;
  for (let d = ref; d < ref + WINDOW_DAYS; d++) {
    if (maxContinuousStay(allDays, d).days > 0) {
      nextEntry = d;
      break;
    }
  }
  const allowance =
    nextEntry === null ? null : maxContinuousStay(allDays, nextEntry);

  return {
    referenceDate: fromDayNumber(ref),
    windowStart: fromDayNumber(ref - (WINDOW_DAYS - 1)),
    daysUsed: used,
    daysRemaining: Math.max(0, MAX_DAYS - used),
    nextEntry: nextEntry === null ? null : fromDayNumber(nextEntry),
    nextLastDay:
      allowance?.lastDay === null || allowance === null
        ? null
        : fromDayNumber(allowance.lastDay),
    nextMaxDays: allowance?.days ?? 0,
  };
}
