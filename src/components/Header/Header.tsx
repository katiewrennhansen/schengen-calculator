import { ArrowDownIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { IoIosAirplane } from "react-icons/io";

export function Header() {
  const scrollToCalculator = () => {
    document.getElementById("calculator")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <header className="relative isolate flex min-h-screen w-full items-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.38),_rgba(2,6,23,0.95)_35%,_rgba(2,6,23,1)_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(15,23,42,0.72),_rgba(2,6,23,0.9))]"
        aria-hidden="true"
      />
      <div
        className="absolute -left-16 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col items-start justify-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-blue-100 shadow-lg backdrop-blur-sm">
              <IoIosAirplane className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-200">
                Travel planner
              </p>
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Schengen Visa Calculator
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">
              Enter your past trips and any you're planning. Entry and exit days
              both count, and nothing leaves your browser.
            </p>
          </div>

          <div className="flex w-full max-w-2xl items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/30 p-4 text-sm text-slate-200 shadow-xl backdrop-blur-sm">
            <ShieldCheckIcon
              className="mt-0.5 size-5 shrink-0 text-emerald-400"
              aria-hidden="true"
            />
            <p className="leading-relaxed">
              Built to keep the numbers clear and your Schengen stay planning
              simple.
            </p>
          </div>

          <Button
            size="lg"
            color="primary"
            onPress={scrollToCalculator}
            endContent={<ArrowDownIcon className="size-4" aria-hidden="true" />}
            className="mt-2 shadow-lg shadow-blue-900/30"
          >
            Calculate now
          </Button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full max-w-[520px] rounded-[28px] p-3 hidden md:block">
            <img
              src={`${import.meta.env.BASE_URL}schengen-map.png`}
              alt="Schengen area map"
              className="h-auto w-full rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
