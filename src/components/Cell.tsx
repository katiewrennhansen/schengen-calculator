import type { ReactNode } from "react";

type CellProps = {
  label: string;
  children: ReactNode;
};

export function Cell({ label, children }: CellProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-small text-default-500 lg:hidden">{label}</span>
      <div className="text-right lg:text-left">{children}</div>
    </div>
  );
}
