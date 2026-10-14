import type { TripInput } from "./schengen.ts";

const STORAGE_KEY = "schengen-calculator-state";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isStoredTrip(value: unknown): value is TripInput {
  if (typeof value !== "object" || value === null) return false;

  const trip = value as Record<string, unknown>;
  return (
    typeof trip.id === "string" &&
    typeof trip.entry === "string" &&
    typeof trip.exit === "string"
  );
}

export function loadPersistedState(): {
  trips: TripInput[];
  referenceDate: string;
} | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      trips?: unknown;
      referenceDate?: unknown;
    };
    if (!parsed || typeof parsed !== "object") return null;

    const trips = Array.isArray(parsed.trips)
      ? parsed.trips.filter(isStoredTrip)
      : [];

    if (!trips.length) return null;

    return {
      trips,
      referenceDate:
        typeof parsed.referenceDate === "string"
          ? parsed.referenceDate
          : new Date().toISOString().slice(0, 10),
    };
  } catch {
    return null;
  }
}

export function savePersistedState(
  trips: TripInput[],
  referenceDate: string,
): void {
  const storage = getStorage();
  if (!storage) return;

  if (trips.every((trip) => !trip.entry && !trip.exit)) {
    storage.removeItem(STORAGE_KEY);
    return;
  }

  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      trips,
      referenceDate,
    }),
  );
}

export function clearPersistedState(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}

export function loadPersistedTrips(): TripInput[] {
  return loadPersistedState()?.trips ?? [];
}

export function savePersistedTrips(trips: TripInput[]): void {
  const storage = getStorage();
  if (!storage) return;

  if (trips.every((trip) => !trip.entry && !trip.exit)) {
    storage.removeItem(STORAGE_KEY);
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify({ trips }));
}
