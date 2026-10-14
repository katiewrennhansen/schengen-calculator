import { useMemo, useState } from "react";
import {
  calculate,
  createTrip,
  todayIso,
  validateTrips,
  type TripInput,
  type ValidationErrors,
} from "../utils/schengen.ts";
import { CalculatorCard } from "./CalculatorCard.tsx";
import { Summary } from "./Summary.tsx";

export function Calculator() {
  const [trips, setTrips] = useState<TripInput[]>([createTrip()]);
  const [referenceDate, setReferenceDate] = useState(todayIso());
  const [calculated, setCalculated] = useState(false);

  const errors: ValidationErrors = useMemo(() => validateTrips(trips), [trips]);
  const hasErrors = Object.keys(errors).length > 0;

  const result = useMemo(
    () => (calculated && !hasErrors ? calculate(trips, referenceDate) : null),
    [calculated, hasErrors, trips, referenceDate],
  );

  const calculateTrips = (nextTrips: TripInput[]) => {
    setTrips(nextTrips);
    setCalculated(true);
  };

  const reset = () => {
    setTrips([createTrip()]);
    setCalculated(false);
  };

  return (
    <div id="calculator" className="scroll-mt-24 flex flex-col gap-4">
      <CalculatorCard
        trips={trips}
        errors={errors}
        result={result}
        hasErrors={hasErrors}
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
