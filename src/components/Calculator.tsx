import { Alert, Card, CardBody, useDisclosure } from "@heroui/react";
import {
  type TripInput,
  type ValidationErrors,
  calculate,
  createTrip,
  todayIso,
  validateTrips,
} from "../utils/schengen.ts";
import { useMemo, useState } from "react";
import { CalculatorForm } from "./CalculatorForm.tsx";
import { ClearModal } from "./ClearModal.tsx";
import { Summary } from "./Summary.tsx";

export function Calculator() {
  const [submittedTrips, setSubmittedTrips] = useState<TripInput[]>([
    createTrip(),
  ]);
  const [referenceDate, setReferenceDate] = useState(todayIso());
  const [calculated, setCalculated] = useState(false);
  const resetModal = useDisclosure();

  const errors: ValidationErrors = validateTrips(submittedTrips);
  const hasErrors = Object.keys(errors).length > 0;

  const result = useMemo(
    () =>
      calculated && !hasErrors
        ? calculate(submittedTrips, referenceDate)
        : null,
    [calculated, hasErrors, submittedTrips, referenceDate],
  );

  const calculateTrips = (nextTrips: TripInput[]) => {
    setSubmittedTrips(nextTrips);
    setCalculated(true);
  };

  const reset = () => {
    setSubmittedTrips([createTrip()]);
    setCalculated(false);
    resetModal.onClose();
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

      <Card shadow="sm">
        <CardBody className="p-4 sm:p-5">
          <CalculatorForm
            trips={submittedTrips}
            errors={errors}
            result={result}
            onCalculate={calculateTrips}
            onReset={resetModal.onOpen}
          />
        </CardBody>
      </Card>

      <ClearModal
        isOpen={resetModal.isOpen}
        onOpenChange={resetModal.onOpenChange}
        onConfirm={reset}
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
