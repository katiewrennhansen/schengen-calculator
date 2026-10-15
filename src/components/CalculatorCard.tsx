import { Button, Card, CardBody, useDisclosure } from "@heroui/react";
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
import { ClearModal } from "./ClearModal.tsx";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TripRow } from "./TripRow.tsx";

type CalculatorCardProps = {
  trips: TripInput[];
  errors: ValidationErrors;
  result: CalculationResult | null;
  hasErrors: boolean;
  onCalculate: (nextTrips: TripInput[]) => void;
  onReset: () => void;
};

export function CalculatorCard({
  trips,
  errors,
  result,
  hasErrors,
  onCalculate,
  onReset,
}: CalculatorCardProps) {
  const form = useForm<{ trips: TripInput[] }>({
    defaultValues: { trips },
    mode: "onSubmit",
  });
  const [showErrors, setShowErrors] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const resetModal = useDisclosure();
  const resultById = useMemo(
    () => new Map(result?.trips.map((r) => [r.id, r])),
    [result],
  );

  useEffect(() => {
    form.reset({ trips });
  }, [trips, form]);

  const formTrips = useWatch({ control: form.control, name: "trips" }) ?? trips;

  const handleAdd = () => {
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
    form.setValue(
      "trips",
      formTrips.filter((trip) => trip.id !== id),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleCalculate = form.handleSubmit(() => {
    setShowErrors(true);
    setNotice(null);
    if (hasErrors) return;

    const filled = formTrips.filter((t) => !isBlank(t));
    if (filled.length === 0) {
      setNotice("Add at least one entry and exit date to calculate.");
      return;
    }

    onCalculate([...filled].sort((a, b) => a.entry.localeCompare(b.entry)));
  });

  const handleReset = () => {
    onReset();
    setShowErrors(false);
    setNotice(null);
    form.reset({ trips: [] });
    resetModal.onClose();
  };

  return (
    <>
      <Card shadow="sm">
        <CardBody className="p-4 sm:p-5">
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
              <p role="alert" className="text-small text-danger">
                {notice}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-default-200 pt-4">
              <Button
                type="button"
                variant="flat"
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
                  onPress={resetModal.onOpen}
                >
                  Reset
                </Button>
                <Button type="submit" color="primary">
                  Calculate
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      <ClearModal
        isOpen={resetModal.isOpen}
        onOpenChange={resetModal.onOpenChange}
        onConfirm={handleReset}
      />
    </>
  );
}
