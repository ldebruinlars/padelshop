"use client";

import { useState } from "react";
import { SITE, STYLES } from "@/lib/site";
import { ArrowIcon, Logo } from "./icons";

const LINKS = [
  { href: "#testcenter", label: "Testcenter" },
  { href: "#finder", label: "Racketfinder" },
  { href: "#merken", label: "Merken" },
  { href: "#thuistest", label: "Thuistest" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-[max(10px,env(safe-area-inset-left))] pt-[calc(10px+env(safe-area-inset-top))]">
      <nav
        className="relative mx-auto flex max-w-[1400px] items-center justify-between gap-3 rounded-full border border-white/5 bg-navy/85 py-2 pr-2 pl-5 backdrop-blur-md"
        onMouseLeave={() => setOpen(false)}
      >
        <a href="#top" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight">
          <Logo className="size-6" />
          {SITE.name}
        </a>

        <div className="hidden items-center gap-1 rounded-full bg-navy-2 p-1 text-[13px] lg:flex">
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 transition-colors ${open ? "bg-navy text-white" : "text-mist hover:text-white"}`}
            onMouseEnter={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            Shop per speelstijl
          </button>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-4 py-1.5 text-mist transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#testcenter"
          className="flex items-center gap-3 rounded-full bg-sand py-1.5 pr-1.5 pl-4 text-[13px] font-semibold text-navy transition-transform hover:-translate-y-0.5"
        >
          Boek je racket-test
          <span className="grid size-7 place-items-center rounded-full bg-navy">
            <ArrowIcon className="size-3 text-lime" />
          </span>
        </a>

        {/* Megamenu per speelstijl */}
        <div
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
    </header>
  );
}
