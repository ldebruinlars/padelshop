"use client";

import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CATALOG_RACKETS, SHAPES, brandName, styleColor, type CatalogRacket, type Shape } from "@/lib/catalog";
import { SHOP, euro } from "@/lib/site";
import { useDragScroll } from "./drag-scroll";
import { BrandPicker } from "./brand-picker";
import { ChevronIcon } from "./icons";
import { QuickView } from "./quick-view";
import { RacketArt } from "./racket-art";

gsap.registerPlugin(useGSAP);

/** Alle rackets om en om per merk, met per merk een andere speelstijl voorop, zodat de wand gevarieerd hangt. */
function wallOrder(shape: Shape | "", brand: string) {
  const all = CATALOG_RACKETS.filter((r) => (!shape || r.shape === shape) && (!brand || r.brand === brand));
  const perBrand = [...new Set(all.map((r) => r.brand))].map((b, i) => {
    const own = all.filter((r) => r.brand === b);
    return [...own.slice(i % own.length), ...own.slice(0, i % own.length)];
  });
  const longest = Math.max(0, ...perBrand.map((o) => o.length));
  return Array.from({ length: longest }, (_, rank) => perBrand.map((own) => own[rank]).filter(Boolean)).flat();
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Peg({ r, onOpen, eager }: { r: CatalogRacket; onOpen: (r: CatalogRacket, from: HTMLElement) => void; eager: boolean }) {
  return (
    <li data-id={r.id} className="peg-slot group relative flex w-[clamp(150px,15vw,210px)] shrink-0 snap-start flex-col items-center max-sm:w-[44vw]">
      <button
        type="button"
        onClick={(e) => onOpen(r, e.currentTarget.closest("li") as HTMLElement)}
        className="absolute inset-0 z-10 rounded-[var(--radius-card)] focus-visible:outline-offset-[-2px]"
        aria-label={`${brandName(r.brand)} ${r.model}, ${r.price != null ? euro(r.price) : "prijs op aanvraag"}. Bekijk specificaties`}
      />
      {/* Haak in de wand */}
      <span className="relative z-[1] mt-1 flex flex-col items-center" aria-hidden="true">
        <span className="h-2.5 w-9 rounded-[2px] bg-gradient-to-b from-[#9c9186] to-[#6f655c] shadow-[0_2px_3px_rgb(20_17_15/0.35)]" />
        {/* Polskoord als lusje om de haak */}
        <span className="-mt-px h-4 w-3 rounded-b-full border-2 border-t-0 border-[#4a3f37]" />
      </span>
      <div className="hang -mt-[3px] h-[clamp(190px,25vh,260px)] w-full">
        <div className="size-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
          <RacketArt shape={r.shape} color={styleColor(r.playstyle)} label={`Tekening van een ${r.shape ?? ""} racket`} eager={eager} />
        </div>
      </div>
      {/* Prijskaartje op de rail */}
      <div className="wall-label relative z-[1] mt-2 w-[calc(100%-10px)] rounded-[3px] bg-bg px-3 py-2.5 text-fg shadow-[0_8px_16px_-8px_rgb(20_17_15/0.6)] transition-transform duration-200 group-hover:-translate-y-0.5">
        <p className="label text-[11px] text-muted">{brandName(r.brand)}</p>
        <p className="mt-0.5 line-clamp-2 min-h-[2.6em] text-[15px] leading-[1.3] font-semibold">{r.model}</p>
        <p className="mt-1 flex items-baseline justify-between gap-2">
          <span className="text-[12px] text-muted capitalize">{r.shape}</span>
          {r.price != null && <span className="font-display text-lg leading-none font-bold text-accent tabular-nums">{euro(r.price)}</span>}
        </p>
      </div>
    </li>
  );
}

function Row({ items, label, onOpen }: { items: CatalogRacket[]; label: string; onOpen: (r: CatalogRacket, from: HTMLElement) => void }) {
  const { ref, handlers } = useDragScroll<HTMLUListElement>();
  const by = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reducedMotion() ? "auto" : "smooth" });
  };
  return (
    <div className="relative">
      {/* Prijsrail onder de rij */}
      <span className="absolute inset-x-0 bottom-[30px] h-[30px] border-t-2 border-[#8d8072] bg-[#2a221d] shadow-[0_8px_12px_-6px_rgb(20_17_15/0.5)]" aria-hidden="true" />
      <ul
        ref={ref}
        {...handlers}
        aria-label={label}
        className="relative flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-2 pb-6 [scrollbar-width:none] select-none md:cursor-grab md:scroll-px-8 md:gap-5 md:px-8 md:active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {/* Alleen de rackets die meteen in beeld hangen laden direct; de rest pas bij het swipen */}
        {items.map((r, i) => (
          <Peg key={r.id} r={r} onOpen={onOpen} eager={i < 7} />
        ))}
      </ul>
      <div className="pointer-events-none absolute inset-y-0 right-0 left-0 flex items-center justify-between px-2 max-md:hidden">
        {([-1, 1] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => by(d)}
            className="pointer-events-auto relative z-20 grid size-11 place-items-center rounded-[var(--radius-control)] bg-bg/90 text-fg shadow-[0_6px_16px_-6px_rgb(20_17_15/0.6)] hover:bg-bg"
            aria-label={d === 1 ? "Meer rackets rechts" : "Meer rackets links"}
          >
            <ChevronIcon className={`size-4 ${d === -1 ? "rotate-180" : ""}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * De racketwand: de homepage als de wand in de winkel, met alle rackets in twee rijen die je opzij swipet of sleept.
 * Rackets vallen bij het laden op hun haak, groeien bij hover en zwaaien vanaf de haak; een klik zoomt het racket
 * van de haak de snelle weergave in. Daar swipe je verder naar het volgende racket.
 */
export function RacketWall() {
  const root = useRef<HTMLElement>(null);
  const [shape, setShape] = useState<Shape | "">("");
  const [open, setOpen] = useState<{ r: CatalogRacket; from: HTMLElement } | null>(null);
  const [brand, setBrand] = useState("");
  const list = useMemo(() => wallOrder(shape, brand), [shape, brand]);
  // Aantal per merk binnen de gekozen vorm, voor de merkenlijst
  const brandCounts = useMemo(() => Object.fromEntries([...new Set(CATALOG_RACKETS.map((r) => r.brand))].map((b) => [b, CATALOG_RACKETS.filter((r) => r.brand === b && (!shape || r.shape === shape)).length])), [shape]);
  const half = Math.ceil(list.length / 2);
  const rows = [list.slice(0, half), list.slice(half)].filter((row) => row.length);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const hangs = gsap.utils.toArray<HTMLElement>(".hang", root.current).slice(0, 18);
        gsap.fromTo(
          hangs,
          { y: -48, opacity: 0, rotation: (i) => (i % 2 ? 7 : -7) },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.035, clearProps: "opacity" },
        );
        gsap.to(hangs, { rotation: 0, duration: 1.1, ease: "expo.out", stagger: 0.035, delay: 0.2, clearProps: "transform" });
        gsap.from(gsap.utils.toArray(".wall-label", root.current).slice(0, 18), { y: 12, opacity: 0, duration: 0.45, ease: "expo.out", stagger: 0.035, delay: 0.3, clearProps: "all" });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [shape, brand], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="top" aria-labelledby="wand-titel" className="relative pt-[calc(96px+env(safe-area-inset-top))]">
      <div className="slatwall">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <div className="grid gap-5 pt-8 pb-6 md:pt-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10">
            <div>
              <h1 id="wand-titel" className="text-[clamp(40px,5.4vw,76px)] leading-[0.92] font-bold text-on-accent">
                De racketwand
              </h1>
              <p className="mt-3 max-w-[48ch] text-[#4a3f37] [text-wrap:pretty] md:text-lg">
                {CATALOG_RACKETS.length} rackets van tien merken. Swipe langs de wand en klik op een racket om in te zoomen op de specs.
              </p>
              <p className="mt-2 text-sm text-[#5b4f45]">Tekeningen per vorm; productfoto&apos;s volgen.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter de wand op vorm">
                {[{ id: "" as const, label: "Alle vormen" }, ...SHAPES].map((s) => (
                  <button key={s.id || "alle"} type="button" className="chip" aria-pressed={shape === s.id} onClick={() => setShape(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
              <span className="mx-1 h-6 w-px bg-on-accent/20 max-sm:hidden" aria-hidden="true" />
              <BrandPicker value={brand} onChange={setBrand} counts={brandCounts} />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1600px]">
          {list.length === 0 && (
            <p className="mx-4 mb-8 rounded-[var(--radius-card)] bg-bg/90 p-6 text-fg md:mx-8">
              Geen {shape} rackets van {brandName(brand)} aan de wand.{" "}
              <button type="button" className="link text-accent" onClick={() => setShape("")}>
                Toon alle vormen
              </button>
            </p>
          )}
          {rows.map((row, i) => (
            <Row key={`${shape}-${brand}-${i}`} items={row} label={`Rackets, rij ${i + 1}`} onOpen={(racket, from) => setOpen({ r: racket, from })} />
          ))}
        </div>
      </div>

      {/* Onderkant van de wand: de twee acties van de winkel */}
      <div className="border-b border-panel-2 bg-bg">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-8">
          <p className="max-w-[60ch] text-fg/85">
            <strong className="font-semibold text-fg">Twijfel je?</strong> Speel 45 minuten met 3 tot 5 rackets op de baan. {euro(SHOP.testPrice)}, terug bij aankoop.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="#testcenter" className="btn btn-primary">
              Boek een racket-test
            </a>
            <a href={`/rackets/?${new URLSearchParams(Object.entries({ vorm: shape, merk: brand }).filter(([, v]) => v))}`} className="btn btn-line">
              Filter alle {list.length} rackets
            </a>
          </div>
        </div>
      </div>

      <QuickView
        racket={open?.r ?? null}
        from={open?.from ?? null}
        list={list}
        onChange={(r) => setOpen((o) => (o ? { ...o, r } : o))}
        onClose={() => setOpen(null)}
      />
    </section>
  );
}
