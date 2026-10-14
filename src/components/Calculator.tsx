import { useEffect, useMemo, useState } from "react";
import { useDisclosure } from "@heroui/react";
import {
  calculate,
  isBlank,
  todayIso,
  validateTrips,
  type TripInput,
  type ValidationErrors,
} from "../lib/schengen.ts";
import {
  clearPersistedState,
  loadPersistedState,
  savePersistedState,
} from "../lib/storage.ts";
import { CalculatorCard } from "./CalculatorCard.tsx";
import { ClearModal } from "./ClearModal.tsx";
import { Summary } from "./Summary.tsx";

let nextId = 0;
const newTrip = (patch: Partial<TripInput> = {}): TripInput => ({
  id: `trip-${nextId++}`,
  entry: "",
  exit: "",
  ...patch,
});

export function Calculator() {
  const [trips, setTrips] = useState<TripInput[]>(() => {
    const persisted = loadPersistedState();

    if (persisted?.trips.length) {
      const ids = persisted.trips
        .map((trip) => Number(String(trip.id).replace(/\D/g, "")))
        .filter((value) => Number.isFinite(value));

      if (ids.length) nextId = Math.max(...ids) + 1;
      return persisted.trips;
    }

    return [newTrip()];
  });
  const [referenceDate, setReferenceDate] = useState(
    () => loadPersistedState()?.referenceDate ?? todayIso(),
  );
  const [calculated, setCalculated] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const resetModal = useDisclosure();

  useEffect(() => {
    savePersistedState(trips, referenceDate);
  }, [trips, referenceDate]);

  const errors: ValidationErrors = useMemo(() => validateTrips(trips), [trips]);
  const hasErrors = Object.keys(errors).length > 0;

  const result = useMemo(
    () => (calculated && !hasErrors ? calculate(trips, referenceDate) : null),
    [calculated, hasErrors, trips, referenceDate],
  );

  const edit = (id: string, patch: Partial<Omit<TripInput, "id">>) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    setCalculated(false);
    setNotice(null);
  };

  const add = () => setTrips((prev) => [...prev, newTrip()]);

  const remove = (id: string) => {
    setTrips((prev) => {
      const rest = prev.filter((t) => t.id !== id);
      return rest.length ? rest : [newTrip()];
    });
    setCalculated(false);
  };

  const onCalculate = () => {
    setShowErrors(true);
    setNotice(null);
    if (hasErrors) return;

    const filled = trips.filter((t) => !isBlank(t));
    if (filled.length === 0) {
      setNotice("Add at least one entry and exit date to calculate.");
      return;
    }

    setTrips([...filled].sort((a, b) => a.entry.localeCompare(b.entry)));
    setCalculated(true);
  };

  const reset = () => {
    setTrips([newTrip()]);
    setCalculated(false);
    setShowErrors(false);
    setNotice(null);
    clearPersistedState();
    resetModal.onClose();
  };

  return (
    <div id="calculator" className="scroll-mt-24 flex flex-col gap-4">
      <CalculatorCard
        trips={trips}
        errors={errors}
        showErrors={showErrors}
        notice={notice}
        result={result}
        onAdd={add}
        onChange={edit}
        onRemove={remove}
        onOpenResetModal={resetModal.onOpen}
        onCalculate={onCalculate}
      />

      {result && (
        <Summary
          result={result}
          referenceDate={referenceDate}
          onReferenceDateChange={setReferenceDate}
        />
      )}

      <ClearModal
        isOpen={resetModal.isOpen}
        onOpenChange={resetModal.onOpenChange}
        onConfirm={reset}
      />
    </div>
  );
}
