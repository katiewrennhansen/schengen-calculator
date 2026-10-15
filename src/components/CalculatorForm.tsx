import { COLUMN_HEADERS, ROW_GRID } from "../constants.ts";
import {
  type CalculationResult,
  type TripInput,
  type ValidationErrors,
  isBlank,
} from "../utils/schengen.ts";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TripRow } from "./TripRow.tsx";

type CalculatorFormProps = {
  trips: TripInput[];
  errors: ValidationErrors;
  result: CalculationResult | null;
  onCalculate: (nextTrips: TripInput[]) => void;
  onReset: () => void;
};

export function CalculatorForm({
  trips,
  errors,
  result,
  onCalculate,
  onReset,
}: CalculatorFormProps) {
  const form = useForm<{ trips: TripInput[] }>({
    defaultValues: { trips },
    mode: "onSubmit",
  });
  const [showErrors, setShowErrors] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const resultById = useMemo(
    () => new Map(result?.trips.map((r) => [r.id, r])),
    [result],
  );

  useEffect(() => {
    form.reset({ trips });
  }, [trips, form]);

  const formTrips = useWatch({ control: form.control, name: "trips" }) ?? trips;

  const handleAdd = () => {
    setShowErrors(false);
    setNotice(null);

    const nextTrip: TripInput = {
      id: `trip-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      entry: "",
      exit: "",
    };
    form.setValue("trips", [...formTrips, nextTrip], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleRemove = (id: string) => {
    setShowErrors(false);
    setNotice(null);

    form.setValue(
      "trips",
      formTrips.filter((trip) => trip.id !== id),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleCalculate = form.handleSubmit(() => {
    setShowErrors(true);
    setNotice(null);

    const filled = formTrips.filter((t) => !isBlank(t));
    if (filled.length === 0) {
      setNotice("Add at least one entry and exit date to calculate.");
      return;
    }

    onCalculate([...filled].sort((a, b) => a.entry.localeCompare(b.entry)));
  });

  return (
    <form onSubmit={handleCalculate} noValidate>
      <div
        className={`hidden gap-4 mb-4 px-2 text-small font-medium text-default-500 lg:grid ${ROW_GRID}`}
      >
        {COLUMN_HEADERS.map((h) => (
          <span key={h}>{h}</span>
        ))}
        <span className="sr-only">Remove</span>
      </div>

      <ul className="flex flex-col gap-4 lg:gap-0">
        <AnimatePresence initial={false} mode="popLayout">
          {formTrips.map((trip, i) => (
            <TripRow
              key={trip.id}
              index={i}
              trip={trip}
              error={showErrors ? errors[trip.id] : undefined}
              result={resultById?.get(trip.id)}
              control={form.control}
              onRemove={handleRemove}
            />
          ))}
        </AnimatePresence>
      </ul>

      {notice && (
        <p role="alert" className="text-tiny text-danger pb-2">
          {notice}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 lg:border-t border-default-200 pt-4">
        <Button
          type="button"
          variant="bordered"
          color="primary"
          startContent={<PlusIcon className="size-4" />}
          onPress={handleAdd}
        >
          Add stay
        </Button>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="light"
            color="danger"
            onPress={onReset}
          >
            Reset
          </Button>
          <Button type="submit" color="primary">
            Calculate
          </Button>
        </div>
      </div>
    </form>
  );
}
