import {
  calculate,
  fromDayNumber,
  toDayNumber,
  validateTrips,
} from "./schengen.ts";
import { expect, test } from "vitest";
import { loadPersistedTrips, savePersistedTrips } from "./storage.ts";

const t = (id: string, entry: string, exit: string) => ({ id, entry, exit });

test("date round trip and invalid dates", () => {
  expect(fromDayNumber(toDayNumber("2024-02-29")!)).toBe("2024-02-29");
  expect(toDayNumber("2025-02-31")).toBeNull();
  expect(toDayNumber("")).toBeNull();
});

test("a stay of exactly 90 days is allowed, and counts both entry and exit day", () => {
  const r = calculate([t("a", "2025-01-01", "2025-03-31")], "2025-04-01");
  expect(r.trips[0].daysOfStay).toBe(90);
  expect(r.trips[0].daysInLast180).toBe(90);
  expect(r.trips[0].lastDayToStay).toBe("2025-03-31");
  expect(r.trips[0].overstay).toBe(false);
  expect(r.plan.daysRemaining).toBe(0);
});

test("91 days is an overstay of 1 day, starting on day 91", () => {
  const r = calculate([t("a", "2025-01-01", "2025-04-01")], "2025-04-02");
  expect(r.trips[0].overstay).toBe(true);
  expect(r.trips[0].excessDays).toBe(1);
  expect(r.trips[0].firstOverstayDate).toBe("2025-04-01");
});

test("rolling window: old days drop out and extend a later stay", () => {
  // 1 day on 2024-01-01 falls out of the window on 2024-06-29 (day 181).
  const r = calculate(
    [t("a", "2024-01-01", "2024-01-01"), t("b", "2024-06-28", "2024-06-28")],
    "2024-07-01",
  );
  const b = r.trips.find((x) => x.id === "b")!;
  expect(b.lastDayToStay).toBe("2024-09-25");
  expect(b.maxStayDays).toBe(90);
});

test("full allowance used: next entry is when the first day rolls out", () => {
  const r = calculate([t("a", "2025-01-01", "2025-03-31")], "2025-04-01");
  // Window of Jun 29 (day 180) still contains Jan 1; Jun 30 does not.
  expect(r.plan.nextEntry).toBe("2025-06-30");
  expect(r.plan.daysUsed).toBe(90);
  expect(r.plan.nextMaxDays >= 1).toBe(true);
});

test("same-day re-entry counts the shared day once", () => {
  const r = calculate(
    [t("a", "2025-01-01", "2025-01-10"), t("b", "2025-01-10", "2025-01-20")],
    "2025-01-21",
  );
  expect(r.plan.daysUsed).toBe(20);
});

test("validation: bad order, overlap, missing dates; blank rows ignored", () => {
  const e = validateTrips([
    t("a", "2025-02-10", "2025-02-01"),
    t("b", "2025-03-01", "2025-03-20"),
    t("c", "2025-03-10", "2025-03-30"),
    t("d", "2025-05-01", ""),
    t("e", "", ""),
  ]);
  expect(Boolean(e.a.exit)).toBe(true);
  expect(Boolean(e.b.exit && e.c.entry)).toBe(true);
  expect(Boolean(e.d.exit)).toBe(true);
  expect(e.e).toBeUndefined();
});

test("results are returned in chronological order", () => {
  const r = calculate(
    [
      t("late", "2025-05-01", "2025-05-05"),
      t("early", "2025-01-01", "2025-01-05"),
    ],
    "2025-06-01",
  );
  expect(r.trips.map((x) => x.id)).toEqual(["early", "late"]);
});

test("saved trips can be restored from local storage", () => {
  const store = new Map<string, string>();
  const rawStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  } satisfies Pick<Storage, "getItem" | "setItem" | "removeItem">;

  globalThis.localStorage = rawStorage as Storage;

  const trips = [
    { id: "trip-0", entry: "2025-01-01", exit: "2025-01-10" },
    { id: "trip-1", entry: "2025-02-15", exit: "2025-02-20" },
  ];

  savePersistedTrips(trips);
  expect(loadPersistedTrips()).toEqual(trips);
});
