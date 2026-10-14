import { parseDate } from "@internationalized/date";
import { Card, CardBody, DatePicker, Progress } from "@heroui/react";
import type { CalculationResult } from "../lib/schengen.ts";
import { MAX_DAYS } from "../lib/schengen.ts";
import { formatDate, plural } from "../lib/format.ts";
import { OverstayAlert } from "./OverstayAlert";

type Props = {
  result: CalculationResult;
  referenceDate: string;
  onReferenceDateChange: (iso: string) => void;
};

export function Summary({
  result,
  referenceDate,
  onReferenceDateChange,
}: Props) {
  const { plan, trips } = result;
  const color =
    plan.daysRemaining === 0
      ? "danger"
      : plan.daysRemaining <= 15
        ? "warning"
        : "success";
  // Full class names so Tailwind can detect them (no dynamic `text-${color}`).
  const remainingText = {
    danger: "text-danger",
    warning: "text-warning",
    success: "text-success",
  }[color];

  return (
    <section aria-live="polite" className="flex flex-col gap-4">
      <OverstayAlert trips={trips} />

      <Card shadow="sm">
        <CardBody className="gap-5 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-large font-semibold">Your allowance</h2>
              <p className="text-small text-default-500">
                Window: {formatDate(plan.windowStart)} to{" "}
                {formatDate(plan.referenceDate)}
              </p>
            </div>
            <DatePicker
              size="sm"
              variant="bordered"
              label="Check allowance on"
              className="sm:max-w-[200px]"
              value={referenceDate ? (parseDate(referenceDate) as any) : null}
              onChange={(date: any) =>
                date && onReferenceDateChange(date.toString())
              }
            />
          </div>

          <Progress
            aria-label="Days used in the last 180 days"
            value={Math.min(plan.daysUsed, MAX_DAYS)}
            maxValue={MAX_DAYS}
            color={color}
            size="md"
            showValueLabel={false}
          />

          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-small text-default-500">Days used</dt>
              <dd className="text-3xl font-semibold">
                {plan.daysUsed}
                <span className="text-medium font-normal text-default-400">
                  {" "}
                  / {MAX_DAYS}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-small text-default-500">Days remaining</dt>
              <dd className={`text-3xl font-semibold ${remainingText}`}>
                {plan.daysRemaining}
              </dd>
            </div>
            <div>
              <dt className="text-small text-default-500">
                Next stay you can start
              </dt>
              <dd className="font-medium">
                {plan.nextEntry ? (
                  <>
                    {formatDate(plan.nextEntry)}
                    <span className="block text-small font-normal text-default-500">
                      until {formatDate(plan.nextLastDay)} (
                      {plural(plan.nextMaxDays, "day")})
                    </span>
                  </>
                ) : (
                  "None within the next 180 days"
                )}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>
    </section>
  );
}
