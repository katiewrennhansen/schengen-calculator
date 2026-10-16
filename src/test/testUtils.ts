import type { TripResult } from "../types";

export function createTestTrip(
  overrides: Partial<TripResult> = {},
): TripResult {
  return {
    id: "trip-1",
    entry: "",
    exit: "",
    daysOfStay: 10,
    daysInLast180: 10,
    lastDayToStay: "",
    maxStayDays: 90,
    overstay: false,
    excessDays: 0,
    firstOverstayDate: null,
    ...overrides,
  };
}
