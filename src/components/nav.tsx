"use client";

import { useEffect, useRef, useState } from "react";
import { SITE, STYLES } from "@/lib/site";
import { ArrowIcon, Logo } from "./icons";

const LINKS = [
  { href: "#testcenter", label: "Testcenter" },
  { href: "#finder", label: "Racketfinder" },
  { href: "#merken", label: "Merken" },
  { href: "#thuistest", label: "Thuistest" },
];

export function Nav() {
  const [open, setOpen] = useState(false); // megamenu (desktop)
  const [sheet, setSheet] = useState(false); // menu (mobiel)
  const navRef = useRef<HTMLElement>(null);

  // Esc sluit beide menu's
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSheet(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-[max(10px,env(safe-area-inset-left))] pt-[calc(10px+env(safe-area-inset-top))]">
      <nav
        ref={navRef}
        className="relative mx-auto flex max-w-[1400px] items-center justify-between gap-3 rounded-full border border-white/5 bg-navy/85 py-2 pr-2 pl-5 backdrop-blur-md"
        onMouseLeave={() => setOpen(false)}
        onBlur={(e) => {
          // Megamenu sluiten als de focus de navigatie verlaat
          if (!navRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
        aria-label="Hoofdmenu"
      >
        <a href="#top" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight">
          <Logo className="size-6" />
          {SITE.name}
        </a>

        <div className="hidden items-center gap-1 rounded-full bg-navy-2 p-1 text-[13px] lg:flex">
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 transition-colors ${open ? "bg-navy text-white" : "text-mist hover:text-white"}`}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="megamenu"
          >
            Shop per speelstijl
          </button>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-4 py-1.5 text-mist transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#testcenter"
            className="flex items-center gap-3 rounded-full bg-sand py-1.5 pr-1.5 pl-4 text-[13px] font-semibold text-navy transition-transform hover:-translate-y-0.5"
          >
            <span className="max-[380px]:hidden">Boek je racket-test</span>
            <span className="hidden max-[380px]:inline">Boek een test</span>
            <span className="grid size-7 place-items-center rounded-full bg-navy">
              <ArrowIcon className="size-3 text-lime" />
            </span>
          </a>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full bg-navy-2 lg:hidden"
            onClick={() => setSheet((s) => !s)}
            aria-expanded={sheet}
            aria-controls="mobiel-menu"
            aria-label={sheet ? "Menu sluiten" : "Menu openen"}
          >
            <span className="relative block h-3 w-4" aria-hidden="true">
              <span className={`absolute left-0 h-0.5 w-4 rounded bg-white transition-transform ${sheet ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-0.5 w-4 rounded bg-white transition-transform ${sheet ? "top-1.5 -rotate-45" : "top-2.5"}`} />
            </span>
          </button>
        </div>

        {/* Megamenu per speelstijl (desktop) */}
        <div
          id="megamenu"
          className={`absolute top-[calc(100%+8px)] left-1/2 hidden w-[min(880px,94vw)] -translate-x-1/2 grid-cols-4 gap-2 rounded-[var(--radius-card)] border border-white/5 bg-navy p-2 shadow-2xl transition-all lg:grid ${
            open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
        >
          {STYLES.map((s) => (
            <a key={s.id} href="#collectie" className="group rounded-2xl bg-navy-2 p-4 transition-colors hover:bg-navy-3" onClick={() => setOpen(false)}>
              <span className="mb-3 block h-1 w-8 rounded-full" style={{ background: s.color }} />
              <span className="block text-lg font-semibold">{s.label}</span>
              <span className="mt-1 block text-[13px] leading-snug text-mist">{s.tagline}</span>
              <span className="mt-4 flex items-center gap-2 font-ui text-[11px] font-semibold tracking-[0.12em] text-lime uppercase">
                Bekijk rackets <ArrowIcon className="size-3 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      </nav>

      {/* Mobiel menu */}
      <div
        id="mobiel-menu"
        className={`mx-auto mt-2 max-w-[1400px] rounded-[var(--radius-card)] border border-white/5 bg-navy p-3 shadow-2xl lg:hidden ${sheet ? "block" : "hidden"}`}
      >
        <p className="px-2 pt-1 pb-2 font-ui text-[11px] font-semibold tracking-[0.14em] text-mist uppercase">Shop per speelstijl</p>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map((s) => (
            <a key={s.id} href="#collectie" onClick={() => setSheet(false)} className="flex items-center gap-3 rounded-2xl bg-navy-2 px-4 py-3 font-semibold">
              <span className="size-2.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </a>
          ))}
        </div>
        <div className="mt-2 grid">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setSheet(false)} className="flex items-center justify-between rounded-2xl px-4 py-3 text-lg hover:bg-navy-2">
              {l.label}
              <ArrowIcon className="size-3 text-lime" />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
