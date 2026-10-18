"use client";

import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CATALOG_RACKETS, SHAPES, brandName, styleColor, type CatalogRacket, type Shape } from "@/lib/catalog";
import { SHOP, euro } from "@/lib/site";
import { QuickView } from "./quick-view";
import { RacketArt } from "./racket-art";

gsap.registerPlugin(useGSAP);

const PER_ROW = 6;

/** Twaalf rackets om en om per merk, met per merk een andere speelstijl voorop, zodat de wand gevarieerd hangt. */
function pickForWall(shape: Shape | "") {
  const all = CATALOG_RACKETS.filter((r) => !shape || r.shape === shape);
  const perBrand = [...new Set(all.map((r) => r.brand))].map((b, i) => {
    const own = all.filter((r) => r.brand === b);
    return [...own.slice(i % own.length), ...own.slice(0, i % own.length)];
  });
  const longest = Math.max(0, ...perBrand.map((o) => o.length));
  return Array.from({ length: longest }, (_, rank) => perBrand.map((own) => own[rank]).filter(Boolean))
    .flat()
    .slice(0, PER_ROW * 2);
}

function Peg({ r, onOpen }: { r: CatalogRacket; onOpen: (r: CatalogRacket, from: HTMLElement) => void }) {
  return (
    <li className="peg-slot group relative flex shrink-0 snap-start flex-col items-center max-md:w-[40vw] max-sm:w-[44vw]">
      <button
        type="button"
        onClick={(e) => onOpen(r, e.currentTarget.closest("li") as HTMLElement)}
        className="absolute inset-0 z-10 rounded-[var(--radius-card)]"
        aria-label={`${brandName(r.brand)} ${r.model}, ${r.price != null ? euro(r.price) : "prijs op aanvraag"}. Bekijk specificaties`}
      />
      {/* Haak in de wand */}
      <span className="relative z-[1] mt-1 flex flex-col items-center" aria-hidden="true">
        <span className="h-2.5 w-9 rounded-[2px] bg-[#3a312b] shadow-[0_2px_3px_rgb(0_0_0/0.5)]" />
        <span className="h-3 w-[3px] bg-[#4a3f37]" />
      </span>
      <div className="hang -mt-[3px] h-[clamp(180px,24vh,250px)] w-full">
        <RacketArt shape={r.shape} color={styleColor(r.playstyle)} label={`Tekening van een ${r.shape ?? ""} racket`} eager />
      </div>
      {/* Planklabel op de prijsrail */}
      <div className="wall-label relative z-[1] mt-2 w-[calc(100%-12px)] rounded-[3px] bg-paper px-3 py-2.5 text-on-accent shadow-[0_6px_14px_-6px_rgb(0_0_0/0.7)] transition-transform duration-200 group-hover:-translate-y-0.5">
        <p className="label text-[11px] text-on-accent/70">{brandName(r.brand)}</p>
        <p className="mt-0.5 line-clamp-2 min-h-[2.6em] text-[15px] leading-[1.3] font-semibold">{r.model}</p>
        <p className="mt-1 flex items-baseline justify-between gap-2">
          <span className="text-[12px] text-on-accent/70 capitalize">{r.shape}</span>
          {r.price != null && <span className="font-display text-lg leading-none font-bold tabular-nums">{euro(r.price)}</span>}
        </p>
      </div>
    </li>
  );
}

/**
 * De racketwand: de homepage als de wand in de winkel. Rackets vallen bij het laden op hun haak en komen tot rust,
 * zwaaien bij hover en gaan bij een klik van de wand de snelle weergave in. Alleen transform en opacity.
 */
export function RacketWall() {
  const root = useRef<HTMLElement>(null);
  const [shape, setShape] = useState<Shape | "">("");
  const [open, setOpen] = useState<{ r: CatalogRacket; from: HTMLElement } | null>(null);
  const list = useMemo(() => pickForWall(shape), [shape]);
  const rows = [list.slice(0, PER_ROW), list.slice(PER_ROW)].filter((row) => row.length);
  const count = CATALOG_RACKETS.filter((r) => !shape || r.shape === shape).length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const hangs = gsap.utils.toArray<HTMLElement>(".hang", root.current);
        gsap.fromTo(
          hangs,
          { y: -48, opacity: 0, rotation: (i) => (i % 2 ? 7 : -7) },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.045, clearProps: "opacity" },
        );
        gsap.to(hangs, { rotation: 0, duration: 1.1, ease: "expo.out", stagger: 0.045, delay: 0.2, clearProps: "transform" });
        gsap.from(".wall-label", { y: 12, opacity: 0, duration: 0.45, ease: "power3.out", stagger: 0.045, delay: 0.3, clearProps: "all" });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [shape], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="top" aria-labelledby="wand-titel" className="slatwall relative pt-[calc(96px+env(safe-area-inset-top))]">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid gap-5 pt-8 pb-6 md:pt-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10">
          <div>
            <h1 id="wand-titel" className="text-[clamp(40px,5.4vw,76px)] leading-[0.92] font-bold">
              De racketwand
            </h1>
            <p className="mt-3 max-w-[52ch] text-fg/80 md:text-lg">
              {CATALOG_RACKETS.length} rackets van tien merken. Pak er een van de wand voor alle specs, of speel ze eerst op de baan bij Poort Padel in Almere.
            </p>
            <p className="mt-2 text-sm text-muted">Tekeningen per vorm; productfoto&apos;s volgen.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter de wand op vorm">
            {[{ id: "" as const, label: "Alle vormen" }, ...SHAPES].map((s) => (
              <button key={s.id || "alle"} type="button" className="chip" aria-pressed={shape === s.id} onClick={() => setShape(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] md:px-8">
        {rows.map((row, i) => (
          <div key={i} className="relative">
            {/* Prijsrail onder elke rij */}
            <span className="absolute inset-x-0 bottom-[30px] h-[30px] border-t-2 border-[#3a312b] bg-ink shadow-[0_6px_10px_-4px_rgb(0_0_0/0.7)] max-md:hidden" aria-hidden="true" />
            <ul className="relative flex gap-3 overflow-x-auto px-4 pt-2 pb-6 [scrollbar-width:none] max-md:snap-x max-md:snap-mandatory max-md:scroll-px-4 md:grid md:grid-cols-6 md:overflow-visible md:px-0">
              {row.map((r) => (
                <Peg key={r.id} r={r} onOpen={(racket, from) => setOpen({ r: racket, from })} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Onderkant van de wand: de twee acties van de winkel */}
      <div className="border-t border-panel-2 bg-bg">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-8">
          <p className="max-w-[60ch] text-fg/85">
            <strong className="font-semibold text-fg">Twijfel je?</strong> Speel 45 minuten met 3 tot 5 rackets op de baan. {euro(SHOP.testPrice)}, terug bij aankoop.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="#testcenter" className="btn btn-primary">
              Boek een racket-test
            </a>
            <a href={`/rackets/${shape ? `?vorm=${shape}` : ""}`} className="btn btn-line">
              Alle {count} rackets{shape ? ` (${shape})` : ""}
            </a>
          </div>
        </div>
      </div>

      <QuickView racket={open?.r ?? null} from={open?.from ?? null} onClose={() => setOpen(null)} />
    </section>
  );
}
