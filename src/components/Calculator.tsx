import {
  type TripInput,
  type ValidationErrors,
  calculate,
  createTrip,
  todayIso,
  validateTrips,
} from "../utils/schengen.ts";
import { useMemo, useState } from "react";
import { Alert } from "@heroui/react";
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
      <Alert
        title="Important information about Schengen visa rules"
        description="Non-EU visitors who don’t need a visa can spend up to 90 days in the
        Schengen Area within any rolling 180-day period. For each day, you count
        back 180 days, and entry and exit days both count. Days drop out of the
        window as time passes, so your allowance returns gradually, and
        overstaying can bring fines or an entry ban."
        variant="flat"
      />
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
