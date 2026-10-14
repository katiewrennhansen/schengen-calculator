# Schengen 90/180 Day Calculator

React + TypeScript + HeroUI (v2) + Tailwind CSS v4, built with Vite.

## Run it

```bash
npm install
npm run dev      # start the dev server
npm test         # unit tests for the 90/180 engine (Node 22.6+)
npm run build    # type-check and build
```

## How it's organised

| File | Purpose |
| --- | --- |
| `src/lib/schengen.ts` | The 90/180 engine. Pure functions, no React. |
| `src/lib/schengen.test.ts` | Tests for the rolling-window maths. |
| `src/App.tsx` | State, validation display, Add / Calculate / Reset. |
| `src/components/TripRow.tsx` | One stay: date inputs plus per-stay results. |
| `src/components/Summary.tsx` | Days used / remaining and next available stay. |

## The rule as implemented

- Entry day and exit day both count.
- For any day D, count your days in Schengen in the window [D-179, D]. It must never exceed 90.
- **Last day to stay** (per row): the last day you could stay, starting from that entry date,
  given the stays before it, without any day breaching the rule.
- **Days in last 180 days** (per row): days used in the 180 days up to and including the exit date.
