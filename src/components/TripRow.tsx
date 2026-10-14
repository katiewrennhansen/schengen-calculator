import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { TrashIcon } from "@heroicons/react/24/outline";
import { parseDate } from "@internationalized/date";
import { Button, Chip, DatePicker } from "@heroui/react";
import type { TripInput, TripResult } from "../lib/schengen.ts";
import { formatDate, plural } from "../lib/format.ts";

export const ROW_GRID =
  "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.4fr)_2.5rem]";

interface Props {
  index: number;
  trip: TripInput;
  error?: { entry?: string; exit?: string };
  result?: TripResult;
  onChange: (id: string, patch: Partial<Omit<TripInput, "id">>) => void;
  onRemove: (id: string) => void;
}

/** Result cell: shows its own label on small screens, where the column header is hidden. */
function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-small text-default-500 lg:hidden">{label}</span>
      <div className="text-right lg:text-left">{children}</div>
    </div>
  );
}

export function TripRow({
  index,
  trip,
  error,
  result,
  onChange,
  onRemove,
}: Props) {
  const over = result?.overstay ?? false;

  const onEntryChange = (date: any) =>
    onChange(trip.id, { entry: date ? date.toString() : "" });

  const onExitChange = (date: any) =>
    onChange(trip.id, { exit: date ? date.toString() : "" });

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.98, y: 8 }}
      animate={{
        opacity: 1,
        height: "auto",
        scale: 1,
        y: 0,
      }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.98 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`grid grid-cols-1 gap-3 rounded-large border p-4 items-center overflow-hidden lg:gap-4 lg:border-0 lg:border-t lg:rounded-none lg:px-2 lg:py-3 last:mb-0 ${ROW_GRID} ${
        over ? "border-danger-200 bg-danger-50/50" : "border-default-200"
      }`}
    >
      <DatePicker
        variant="bordered"
        aria-label={`Date of entry, stay ${index + 1}`}
        labelPlacement="inside"
        value={trip.entry ? (parseDate(trip.entry) as any) : null}
        onChange={onEntryChange}
        isInvalid={!!error?.entry}
        errorMessage={error?.entry}
      />
      <DatePicker
        variant="bordered"
        aria-label={`Date of exit, stay ${index + 1}`}
        minValue={trip.entry ? (parseDate(trip.entry) as any) : undefined}
        value={trip.exit ? (parseDate(trip.exit) as any) : null}
        onChange={onExitChange}
        isInvalid={!!error?.exit}
        errorMessage={error?.exit}
      />

      <Cell label="Days of stay">
        <span className="font-medium">{result ? result.daysOfStay : "–"}</span>
      </Cell>

      <Cell label="Days in last 180 days">
        {result ? (
          <Chip
            size="sm"
            variant="flat"
            color={
              result.overstay
                ? "danger"
                : result.daysInLast180 >= 80
                  ? "warning"
                  : "success"
            }
          >
            {result.daysInLast180} / 90
          </Chip>
        ) : (
          <span>–</span>
        )}
      </Cell>

      <Cell label="Last day to stay">
        {result ? (
          <div className="flex flex-col">
            <span className="font-medium">
              {result.lastDayToStay
                ? formatDate(result.lastDayToStay)
                : "No days available"}
            </span>
            <span className="text-tiny text-default-500">
              {result.lastDayToStay
                ? `${plural(result.maxStayDays, "day")} max on this entry`
                : "Allowance used up on entry"}
            </span>
            {result.overstay && (
              <span className="mt-1 text-tiny font-medium text-danger">
                Over the limit by {plural(result.excessDays, "day")} from{" "}
                {formatDate(result.firstOverstayDate)}
              </span>
            )}
          </div>
        ) : (
          <span>–</span>
        )}
      </Cell>

      <div className="flex justify-end lg:pt-1">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          aria-label={`Remove stay ${index + 1}`}
          onPress={() => onRemove(trip.id)}
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </motion.li>
  );
}
