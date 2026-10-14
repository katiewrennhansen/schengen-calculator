import { Alert } from "@heroui/react";
import type { CalculationResult } from "../lib/schengen.ts";
import { plural } from "../lib/format.ts";

type OverstayAlertProps = {
  trips: CalculationResult["trips"];
};

export function OverstayAlert({ trips }: OverstayAlertProps) {
  const overstays = trips.filter((trip) => trip.overstay);

  if (overstays.length === 0) {
    return (
      <Alert
        color="success"
        variant="flat"
        title="No overstays"
        description="Every stay you entered stays within the 90/180 rule."
      />
    );
  }

  return (
    <Alert
      color="danger"
      variant="flat"
      title={`Overstay on ${plural(overstays.length, "stay")}`}
      description="At least one stay goes over 90 days within a 180-day period. See the stays marked in red."
    />
  );
}
