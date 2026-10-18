"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND_LIST, FEELS, PLAYSTYLES, SHAPES } from "@/lib/catalog";
import { SHOP, SITE, euro } from "@/lib/site";
import { Logo } from "./icons";

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
    <div className="flex h-8 items-center justify-center overflow-hidden bg-ink px-4 text-[13px] text-muted">
      {/* Op brede schermen alles naast elkaar, op smalle schermen één regel die wisselt */}
      <ul className="hidden gap-10 md:flex">
        {PROMISES.map((p) => (
          <li key={p}>{p}</li>
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
    <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
      <Announcement />
      <nav
        ref={navRef}
        className="relative border-b border-panel-2 bg-bg"
        onMouseLeave={() => setOpen("")}
        onBlur={(e) => {
          // Megamenu sluiten als de focus de navigatie verlaat
          if (!navRef.current?.contains(e.relatedTarget as Node)) setOpen("");
        }}
        aria-label="Hoofdmenu"
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-8 px-4 md:px-8">
        <a href="/" className="flex items-center gap-2 font-display text-[19px] font-bold tracking-tight whitespace-nowrap [font-stretch:90%]">
          <Logo className="size-6" />
          {SITE.name}
        </a>

        <div className="hidden h-full items-center gap-7 text-[15px] lg:flex">
          {(["rackets", "merken"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`flex h-full items-center border-b-2 capitalize transition-colors ${open === m ? "border-accent text-fg" : "border-transparent text-fg/80 hover:text-fg"}`}
              onClick={() => setOpen((o) => (o === m ? "" : m))}
              onMouseEnter={() => setOpen(m)}
              aria-expanded={open === m}
              aria-controls={`menu-${m}`}
            >
              {m}
            </button>
          ))}
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="flex h-full items-center border-b-2 border-transparent text-fg/80 transition-colors hover:text-fg">
              {l.label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <a href="/rackets/" className="btn btn-line btn-sm max-sm:hidden">
            Alle rackets
          </a>
          <a href="/#testcenter" className="btn btn-sand btn-sm">
            Boek een test
          </a>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-[var(--radius-control)] border border-panel-2 lg:hidden"
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

        </div>

        {/* Megamenu's (desktop): rackets per vorm, speelstijl en hardheid; merken */}
        <div
          id="menu-rackets"
          className={`absolute inset-x-0 top-full hidden grid-cols-[1.3fr_1fr_1fr] gap-2 border-b border-panel-2 bg-bg px-[max(16px,calc((100vw-1400px)/2+32px))] py-4 shadow-[0_24px_40px_-12px_rgb(0_0_0/0.6)] transition-[opacity,transform,visibility] lg:grid ${
            open === "rackets" ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
        >
          <div className="grid gap-1 rounded-[var(--radius-card)] bg-panel p-3">
            <p className="px-2 pb-1 label text-muted">Vorm</p>
            {SHAPES.map((s) => (
              <a key={s.id} href={`/rackets/?vorm=${s.id}`} className="rounded-[var(--radius-control)] px-2 py-2 hover:bg-panel-2" onClick={() => setOpen("")}>
                <span className="block font-semibold">{s.label}</span>
                <span className="block text-[13px] leading-snug text-muted">{s.text}</span>
              </a>
            ))}
          </div>
          <div className="grid content-start gap-1 rounded-[var(--radius-card)] bg-panel p-3">
            <p className="px-2 pb-1 label text-muted">Speelstijl</p>
            {PLAYSTYLES.map((s) => (
              <a key={s.id} href={`/rackets/?stijl=${s.id}`} className="flex items-center gap-3 rounded-[var(--radius-control)] px-2 py-2 font-semibold hover:bg-panel-2" onClick={() => setOpen("")}>
                <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </a>
            ))}
            <p className="mt-3 px-2 pb-1 label text-muted">Hardheid</p>
            {FEELS.map((s) => (
              <a key={s.id} href={`/rackets/?hardheid=${s.id}`} className="rounded-[var(--radius-control)] px-2 py-2 font-semibold hover:bg-panel-2" onClick={() => setOpen("")}>
                {s.label}
              </a>
            ))}
          </div>
          <a href="/rackets/" onClick={() => setOpen("")} className="group flex flex-col justify-between rounded-[var(--radius-card)] bg-accent p-5 text-on-accent">
            <span className="text-2xl leading-tight font-semibold">Bekijk alle rackets</span>
            <span className="flex items-center gap-2 label">
              Naar het assortiment
            </span>
          </a>
        </div>
        <div
          id="menu-merken"
          className={`absolute inset-x-0 top-full hidden grid-cols-5 gap-2 border-b border-panel-2 bg-bg px-[max(16px,calc((100vw-1400px)/2+32px))] py-4 shadow-[0_24px_40px_-12px_rgb(0_0_0/0.6)] transition-[opacity,transform,visibility] lg:grid ${
            open === "merken" ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
        >
          {BRAND_LIST.map((b) => (
            <a key={b.slug} href={`/merken/${b.slug}/`} onClick={() => setOpen("")} className="rounded-[var(--radius-card)] bg-panel px-4 py-5 text-lg font-semibold tracking-tight hover:bg-panel-2">
              {b.name}
            </a>
          ))}
        </div>
      </nav>

      {/* Mobiel menu */}
      <div
        id="mobiel-menu"
        className={`max-h-[calc(100svh-96px)] overflow-y-auto border-b border-panel-2 bg-bg p-4 lg:hidden ${sheet ? "block" : "hidden"}`}
      >
        <p className="px-2 pt-1 pb-2 label text-muted">Rackets per vorm</p>
        <div className="grid grid-cols-3 gap-2">
          {SHAPES.map((s) => (
            <a key={s.id} href={`/rackets/?vorm=${s.id}`} onClick={() => setSheet(false)} className="rounded-[var(--radius-card)] bg-panel px-4 py-3 font-semibold">
              {s.label}
            </a>
          ))}
        </div>
        <p className="px-2 pt-4 pb-2 label text-muted">Merken</p>
        <div className="flex flex-wrap gap-1.5">
          {BRAND_LIST.map((b) => (
            <a key={b.slug} href={`/merken/${b.slug}/`} onClick={() => setSheet(false)} className="rounded-[var(--radius-control)] border border-panel-2 px-3.5 py-1.5 text-sm">
              {b.name}
            </a>
          ))}
        </div>
        <div className="mt-2 grid">
          {[{ href: "/rackets/", label: "Alle rackets" }, ...LINKS].map((l) => (
            <a key={l.href} href={l.href} onClick={() => setSheet(false)} className="flex items-center justify-between rounded-[var(--radius-card)] px-4 py-3 text-lg hover:bg-panel">
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
