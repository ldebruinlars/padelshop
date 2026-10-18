"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND_LIST, FEELS, PLAYSTYLES, SHAPES } from "@/lib/catalog";
import { SHOP, SITE, euro } from "@/lib/site";
import { ArrowIcon, Logo } from "./icons";

const LINKS = [
  { href: "/#testcenter", label: "Testcenter" },
  { href: "/#finder", label: "Racketfinder" },
  { href: "/#advies", label: "Advies" },
];

const PROMISES = [
  `Gratis bezorging vanaf ${euro(SHOP.freeShippingFrom)}`,
  `${SHOP.returnDays} dagen bedenktijd`,
  `Test eerst bij ${SITE.location.split(",")[0]}`,
  ...(SHOP.payLater ? [`Achteraf betalen met ${SHOP.payLater}`] : []),
];

/** Aankondigingsbalk: wisselt elke paar seconden van belofte; staat stil bij reduced motion. */
function Announcement() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % PROMISES.length), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="mx-auto mb-1.5 flex h-7 max-w-[1400px] items-center justify-center overflow-hidden rounded-full bg-bg/95 px-4 font-ui text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
      {/* Op brede schermen alles naast elkaar, op smalle schermen één regel die wisselt */}
      <ul className="hidden gap-8 md:flex">
        {PROMISES.map((p) => (
          <li key={p} className="flex items-center gap-2">
            <span className="size-1 rounded-full bg-accent" />
            {p}
          </li>
        ))}
      </ul>
      <p key={i} className="animate-[promise_0.5s_ease-out] md:hidden" aria-live="off">
        {PROMISES[i]}
      </p>
    </div>
  );
}

export function Nav() {
  const [open, setOpen] = useState<"" | "rackets" | "merken">(""); // megamenu (desktop)
  const [sheet, setSheet] = useState(false); // menu (mobiel)
  const navRef = useRef<HTMLElement>(null);

  // Esc sluit beide menu's
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen("");
        setSheet(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-[max(10px,env(safe-area-inset-left))] pt-[calc(4px+env(safe-area-inset-top))]">
      <Announcement />
      <nav
        ref={navRef}
        className="relative mx-auto flex max-w-[1400px] items-center justify-between gap-3 rounded-full border border-fg/5 bg-bg/95 py-2 pr-2 pl-5"
        onMouseLeave={() => setOpen("")}
        onBlur={(e) => {
          // Megamenu sluiten als de focus de navigatie verlaat
          if (!navRef.current?.contains(e.relatedTarget as Node)) setOpen("");
        }}
        aria-label="Hoofdmenu"
      >
        <a href="/" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight whitespace-nowrap">
          <Logo className="size-6" />
          {SITE.name}
        </a>

        <div className="hidden items-center gap-1 rounded-full bg-panel p-1 text-[13px] lg:flex">
          {(["rackets", "merken"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`rounded-full px-4 py-1.5 capitalize transition-colors ${open === m ? "bg-bg text-fg" : "text-muted hover:text-fg"}`}
              onClick={() => setOpen((o) => (o === m ? "" : m))}
              onMouseEnter={() => setOpen(m)}
              aria-expanded={open === m}
              aria-controls={`menu-${m}`}
            >
              {m}
            </button>
          ))}
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-4 py-1.5 text-muted transition-colors hover:text-fg">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/#testcenter"
            className="flex items-center gap-3 rounded-full bg-accent-2 py-1.5 pr-1.5 pl-4 text-[13px] font-semibold text-on-accent transition-transform hover:-translate-y-0.5"
          >
            <span className="max-sm:hidden">Boek je racket-test</span>
            <span className="hidden whitespace-nowrap max-sm:inline">Boek een test</span>
            <span className="grid size-7 place-items-center rounded-full bg-bg">
              <ArrowIcon className="size-3 text-accent" />
            </span>
          </a>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full bg-panel lg:hidden"
            onClick={() => setSheet((s) => !s)}
            aria-expanded={sheet}
            aria-controls="mobiel-menu"
            aria-label={sheet ? "Menu sluiten" : "Menu openen"}
          >
            <span className="relative block h-3 w-4" aria-hidden="true">
              <span className={`absolute left-0 h-0.5 w-4 rounded bg-fg transition-transform ${sheet ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-0.5 w-4 rounded bg-fg transition-transform ${sheet ? "top-1.5 -rotate-45" : "top-2.5"}`} />
            </span>
          </button>
        </div>

        {/* Megamenu's (desktop): rackets per vorm, speelstijl en hardheid; merken */}
        <div
          id="menu-rackets"
          className={`absolute top-[calc(100%+8px)] left-1/2 hidden w-[min(920px,94vw)] -translate-x-1/2 grid-cols-[1.3fr_1fr_1fr] gap-2 rounded-[var(--radius-card)] border border-fg/5 bg-bg p-2 shadow-2xl transition-[opacity,transform,visibility] lg:grid ${
            open === "rackets" ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
        >
          <div className="grid gap-1 rounded-2xl bg-panel p-3">
            <p className="px-2 pb-1 font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Vorm</p>
            {SHAPES.map((s) => (
              <a key={s.id} href={`/rackets/?vorm=${s.id}`} className="rounded-xl px-2 py-2 hover:bg-panel-2" onClick={() => setOpen("")}>
                <span className="block font-semibold">{s.label}</span>
                <span className="block text-[13px] leading-snug text-muted">{s.text}</span>
              </a>
            ))}
          </div>
          <div className="grid content-start gap-1 rounded-2xl bg-panel p-3">
            <p className="px-2 pb-1 font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Speelstijl</p>
            {PLAYSTYLES.map((s) => (
              <a key={s.id} href={`/rackets/?stijl=${s.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 font-semibold hover:bg-panel-2" onClick={() => setOpen("")}>
                <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </a>
            ))}
            <p className="mt-3 px-2 pb-1 font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Hardheid</p>
            {FEELS.map((s) => (
              <a key={s.id} href={`/rackets/?hardheid=${s.id}`} className="rounded-xl px-2 py-2 font-semibold hover:bg-panel-2" onClick={() => setOpen("")}>
                {s.label}
              </a>
            ))}
          </div>
          <a href="/rackets/" onClick={() => setOpen("")} className="group flex flex-col justify-between rounded-2xl bg-accent p-5 text-on-accent">
            <span className="text-2xl leading-tight font-semibold">Bekijk alle rackets</span>
            <span className="flex items-center gap-2 font-ui text-[11px] font-semibold tracking-[0.12em] uppercase">
              Naar het assortiment <ArrowIcon className="size-3 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </div>
        <div
          id="menu-merken"
          className={`absolute top-[calc(100%+8px)] left-1/2 hidden w-[min(920px,94vw)] -translate-x-1/2 grid-cols-5 gap-2 rounded-[var(--radius-card)] border border-fg/5 bg-bg p-2 shadow-2xl transition-[opacity,transform,visibility] lg:grid ${
            open === "merken" ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
        >
          {BRAND_LIST.map((b) => (
            <a key={b.slug} href={`/merken/${b.slug}/`} onClick={() => setOpen("")} className="rounded-2xl bg-panel px-4 py-5 text-lg font-semibold tracking-tight hover:bg-panel-2">
              {b.name}
            </a>
          ))}
        </div>
      </nav>

      {/* Mobiel menu */}
      <div
        id="mobiel-menu"
        className={`mx-auto mt-2 max-w-[1400px] rounded-[var(--radius-card)] border border-fg/5 bg-bg p-3 shadow-2xl lg:hidden ${sheet ? "block" : "hidden"}`}
      >
        <p className="px-2 pt-1 pb-2 font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Rackets per vorm</p>
        <div className="grid grid-cols-3 gap-2">
          {SHAPES.map((s) => (
            <a key={s.id} href={`/rackets/?vorm=${s.id}`} onClick={() => setSheet(false)} className="rounded-2xl bg-panel px-4 py-3 font-semibold">
              {s.label}
            </a>
          ))}
        </div>
        <p className="px-2 pt-4 pb-2 font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Merken</p>
        <div className="flex flex-wrap gap-1.5">
          {BRAND_LIST.map((b) => (
            <a key={b.slug} href={`/merken/${b.slug}/`} onClick={() => setSheet(false)} className="rounded-full border border-panel-2 px-3.5 py-1.5 text-sm">
              {b.name}
            </a>
          ))}
        </div>
        <div className="mt-2 grid">
          {[{ href: "/rackets/", label: "Alle rackets" }, ...LINKS].map((l) => (
            <a key={l.href} href={l.href} onClick={() => setSheet(false)} className="flex items-center justify-between rounded-2xl px-4 py-3 text-lg hover:bg-panel">
              {l.label}
              <ArrowIcon className="size-3 text-accent" />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
