"use client";

import { useEffect, useId, useState } from "react";

/**
 * "Meer info": een duidelijke kaart (eventueel met plaatje) met een plus; een klik op de kaart of het plaatje klapt
 * de rest open en de plus wordt een min. Met lazy bouwt de browser de inhoud pas bij de eerste klik, zodat zware
 * blokken (animaties, veel foto's) niets kosten zolang niemand ze opent.
 */
export function More({
  title,
  hint,
  image,
  cta = "Meer weten? Klik hier",
  children,
  lazy = false,
  open: openProp,
  className = "",
}: {
  title: string;
  hint?: string;
  image?: string;
  cta?: string;
  children: React.ReactNode;
  lazy?: boolean;
  open?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(!lazy);
  const id = useId();

  // Van buitenaf openen (bijv. de wachtlijst bij een vol slot)
  useEffect(() => {
    if (openProp) {
      setMounted(true);
      setOpen(true);
    }
  }, [openProp]);

  return (
    <div className={`overflow-hidden rounded-[var(--radius-card)] border transition-colors ${open ? "border-accent/60 bg-panel/40" : "border-panel-2 hover:border-fg/30"} ${className}`}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => {
            setMounted(true);
            setOpen((o) => !o);
          }}
          className="group flex w-full items-center gap-4 p-3 text-left sm:gap-5 sm:p-4"
        >
          {image && (
            <span className="relative block aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-[var(--radius-control)] bg-panel sm:w-36">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-lg leading-snug font-bold">{title}</span>
            {hint && <span className="mt-1 block text-sm text-muted">{hint}</span>}
            <span className="mt-2 block text-sm font-semibold text-accent">{open ? "Minder tonen" : cta}</span>
          </span>
          {/* Plus wordt min */}
          <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent" aria-hidden="true">
            <span className="absolute h-0.5 w-4 rounded-full bg-current" />
            <span className={`absolute h-4 w-0.5 rounded-full bg-current transition-transform duration-300 ${open ? "scale-y-0" : ""}`} />
          </span>
        </button>
      </h3>
      <div id={id} className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-5 sm:px-5">{mounted && children}</div>
        </div>
      </div>
    </div>
  );
}
