"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import HEADS from "@/lib/racket-heads.json";
import { CATALOG_RACKETS, brandName, type CatalogRacket, type Shape } from "@/lib/catalog";
import { LAYERS, RULES, SHAPE_GUIDE, SHAPE_SOURCES, type Layer } from "@/lib/racket-guide";
import { ChevronIcon } from "./icons";
import { MaterialScales } from "./material-scales";
import { QuickView } from "./quick-view";

gsap.registerPlugin(MorphSVGPlugin, ScrollTrigger, useGSAP);

// viewBox 200 x 300: de hele racket (45,5 cm) loopt van y=10 tot y=286, dus 1 mm = 276 / 455 eenheden.
const MM = 276 / 455;
const yAtMm = (mm: number) => 286 - mm * MM;
const Z = { heart: -110, frame: -55, core: 0, face: 55, surface: 110 } as const;
const FOAM = { zacht: "#f1e8d6", medium: "#dccaa6", hard: "#b89f78" } as const;

const isCarbon = (r: CatalogRacket) => /carbon/i.test(r.face ?? "") && !/glas|fibre|fiber/i.test(r.face ?? "");
const isRough = (r: CatalogRacket) => /3d|ruw|rough|zand|sand|spin/i.test(`${r.face} ${r.description}`);

function Head({ d, className, ...rest }: React.SVGProps<SVGPathElement> & { d: string }) {
  return <path className={`head ${className ?? ""}`} d={d} {...rest} />;
}

/** Eén laag van het racket, als losse SVG zodat hij in 3D van de andere af kan schuiven. */
function LayerArt({ id, d, r, active }: { id: Layer["id"]; d: string; r: CatalogRacket; active: boolean }) {
  const carbon = isCarbon(r);
  return (
    <svg viewBox="0 0 200 300" className={`layer layer-${id} absolute inset-0 size-full overflow-visible`} data-active={active || undefined} aria-hidden="true">
      <defs>
        <pattern id={`holes-${id}`} width="14" height="30" patternUnits="userSpaceOnUse" x="51" y="51">
          <circle cx="7" cy="7" r="3.2" fill="#0c0a09" />
          <circle cx="14" cy="22" r="3.2" fill="#0c0a09" />
          <circle cx="0" cy="22" r="3.2" fill="#0c0a09" />
        </pattern>
        <pattern id="weave-carbon" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#1f1b18" />
          <rect width="3" height="3" fill="#2f2924" />
          <rect x="3" y="3" width="3" height="3" fill="#2f2924" />
        </pattern>
        <pattern id="weave-glass" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#d9dcd6" />
          <rect width="3" height="3" fill="#c3c7bf" />
          <rect x="3" y="3" width="3" height="3" fill="#c3c7bf" />
        </pattern>
        <pattern id="grit" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="#f6efe6" fillOpacity="0.35" />
          <circle cx="3.5" cy="3" r="0.6" fill="#f6efe6" fillOpacity="0.25" />
        </pattern>
        <clipPath id={`clip-${id}`}>
          <Head d={d} />
        </clipPath>
      </defs>
      {id === "heart" && (
        <g>
          <path d="M78 168l22 26 22-26" fill="none" stroke="#3a312b" strokeWidth="10" strokeLinejoin="round" />
          <rect x="88" y="182" width="24" height="104" rx="9" fill="#2b2622" />
          <rect x="89" y="200" width="22" height="72" rx="6" fill="#e9e0d1" />
          <path d="M89 214l22-8M89 230l22-8M89 246l22-8M89 262l22-8" stroke="#c9bda8" strokeWidth="2" />
        </g>
      )}
      {id === "frame" && <Head d={d} fill="none" stroke="#f06a30" strokeWidth="9" />}
      {id === "core" && (
        <g clipPath={`url(#clip-${id})`}>
          <Head d={d} fill={FOAM[r.feel ?? "medium"]} />
          <rect x="52" y="50" width="96" height="108" fill={`url(#holes-${id})`} />
        </g>
      )}
      {id === "face" && (
        <g clipPath={`url(#clip-${id})`} opacity="0.96">
          <Head d={d} fill={carbon ? "url(#weave-carbon)" : "url(#weave-glass)"} />
          <rect x="52" y="50" width="96" height="108" fill={`url(#holes-${id})`} />
        </g>
      )}
      {id === "surface" && (
        <g clipPath={`url(#clip-${id})`}>
          <Head d={d} fill="#1c1917" fillOpacity="0.55" />
          <Head d={d} fill={isRough(r) ? "url(#grit)" : "none"} />
          <path d="M30 120 L170 64 L170 92 L30 148z" fill="#f06a30" opacity="0.85" />
          <rect x="52" y="50" width="96" height="108" fill={`url(#holes-${id})`} />
        </g>
      )}
    </svg>
  );
}

/**
 * Vorm en opbouw van een racket. In "Vorm" morpht één racket tussen rond, druppel en diamant: sweet spot en
 * balanspunt schuiven mee. In "Opbouw" kantelt hetzelfde racket en valt het uit elkaar in zijn lagen, met de
 * echte specificaties van het gekozen racket.
 */
export function RacketAnatomy() {
  const root = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<"vorm" | "opbouw">("vorm");
  const [shape, setShape] = useState<Shape>("druppel");
  const [initialHead] = useState(() => HEADS.druppel);
  const ofShape = useMemo(() => CATALOG_RACKETS.filter((r) => r.shape === shape), [shape]);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const racket = ofShape.find((r) => r.id === pickedId) ?? ofShape[0];
  const [activeLayer, setActiveLayer] = useState<Layer["id"]>("core");
  const [open, setOpen] = useState<{ r: CatalogRacket; from: HTMLElement } | null>(null);
  const guide = SHAPE_GUIDE.find((g) => g.id === shape)!;

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".anatomy-stage", { y: 40, opacity: 0, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Vorm wisselen: alle koppen morphen tegelijk, sweet spot en balanspunt schuiven mee
  const changeShape = contextSafe((next: Shape) => {
    setShape(next);
    setPickedId(null);
    const g = SHAPE_GUIDE.find((s) => s.id === next)!;
    const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.7;
    gsap.to(".head", { morphSVG: HEADS[next], duration: quick, ease: "expo.out" });
    gsap.to(".sweet", { attr: { cx: g.sweetSpot.cx, cy: g.sweetSpot.cy, rx: g.sweetSpot.rx, ry: g.sweetSpot.ry }, duration: quick, ease: "expo.out" });
    gsap.to(".balance", { y: yAtMm(g.balance.at) - yAtMm(265), duration: quick, ease: "expo.out" });
  });

  // Vorm of opbouw: kantelen en uit elkaar schuiven, of terug plat tegen elkaar
  const changeMode = contextSafe((next: "vorm" | "opbouw") => {
    setMode(next);
    const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;
    const apart = next === "opbouw";
    gsap.to(".stack", { rotateX: apart ? 60 : 0, rotateZ: apart ? -28 : 0, scale: apart ? 0.86 : 1, duration: 0.9 * quick, ease: "expo.inOut" });
    (Object.keys(Z) as (keyof typeof Z)[]).forEach((id, i) =>
      gsap.to(`.layer-${id}`, { z: apart ? Z[id] : 0, duration: 0.9 * quick, delay: apart ? 0.15 + i * 0.05 : 0, ease: "expo.inOut" }),
    );
    gsap.to(".overlay", { opacity: apart ? 0 : 1, duration: 0.3 * quick });
  });

  // De gekozen laag komt een stukje los uit de stapel (geen gloed: diepte door beweging)
  const pickLayer = contextSafe((id: Layer["id"]) => {
    setActiveLayer(id);
    if (mode !== "opbouw") return;
    (Object.keys(Z) as (keyof typeof Z)[]).forEach((k) => gsap.to(`.layer-${k}`, { z: Z[k] + (k === id ? 40 : 0), x: k === id ? 18 : 0, duration: 0.5, ease: "expo.out" }));
  });

  // Vanuit de snelle weergave ("Bekijk de opbouw") of een link /?opbouw=<id>: open de opbouw van dat racket
  const showBuild = contextSafe((id: string) => {
    const r = CATALOG_RACKETS.find((x) => x.id === id);
    if (!r?.shape) return;
    changeShape(r.shape);
    setPickedId(r.id);
    changeMode("opbouw");
    root.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
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
    <section ref={root} id="anatomie" aria-labelledby="anatomie-titel" className="relative overflow-hidden bg-bg py-24">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-panel-2 pb-6">
          <div>
            <h2 id="anatomie-titel" className="text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">
              Wat zit er in een racket?
            </h2>
            <p className="mt-3 max-w-[62ch] text-fg/75">Kies een vorm en zie waar de sweet spot en het balanspunt zitten. Haal daarna een echt racket uit elkaar, laag voor laag.</p>
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
            <div className="stack relative mx-auto h-full w-[62%] [transform-style:preserve-3d]">
              {(Object.keys(Z) as (keyof typeof Z)[]).map((id) => (
                <LayerArt key={id} id={id} d={initialHead} r={racket} active={mode === "opbouw" && activeLayer === id} />
              ))}
              {/* Sweet spot en balanspunt, alleen in de vormweergave */}
              <svg viewBox="0 0 200 300" className="overlay absolute inset-0 size-full overflow-visible" aria-hidden="true">
                <ellipse className="sweet" cx={104} cy={88} rx={34} ry={32} fill="#e3bf78" fillOpacity="0.28" stroke="#e3bf78" strokeWidth="1.5" strokeDasharray="3 3" />
                <g className="balance">
                  <line x1="18" x2="182" y1={yAtMm(265)} y2={yAtMm(265)} stroke="#f6efe6" strokeWidth="1" strokeDasharray="2 3" />
                  <path d={`M10 ${yAtMm(265) - 5}l8 5-8 5z`} fill="#f06a30" />
                </g>
                <line x1="196" x2="196" y1="10" y2="286" stroke="#6b5f55" strokeWidth="1" />
                <text x="199" y="290" fontSize="7" fill="#b3a595">0 mm</text>
                <text x="199" y="14" fontSize="7" fill="#b3a595">455</text>
              </svg>
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
                  Alle {ofShape.length} {guide.label.toLowerCase()}e rackets
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
        <MaterialScales />
      </div>

      <QuickView racket={open?.r ?? null} from={open?.from ?? null} list={ofShape} onChange={(r) => setOpen((o) => (o ? { ...o, r } : o))} onClose={() => setOpen(null)} />
    </section>
  );
}
