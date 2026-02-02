import * as React from "react";
import { cn } from "./cn";

export function Tooltip({ label, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <div
        className={cn(
          "pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50",
          "transition-all duration-200 ease-premium",
          open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
        )}
        aria-hidden
      >
        <div className="glass grain rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap">
          {label}
        </div>
      </div>
    </div>
  );
}