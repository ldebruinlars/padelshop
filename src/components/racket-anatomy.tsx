"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { brandName, type CatalogRacket, type Shape } from "@/lib/catalog";
import { ALL_RACKETS } from "@/lib/all-rackets";
import { LAYERS, RULES, SHAPE_GUIDE, SHAPE_SOURCES, type Layer } from "@/lib/racket-guide";
import { ChevronIcon } from "./icons";
import { BuildSteps } from "./build-steps";
import { LayerLab } from "./layer-lab";
import { RacketExplorer } from "./racket-explorer";
import { More } from "./more";
import { QuickView } from "./quick-view";

// viewBox 200 x 300: de hele racket (45,5 cm) loopt van y=10 tot y=286, dus 1 mm = 276 / 455 eenheden.
const MM = 276 / 455;

// Opbouw: renders uit Blender (scripts/render-opbouw.py). Per laag een beeld waarin die laag naar voren komt.
const BUILD = "/media/opbouw";
const LAYER_SHOT: Record<Layer["id"], string> = { surface: "laag-slagvlak", face: "laag-achterkant", core: "laag-kern", frame: "laag-frame", heart: "laag-frame" };
const SHOTS = ["samen", "uit-elkaar", "laag-slagvlak", "laag-achterkant", "laag-kern", "laag-frame"];
// Waar elke laag op het uit-elkaar-beeld staat (procent), berekend in Blender met screen_positions()
const BUILD_LABELS: { id: Layer["id"]; label: string; x: number; y: number }[] = [
  { id: "surface", label: "Slagvlak voor", x: 19, y: 35 },
  { id: "core", label: "Kern", x: 47, y: 42 },
  { id: "frame", label: "Frame en grip", x: 74, y: 52 },
  { id: "face", label: "Slagvlak achter", x: 83, y: 30 },
];

// Echte rackets uit onze eigen lijn voor de vormweergave. top/bottom = bovenkant kop en onderkant grip in % van de
// fotohoogte (gemeten met scripts/measure-cutouts.mjs; de kop is 26 cm breed, het racket 45,5 cm lang).
const PHOTOS: Record<Shape, { slug: string; id: string; name: string; top: number; bottom: number }> = {
  rond: { slug: "lab-r-tour", id: "racket-lab-lab-r-tour", name: "LAB R Tour", top: 0, bottom: 89.1 },
  druppel: { slug: "lab-d-tour", id: "racket-lab-lab-d-tour", name: "LAB D Tour", top: 0.1, bottom: 88.8 },
  diamant: { slug: "lab-x-pro", id: "racket-lab-lab-x-pro", name: "LAB X Pro", top: 0.1, bottom: 91.5 },
};
/** Van de tekening (viewBox 200 x 300, kop 156 breed vanaf x=22) naar procenten op de foto. */
function onPhoto(shape: Shape, g: (typeof SHAPE_GUIDE)[number]) {
  const f = PHOTOS[shape];
  const span = f.bottom - f.top;
  const yMm = (mm: number) => f.top + ((455 - mm) / 455) * span;
  const ssMm = (286 - g.sweetSpot.cy) / MM;
  const ryMm = g.sweetSpot.ry / MM;
  return {
    sweet: { left: ((g.sweetSpot.cx - 22) / 156) * 100, top: yMm(ssMm), w: ((2 * g.sweetSpot.rx) / 156) * 100, h: (2 * ryMm * span) / 455 },
    balance: yMm(g.balance.at),
  };
}

const isRough = (r: CatalogRacket) => /3d|ruw|rough|zand|sand|spin/i.test(`${r.face} ${r.description}`);

/**
 * Vorm en opbouw van een racket. In "Vorm" morpht één racket tussen rond, druppel en diamant: sweet spot en
 * balanspunt schuiven mee. In "Opbouw" kantelt hetzelfde racket en valt het uit elkaar in zijn lagen, met de
 * echte specificaties van het gekozen racket.
 */
export function RacketAnatomy() {
  const root = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<"vorm" | "opbouw">("vorm");
  const [shape, setShape] = useState<Shape>("druppel");
  const ofShape = useMemo(() => ALL_RACKETS.filter((r) => r.shape === shape), [shape]);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const racket = ofShape.find((r) => r.id === pickedId) ?? ofShape[0];
  const [activeLayer, setActiveLayer] = useState<Layer["id"] | null>(null);
  // Opbouwbeelden pas laden bij de eerste keer "Opbouw bekijken"; eerst samen, dan valt hij uit elkaar
  const [built, setBuilt] = useState(false);
  const [apart, setApart] = useState(false);
  const [open, setOpen] = useState<{ r: CatalogRacket; from: HTMLElement } | null>(null);
  const guide = SHAPE_GUIDE.find((g) => g.id === shape)!;

  const changeShape = (next: Shape) => {
    setShape(next);
    setPickedId(null);
  };

  const changeMode = (next: "vorm" | "opbouw") => {
    setMode(next);
    if (next === "opbouw") {
      setBuilt(true);
      setApart(false);
      setActiveLayer(null);
      const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => setApart(true), quick ? 0 : 700);
    }
  };

  const pickLayer = (id: Layer["id"]) => {
    setApart(true);
    setActiveLayer((cur) => (cur === id ? null : id));
  };

  // Vanuit de snelle weergave ("Bekijk de opbouw") of een link /?opbouw=<id>: open de opbouw van dat racket
  const showBuild = (id: string) => {
    const r = ALL_RACKETS.find((x) => x.id === id);
    if (!r?.shape) return;
    changeShape(r.shape);
    setPickedId(r.id);
    changeMode("opbouw");
    root.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const showBuildRef = useRef(showBuild);
  showBuildRef.current = showBuild;
  useEffect(() => {
    const onBuild = (e: Event) => showBuildRef.current((e as CustomEvent<string>).detail);
    window.addEventListener("racketlab:opbouw", onBuild);
    const fromUrl = new URLSearchParams(window.location.search).get("opbouw");
    if (fromUrl) requestAnimationFrame(() => showBuildRef.current(fromUrl));
    return () => window.removeEventListener("racketlab:opbouw", onBuild);
  }, []);

  const specFor = (id: Layer["id"]) =>
    ({
      surface: isRough(racket) ? "Ruw / 3D volgens de specs" : "Niet opgegeven",
      face: racket.face ?? "Niet opgegeven",
      core: [racket.core, racket.feel].filter(Boolean).join(" · ") || "Niet opgegeven",
      frame: racket.frame ?? "Niet opgegeven",
      heart: racket.weight ? `Totaalgewicht ${racket.weight}` : "Niet opgegeven",
    })[id];

  return (
    <section ref={root} id="anatomie" aria-labelledby="anatomie-titel" className="cv relative overflow-hidden bg-bg py-24">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-panel-2 pb-6">
          <div>
            <h2 id="anatomie-titel" className="text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">
              Wat zit er in een racket?
            </h2>
            <p className="mt-3 max-w-[62ch] text-fg/75">Kies een vorm en zie op een echt racket waar de sweet spot en het balanspunt zitten. Haal daarna een racket uit elkaar, laag voor laag.</p>
          </div>
          <div className="flex gap-1 rounded-[var(--radius-control)] border border-panel-2 p-1" role="group" aria-label="Weergave">
            {(["vorm", "opbouw"] as const).map((m) => (
              <button key={m} type="button" className="chip border-0" aria-pressed={mode === m} onClick={() => changeMode(m)}>
                {m === "vorm" ? "Vorm vergelijken" : "Opbouw bekijken"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
          {/* Het racket */}
          <div className="anatomy-stage relative mx-auto aspect-[4/5] w-full max-w-[520px] [perspective:1600px]">
            <div className={`absolute inset-0 transition-opacity duration-500 ${mode === "vorm" ? "opacity-100" : "pointer-events-none opacity-0"}`}>
              <div className="relative mx-auto aspect-[461/900] h-[calc(100%-2.5rem)]">
                {(Object.keys(PHOTOS) as Shape[]).map((k) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={k}
                    src={`/media/eigen-lijn/${PHOTOS[k].slug}-vrij.webp`}
                    alt={k === shape ? `${PHOTOS[k].name}, een ${k === "rond" ? "rond" : k === "druppel" ? "druppelvormig" : "diamantvormig"} racket` : ""}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 size-full object-contain transition-opacity duration-500 ${k === shape ? "opacity-100" : "opacity-0"}`}
                  />
                ))}
                {(() => {
                  const o = onPhoto(shape, guide);
                  return (
                    <div aria-hidden="true">
                      <span
                        className="absolute rounded-[50%] border-2 border-dashed border-[#e3bf78] bg-[#e3bf78]/30 transition-all duration-700 ease-out"
                        style={{ left: `${o.sweet.left}%`, top: `${o.sweet.top}%`, width: `${o.sweet.w}%`, height: `${o.sweet.h}%`, transform: "translate(-50%, -50%)" }}
                      />
                      <span className="absolute -inset-x-6 border-t border-dashed border-fg/80 transition-[top] duration-700 ease-out" style={{ top: `${o.balance}%` }}>
                        <span className="absolute -top-[6px] -left-1 size-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-accent" />
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
            {/* Opbouw: het racket valt uit elkaar en de gekozen laag komt naar voren (renders, lopen in elkaar over) */}
            <div className={`absolute inset-0 overflow-hidden rounded-[var(--radius-panel)] bg-[#e7e4df] transition-opacity duration-500 ${mode === "opbouw" ? "opacity-100" : "pointer-events-none opacity-0"}`}>
              <div className="absolute inset-x-0 top-1/2 aspect-[937/894] -translate-y-1/2">
              {built &&
                SHOTS.map((n) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={n}
                    src={`${BUILD}/${n}.webp`}
                    alt={n === (mode === "opbouw" ? (!apart ? "samen" : activeLayer ? LAYER_SHOT[activeLayer] : "uit-elkaar") : "") ? "Opengewerkt padelracket: slagvlak, kern van rubber, frame met handvat en de achterkant los van elkaar" : ""}
                    decoding="async"
                    className={`absolute inset-0 size-full object-contain transition-opacity duration-700 ease-out ${n === (mode === "opbouw" ? (!apart ? "samen" : activeLayer ? LAYER_SHOT[activeLayer] : "uit-elkaar") : "") ? "opacity-100" : "opacity-0"}`}
                  />
                ))}
              {built &&
                BUILD_LABELS.map((l, i) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => pickLayer(l.id)}
                    style={{ left: `${l.x}%`, top: `${l.y}%` }}
                    className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 text-xs font-semibold whitespace-nowrap shadow-[0_4px_12px_rgb(20_17_15/0.35)] transition-[opacity,background-color] duration-500 ${
                      apart ? "opacity-100" : "pointer-events-none opacity-0"
                    } ${activeLayer === l.id ? "bg-accent text-on-accent" : "bg-ink/85 text-fg hover:bg-ink"}`}
                    aria-pressed={activeLayer === l.id}
                  >
                    <span className={`grid size-5 place-items-center rounded-full text-[11px] tabular-nums ${activeLayer === l.id ? "bg-on-accent/15" : "bg-accent text-on-accent"}`}>{i + 1}</span>
                    {l.label}
                  </button>
                ))}
              </div>
              <p className="absolute bottom-3 left-3 rounded-[3px] bg-ink/75 px-2 py-1 text-xs text-fg/80">Illustratie, geen echt product</p>
            </div>
            {mode === "vorm" && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="inline-block size-3 rounded-full border border-dashed border-[#e3bf78] bg-[#e3bf78]/30" /> Sweet spot
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block size-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-accent" /> Balanspunt {guide.balance.mm}
                </span>
              </div>
            )}
          </div>

          {/* Uitleg */}
          <div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Kies een vorm">
              {SHAPE_GUIDE.map((s) => (
                <button key={s.id} type="button" className="chip" aria-pressed={shape === s.id} onClick={() => changeShape(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>

            {mode === "vorm" ? (
              <div aria-live="polite">
                <h3 className="mt-6 text-2xl font-bold">{guide.label}</h3>
                <p className="mt-1 text-fg/75">{guide.outline}</p>
                <p className="mt-2 text-sm text-muted">
                  Op de foto:{" "}
                  <a href={`/rackets/${PHOTOS[shape].id}/`} className="link">
                    {PHOTOS[shape].name}
                  </a>
                  , een eigen ontwerp. Sweet spot en balanspunt staan op de plek die past bij deze vorm.
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-3">
                  {[
                    ["Sweet spot", guide.sweetSpot.label],
                    ["Balans", `${guide.balance.label}, ${guide.balance.mm}`],
                    ["Kracht", guide.power],
                    ["Controle", guide.control],
                    ["Wendbaarheid", guide.handling],
                    ["Belasting arm", guide.arm],
                  ].map(([k, v]) => (
                    <div key={k} className="border-b border-panel-2 py-2.5">
                      <dt className="label text-muted">{k}</dt>
                      <dd className="mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-fg/80">
                  <strong className="font-semibold">Past bij:</strong> {guide.suits}.
                </p>
                <p className="mt-2 text-xs text-muted">
                  Balans gemeten vanaf de onderkant van de grip. Bronnen verschillen tot zo&apos;n 10 mm en merken labelen balans anders; zie{" "}
                  {SHAPE_SOURCES.map((s, i) => (
                    <span key={s.url}>
                      {i > 0 && ", "}
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">
                        {s.label}
                      </a>
                    </span>
                  ))}
                  .
                </p>
                <h4 className="mt-6 label text-muted">{ofShape.length} rackets met deze vorm</h4>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {ofShape.slice(0, 6).map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={(e) => setOpen({ r, from: e.currentTarget })}
                        className="flex w-full items-baseline justify-between gap-3 rounded-[var(--radius-control)] border border-panel-2 px-3 py-2.5 text-left text-sm transition-colors hover:border-fg/40"
                      >
                        <span>
                          <span className="label mr-2 text-muted">{brandName(r.brand)}</span>
                          {r.model}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <a href={`/rackets/?vorm=${shape}`} className="link mt-3 inline-block text-sm">
                  Alle {ofShape.length} {({ rond: "ronde", druppel: "druppelvormige", diamant: "diamantvormige" } as const)[shape]} rackets
                </a>
              </div>
            ) : (
              <div aria-live="polite">
                <label className="mt-6 grid gap-2">
                  <span className="label text-muted">Racket</span>
                  <select className="field" value={racket.id} onChange={(e) => setPickedId(e.target.value)}>
                    {ofShape.map((r) => (
                      <option key={r.id} value={r.id}>
                        {brandName(r.brand)} {r.model}
                      </option>
                    ))}
                  </select>
                </label>
                <ol className="mt-5 grid">
                  {LAYERS.slice()
                    .reverse()
                    .map((l) => (
                      <li key={l.id} className="border-b border-panel-2">
                        <button type="button" aria-expanded={activeLayer === l.id} onClick={() => pickLayer(l.id)} className="flex w-full items-baseline justify-between gap-4 py-3 text-left">
                          <span className={`text-lg font-bold transition-colors ${activeLayer === l.id ? "text-accent" : ""}`}>{l.name}</span>
                          <span className="text-right text-sm text-fg/80">{specFor(l.id)}</span>
                        </button>
                        {activeLayer === l.id && (
                          <div className="pb-4">
                            <p className="text-fg/75">{l.text}</p>
                            <p className="mt-2 text-xs text-muted">
                              Opties: {l.options} ·{" "}
                              <a href={l.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">
                                bron
                              </a>
                            </p>
                          </div>
                        )}
                      </li>
                    ))}
                </ol>
              </div>
            )}

            <details className="mt-8 rounded-[var(--radius-card)] border border-panel-2 px-4 py-3 text-sm">
              <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold [&::-webkit-details-marker]:hidden">
                <ChevronIcon className="size-3 transition-transform [details[open]_&]:rotate-90" />
                Wat zeggen de regels?
              </summary>
              <dl className="mt-3 grid grid-cols-2 gap-x-6">
                {RULES.items.map(([k, v]) => (
                  <div key={k} className="border-b border-panel-2 py-2">
                    <dt className="label text-muted">{k}</dt>
                    <dd className="mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>
              <a href={RULES.source} target="_blank" rel="noopener noreferrer" className="link mt-3 inline-block text-xs text-muted">
                FIP Rules of Padel, 2026
              </a>
            </details>
          </div>
        </div>
        <RacketExplorer />
        <LayerLab />
        {/* Zes fabrieksfoto's: pas laden als iemand de kaart opent */}
        <More
          lazy
          className="mt-4"
          image="/media/maken/1-kern-v2.webp"
          title="Zo wordt een racket gemaakt"
          hint="Van een plaat rubber tot het racket aan de wand, in zes stappen"
        >
          <BuildSteps />
        </More>
      </div>

      <QuickView racket={open?.r ?? null} from={open?.from ?? null} list={ofShape} onChange={(r) => setOpen((o) => (o ? { ...o, r } : o))} onClose={() => setOpen(null)} />
    </section>
  );
}
