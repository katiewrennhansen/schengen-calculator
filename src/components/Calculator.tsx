import { useMemo, useState } from "react";
import {
  calculate,
  todayIso,
  validateTrips,
  type TripInput,
  type ValidationErrors,
} from "../utils/schengen.ts";
import { CalculatorCard } from "./CalculatorCard.tsx";
import { Summary } from "./Summary.tsx";

let nextId = 0;
const newTrip = (patch: Partial<TripInput> = {}): TripInput => ({
  id: `trip-${nextId++}`,
  entry: "",
  exit: "",
  ...patch,
});

export function Calculator() {
  const [trips, setTrips] = useState<TripInput[]>([newTrip()]);
  const [referenceDate, setReferenceDate] = useState(todayIso());
  const [calculated, setCalculated] = useState(false);

  const errors: ValidationErrors = useMemo(() => validateTrips(trips), [trips]);
  const hasErrors = Object.keys(errors).length > 0;

  const result = useMemo(
    () => (calculated && !hasErrors ? calculate(trips, referenceDate) : null),
    [calculated, hasErrors, trips, referenceDate],
  );

  const edit = (id: string, patch: Partial<Omit<TripInput, "id">>) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    setCalculated(false);
  };

  const add = () => setTrips((prev) => [...prev, newTrip()]);

  const remove = (id: string) => {
    setTrips((prev) => {
      const rest = prev.filter((t) => t.id !== id);
      return rest.length ? rest : [newTrip()];
    });
  };

  const calculateTrips = (nextTrips: TripInput[]) => {
    setTrips(nextTrips);
    setCalculated(true);
  };

  const reset = () => {
    setTrips([newTrip()]);
    setCalculated(false);
  };

  return (
    <div id="calculator" className="scroll-mt-24 flex flex-col gap-4">
      <CalculatorCard
        trips={trips}
        errors={errors}
        result={result}
        hasErrors={hasErrors}
        onAdd={add}
        onChange={edit}
        onRemove={remove}
        onCalculate={calculateTrips}
        onReset={reset}
      />

      {result && (
        <Summary
          result={result}
          referenceDate={referenceDate}
          onReferenceDateChange={setReferenceDate}
        />
      )}
    </div>
  );
}
