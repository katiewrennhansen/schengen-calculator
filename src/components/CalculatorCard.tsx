import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardBody } from "@heroui/react";
import type {
  CalculationResult,
  TripInput,
  ValidationErrors,
} from "../lib/schengen.ts";
import { ROW_GRID, TripRow } from "./TripRow.tsx";

const COLUMN_HEADERS = [
  "Date of entry",
  "Date of exit",
  "Days of stay",
  "Days in last 180 days",
  "Last day to stay",
];

type CalculatorCardProps = {
  trips: TripInput[];
  errors: ValidationErrors;
  showErrors: boolean;
  notice: string | null;
  result: CalculationResult | null;
  onAdd: () => void;
  onChange: (id: string, patch: Partial<Omit<TripInput, "id">>) => void;
  onRemove: (id: string) => void;
  onOpenResetModal: () => void;
  onCalculate: () => void;
};

export function CalculatorCard({
  trips,
  errors,
  showErrors,
  notice,
  result,
  onAdd,
  onChange,
  onRemove,
  onOpenResetModal,
  onCalculate,
}: CalculatorCardProps) {
  const resultById = useMemo(
    () => new Map(result?.trips.map((r) => [r.id, r])),
    [result],
  );

  return (
    <Card shadow="sm">
      <CardBody className="p-4 sm:p-5">
        <div
          className={`hidden gap-4 mb-4 px-2 text-small font-medium text-default-500 lg:grid ${ROW_GRID}`}
        >
          {COLUMN_HEADERS.map((h) => (
            <span key={h}>{h}</span>
          ))}
          <span className="sr-only">Remove</span>
        </div>

        <ul className="flex flex-col gap-0">
          <AnimatePresence initial={false} mode="popLayout">
            {trips.map((trip, i) => (
              <TripRow
                key={trip.id}
                index={i}
                trip={trip}
                error={showErrors ? errors[trip.id] : undefined}
                result={resultById?.get(trip.id)}
                onChange={onChange}
                onRemove={onRemove}
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
            variant="flat"
            startContent={<PlusIcon className="size-4" />}
            onPress={onAdd}
          >
            Add stay
          </Button>
          <div className="flex gap-3">
            <Button variant="light" color="danger" onPress={onOpenResetModal}>
              Reset
            </Button>
            <Button color="primary" onPress={onCalculate}>
              Calculate
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
