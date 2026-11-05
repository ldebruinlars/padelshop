"use client";

import { useEffect, useId, useState } from "react";
import { PlusIcon } from "./icons";

/**
 * "Meer info": eerst een korte regel, de rest klapt open. Met lazy bouwt de browser de inhoud pas bij de eerste klik,
 * zodat zware blokken (3D, animaties, veel foto's) niets kosten zolang niemand ze opent.
 */
export function More({
  title,
  hint,
  children,
  lazy = false,
  open: openProp,
  className = "",
}: {
  title: string;
  hint?: string;
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
    <div className={`rounded-[var(--radius-card)] border border-panel-2 ${className}`}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => {
            setMounted(true);
            setOpen((o) => !o);
          }}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span>
            <span className="block text-lg font-bold">{title}</span>
            {hint && <span className="mt-0.5 block text-sm text-muted">{hint}</span>}
          </span>
          <span className={`grid size-8 shrink-0 place-items-center rounded-[var(--radius-control)] border border-panel-2 transition-transform duration-300 ${open ? "rotate-45" : ""}`} aria-hidden="true">
            <PlusIcon className="size-3" />
          </span>
        </button>
      </h3>
      <div id={id} className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5">{mounted && children}</div>
        </div>
      </div>
    </div>
  );
}
