import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculate,
  validateTrips,
  toDayNumber,
  fromDayNumber,
} from "./schengen.ts";
import { loadPersistedTrips, savePersistedTrips } from "./storage.ts";

const t = (id: string, entry: string, exit: string) => ({ id, entry, exit });

test("date round trip and invalid dates", () => {
  assert.equal(fromDayNumber(toDayNumber("2024-02-29")!), "2024-02-29");
  assert.equal(toDayNumber("2025-02-31"), null);
  assert.equal(toDayNumber(""), null);
});

test("a stay of exactly 90 days is allowed, and counts both entry and exit day", () => {
  const r = calculate([t("a", "2025-01-01", "2025-03-31")], "2025-04-01");
  assert.equal(r.trips[0].daysOfStay, 90);
  assert.equal(r.trips[0].daysInLast180, 90);
  assert.equal(r.trips[0].lastDayToStay, "2025-03-31");
  assert.equal(r.trips[0].overstay, false);
  assert.equal(r.plan.daysRemaining, 0);
});

test("91 days is an overstay of 1 day, starting on day 91", () => {
  const r = calculate([t("a", "2025-01-01", "2025-04-01")], "2025-04-02");
  assert.equal(r.trips[0].overstay, true);
  assert.equal(r.trips[0].excessDays, 1);
  assert.equal(r.trips[0].firstOverstayDate, "2025-04-01");
});

test("rolling window: old days drop out and extend a later stay", () => {
  // 1 day on 2024-01-01 falls out of the window on 2024-06-29 (day 181).
  const r = calculate(
    [t("a", "2024-01-01", "2024-01-01"), t("b", "2024-06-28", "2024-06-28")],
    "2024-07-01",
  );
  const b = r.trips.find((x) => x.id === "b")!;
  assert.equal(b.lastDayToStay, "2024-09-25");
  assert.equal(b.maxStayDays, 90);
});

test("full allowance used: next entry is when the first day rolls out", () => {
  const r = calculate([t("a", "2025-01-01", "2025-03-31")], "2025-04-01");
  // Window of Jun 29 (day 180) still contains Jan 1; Jun 30 does not.
  assert.equal(r.plan.nextEntry, "2025-06-30");
  assert.equal(r.plan.daysUsed, 90);
  assert.ok(r.plan.nextMaxDays >= 1);
});

test("same-day re-entry counts the shared day once", () => {
  const r = calculate(
    [t("a", "2025-01-01", "2025-01-10"), t("b", "2025-01-10", "2025-01-20")],
    "2025-01-21",
  );
  assert.equal(r.plan.daysUsed, 20);
});

test("validation: bad order, overlap, missing dates; blank rows ignored", () => {
  const e = validateTrips([
    t("a", "2025-02-10", "2025-02-01"),
    t("b", "2025-03-01", "2025-03-20"),
    t("c", "2025-03-10", "2025-03-30"),
    t("d", "2025-05-01", ""),
    t("e", "", ""),
  ]);
  assert.ok(e.a.exit);
  assert.ok(e.b.exit && e.c.entry);
  assert.ok(e.d.exit);
  assert.equal(e.e, undefined);
});

test("results are returned in chronological order", () => {
  const r = calculate(
    [
      t("late", "2025-05-01", "2025-05-05"),
      t("early", "2025-01-01", "2025-01-05"),
    ],
    "2025-06-01",
  );
  assert.deepEqual(
    r.trips.map((x) => x.id),
    ["early", "late"],
  );
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
  assert.deepEqual(loadPersistedTrips(), trips);
});
