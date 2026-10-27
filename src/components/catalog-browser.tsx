"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BRAND_LIST, CATALOG_RACKETS, FEELS, LEVELS, PLAYSTYLES, SHAPES, profile, type CatalogRacket } from "@/lib/catalog";
import { QuickView } from "./quick-view";
import { RacketCard } from "./racket-card";
import { ALL_RACKETS } from "@/lib/all-rackets";
import { OWN_BRAND } from "@/lib/own-line";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Filters = { merk: string; vorm: string; hardheid: string; stijl: string; niveau: string; sort: string };
const EMPTY: Filters = { merk: "", vorm: "", hardheid: "", stijl: "", niveau: "", sort: "" };

const SORTS = [
  { id: "", label: "Aanbevolen" },
  { id: "prijs-op", label: "Prijs laag-hoog" },
  { id: "prijs-af", label: "Prijs hoog-laag" },
  { id: "kracht", label: "Meeste kracht" },
  { id: "controle", label: "Meeste controle" },
];

function Chips({ label, value, options, onChange }: { label: string; value: string; options: { id: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 label text-muted">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {[{ id: "", label: "Alle" }, ...options].map((o) => (
          <button
            key={o.id || "alle"}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className="chip"
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Het hele assortiment met filters (merk, vorm, hardheid, speelstijl, niveau) die in de URL staan,
 * zodat "/rackets/?vorm=rond" vanuit het menu direct gefilterd opent.
 */
export function CatalogBrowser({ brand }: { brand?: string }) {
  const [f, setF] = useState<Filters>(EMPTY);
  const [open, setOpen] = useState<{ r: CatalogRacket; from: HTMLElement } | null>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setF({ ...EMPTY, ...Object.fromEntries([...q].filter(([k]) => k in EMPTY)) });
  }, []);

  const set = (k: keyof Filters) => (v: string) =>
    setF((cur) => {
      const next = { ...cur, [k]: v };
      const q = new URLSearchParams(Object.entries(next).filter(([, val]) => val));
      window.history.replaceState(null, "", `${window.location.pathname}${q.size ? `?${q}` : ""}`);
      return next;
    });

  const list = useMemo(() => {
    const out = ALL_RACKETS.filter(
      (r) =>
        (!brand || r.brand === brand) &&
        (!f.merk || r.brand === f.merk) &&
        (!f.vorm || r.shape === f.vorm) &&
        (!f.hardheid || r.feel === f.hardheid) &&
        (!f.stijl || r.playstyle === f.stijl) &&
        (!f.niveau || r.level === f.niveau),
    );
    const price = (r: CatalogRacket) => r.price ?? Infinity;
    if (f.sort === "prijs-op") out.sort((a, b) => price(a) - price(b));
    if (f.sort === "prijs-af") out.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (f.sort === "kracht") out.sort((a, b) => profile(b).power - profile(a).power);
    if (f.sort === "controle") out.sort((a, b) => profile(b).control - profile(a).control);
    return out;
  }, [f, brand]);

  // Kaarten springen gestaffeld op zodra ze in beeld scrollen; balken lopen vol. Alleen transform/opacity.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".racket-card", grid.current);
        gsap.set(cards, { y: 48, opacity: 0 });
        ScrollTrigger.batch(cards, {
          start: "top 92%",
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, { y: 0, opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.06, clearProps: "transform" });
            gsap.from(
              batch.flatMap((c) => [...c.querySelectorAll(".bar-fill")]),
              { scaleX: 0, duration: 0.8, ease: "power3.out", stagger: 0.03, delay: 0.15 },
            );
          },
        });
      });
      return () => mm.revert();
    },
    { scope: grid, dependencies: [list], revertOnUpdate: true },
  );

  const close = useCallback(() => {
    open?.from.querySelector("button")?.focus({ preventScroll: true });
    setOpen(null);
  }, [open]);

  const brandsInUse = [OWN_BRAND, ...BRAND_LIST].filter((b) => ALL_RACKETS.some((r) => r.brand === b.slug));
  const active = Object.entries(f).filter(([k, v]) => v && k !== "sort").length;

  return (
    <div className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-24 md:px-8 lg:grid-cols-[280px_1fr]">
      {/* Filters blijven naast de rackets staan; zijn ze hoger dan het scherm, dan scrollen ze zelf mee (eigen balk) */}
      <aside data-lenis-prevent className="grid content-start gap-6 lg:sticky lg:top-28 lg:max-h-[calc(100svh-8rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pr-3 lg:[scrollbar-width:thin]" aria-label="Filters">
        {!brand && <Chips label="Merk" value={f.merk} options={brandsInUse.map((b) => ({ id: b.slug, label: b.name }))} onChange={set("merk")} />}
        <Chips label="Vorm" value={f.vorm} options={SHAPES} onChange={set("vorm")} />
        <Chips label="Hardheid" value={f.hardheid} options={FEELS} onChange={set("hardheid")} />
        <Chips label="Speelstijl" value={f.stijl} options={PLAYSTYLES} onChange={set("stijl")} />
        <Chips label="Niveau" value={f.niveau} options={LEVELS.map((l) => ({ id: l, label: l }))} onChange={set("niveau")} />
        {active > 0 && (
          <button type="button" onClick={() => SORTS && (window.history.replaceState(null, "", window.location.pathname), setF(EMPTY))} className="link justify-self-start text-sm text-accent">
            Wis filters ({active})
          </button>
        )}
      </aside>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {list.length} {list.length === 1 ? "racket" : "rackets"}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Sorteer</span>
            <select value={f.sort} onChange={(e) => set("sort")(e.target.value)} className="field min-h-[38px] w-auto">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <h2 className="sr-only">Rackets</h2>
        <div ref={grid} className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3">
          {list.map((r) => (
            <RacketCard key={r.id} r={r} onOpen={(racket, from) => setOpen({ r: racket, from })} />
          ))}
        </div>
        {list.length === 0 && <p className="rounded-[var(--radius-card)] bg-panel p-8 text-center text-muted">Geen rackets met deze combinatie. Probeer een filter minder.</p>}
      </div>

      <QuickView racket={open?.r ?? null} from={open?.from ?? null} list={list} onChange={(r) => setOpen((o) => (o ? { ...o, r } : o))} onClose={close} />
    </div>
  );
}
