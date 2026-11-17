export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="#f06a30" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8 34 20 6l12 28" />
      <path d="M13 24c5-3 9-3 14 0" />
    </svg>
  );
}

/**
 * Het ene open/dicht-teken van de site: een vierkante plus die een min wordt.
 * Zonder `open` (in een <details>) reageert hij op [open] van de details.
 */
export function ToggleIcon({ open, strong, className = "" }: { open?: boolean; strong?: boolean; className?: string }) {
  return (
    <span
      className={`relative grid size-9 shrink-0 place-items-center rounded-[var(--radius-control)] ${strong ? "bg-accent text-on-accent" : "border border-panel-2"} ${className}`}
      aria-hidden="true"
    >
      <span className="absolute h-0.5 w-3.5 bg-current" />
      <span className={`absolute h-3.5 w-0.5 bg-current transition-transform duration-300 ${open === undefined ? "[details[open]_&]:scale-y-0" : open ? "scale-y-0" : ""}`} />
    </span>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className} aria-hidden="true">
      <path d="m2 2 8 8M10 2l-8 8" />
    </svg>
  );
}

export function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m4.5 2 4 4-4 4" />
    </svg>
  );
}
