"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BRAND_LIST, CATALOG_RACKETS } from "@/lib/catalog";
import { ChevronIcon } from "./icons";

/**
 * Eén knop voor alle merken in plaats van tien losse knoppen. Opent een lijst met per merk een rond
 * logo-rondje (beginletters) en het aantal modellen. Sluit met Escape, een klik ernaast of na een keuze.
 */
export function BrandPicker({ value, onChange, counts }: { value: string; onChange: (slug: string) => void; counts?: Record<string, number> }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const current = BRAND_LIST.find((b) => b.slug === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (slug: string) => {
    onChange(slug);
    setOpen(false);
  };
  const count = (slug: string) => counts?.[slug] ?? CATALOG_RACKETS.filter((r) => r.brand === slug).length;
  const initials = (name: string) =>
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div ref={root} className="relative">
      <button type="button" className="chip" aria-expanded={open} aria-controls={id} aria-pressed={Boolean(value)} onClick={() => setOpen((o) => !o)}>
        {current ? current.name : "Alle merken"}
        <ChevronIcon className={`size-3 transition-transform ${open ? "-rotate-90" : "rotate-90"}`} />
      </button>
      <div
        id={id}
        className={`absolute top-[calc(100%+8px)] right-0 z-30 w-[min(360px,calc(100vw-32px))] origin-top-right rounded-[var(--radius-card)] border border-panel-2 bg-bg p-2 text-fg shadow-[0_24px_40px_-12px_rgb(20_17_15/0.6)] transition-[opacity,transform,visibility] duration-200 ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => pick("")}
          aria-pressed={!value}
          className="mb-1 flex w-full items-center justify-between rounded-[var(--radius-control)] px-3 py-2 text-left text-sm hover:bg-panel aria-pressed:bg-panel aria-pressed:font-semibold"
        >
          Alle merken
          <span className="text-muted tabular-nums">{BRAND_LIST.reduce((n, b) => n + count(b.slug), 0)}</span>
        </button>
        <ul className="grid grid-cols-2 gap-1">
          {BRAND_LIST.map((b) => (
            <li key={b.slug}>
              <button
                type="button"
                onClick={() => pick(b.slug)}
                aria-pressed={value === b.slug}
                disabled={count(b.slug) === 0}
                className="flex w-full items-center gap-2.5 rounded-[var(--radius-control)] px-2 py-2 text-left text-sm transition-colors hover:bg-panel disabled:opacity-35 aria-pressed:bg-panel"
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full border font-display text-[11px] font-bold [font-stretch:85%] ${
                    value === b.slug ? "border-accent bg-accent text-on-accent" : "border-panel-2 bg-panel text-fg"
                  }`}
                  aria-hidden="true"
                >
                  {initials(b.name)}
                </span>
                <span className="min-w-0 flex-1 truncate">{b.name}</span>
                <span className="text-xs text-muted tabular-nums">{count(b.slug)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
