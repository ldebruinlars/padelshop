"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LAYERS } from "@/lib/racket-guide";
import { TECH } from "@/lib/tech";
import { CoreLab, FaceLab } from "./layer-lab";

gsap.registerPlugin(useGSAP);

type PartId = "kern" | "slagvlak" | "frame" | "hart" | "grip";

// Plek van elk onderdeel op het opengewerkte racket (procent van de afbeelding), hoe ver we inzoomen en de close-up
const PARTS: { id: PartId; name: string; x: number; y: number; zoom: number; img: string; text: string; tech: string[] }[] = [
  {
    id: "slagvlak",
    name: "Slagvlak",
    x: 51,
    y: 36,
    zoom: 1.7,
    img: "/media/onderdelen/slagvlak.webp",
    text: `${LAYERS.find((l) => l.id === "face")!.text} ${LAYERS.find((l) => l.id === "surface")!.text}`,
    tech: ["Polyglass", "TopSpin", "3D Grain", "SmartHoles"],
  },
  {
    id: "kern",
    name: "Kern",
    x: 68,
    y: 18,
    zoom: 2.6,
    img: "/media/onderdelen/kern.webp",
    text: LAYERS.find((l) => l.id === "core")!.text,
    tech: ["MultiEva", "HardEva", "SoftEva", "CloudEva"],
  },
  {
    id: "frame",
    name: "Frame",
    x: 19,
    y: 28,
    zoom: 2.4,
    img: "/media/onderdelen/frame.webp",
    text: `${LAYERS.find((l) => l.id === "frame")!.text} In de buis zit lucht: zo blijft het frame licht en toch stijf. Het stootrandje bovenop beschermt de kop als je de grond of de wand raakt.`,
    tech: ["CarbonTube", "Curv:Aktiv", "Air React Channel", "CustomWeight"],
  },
  {
    id: "hart",
    name: "Hart",
    x: 50,
    y: 61,
    zoom: 2.4,
    img: "/media/onderdelen/hart.webp",
    text: "Het hart is de open driehoek waar de kop overgaat in de grip. De twee armen dragen de energie van de klap naar je hand. Hoe stijf ze zijn, bepaalt hoe stabiel het racket blijft bij slagen buiten het midden en hoeveel trilling je voelt. Sommige merken zetten er een extra brug in.",
    tech: ["EasyVibe"],
  },
  {
    id: "grip",
    name: "Grip",
    x: 50,
    y: 81,
    zoom: 2.2,
    img: "/media/onderdelen/grip.webp",
    text: `${LAYERS.find((l) => l.id === "heart")!.text} Het polskoord is verplicht: dat houdt het racket aan je pols als het uit je hand schiet.`,
    tech: ["Vibradrive", "Hesacore"],
  },
];

/**
 * Een opengewerkt racket met punten op de onderdelen. Je begint bij het hele racket; een klik zoomt in op een
 * onderdeel en de close-up vloeit erover. Van onderdeel naar onderdeel schuift het beeld mee en lopen de close-ups
 * in elkaar over, zonder eerst terug te springen.
 */
export function RacketExplorer() {
  const root = useRef<HTMLDivElement>(null);
  const [part, setPart] = useState<PartId | null>(null);
  const p = PARTS.find((x) => x.id === part) ?? null;

  const { contextSafe } = useGSAP({ scope: root });
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Het gekozen punt naar het midden van het beeld: schuiven en schalen vanuit het midden, dus altijd vloeiend
  const frameTo = (x: number, y: number, s: number) => ({ scale: s, xPercent: (50 - x) * s, yPercent: (50 - y) * s });

  const zoomTo = contextSafe((id: PartId) => {
    if (id === part) return;
    const t = PARTS.find((x) => x.id === id)!;
    const from = part;
    setPart(id);
    const q = reduced() ? 0 : 1;
    gsap.killTweensOf([".explore-zoom", ".explore-macro"]);
    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    if (from) {
      // Van close-up naar close-up: de nieuwe vloeit over de oude terwijl het racket eronder meeschuift
      tl.to(".explore-zoom", { ...frameTo(t.x, t.y, t.zoom), duration: 0.8 * q }, 0)
        .to(`.explore-macro-${from}`, { opacity: 0, scale: 1.04, duration: 0.7 * q }, 0)
        .fromTo(`.explore-macro-${id}`, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.8 * q }, 0.1 * q);
    } else {
      // Vanaf het hele racket: inzoomen, en in de laatste meters komt de close-up erover
      tl.to(".explore-zoom", { ...frameTo(t.x, t.y, t.zoom), duration: 0.95 * q, ease: "expo.inOut" }, 0).fromTo(
        `.explore-macro-${id}`,
        { opacity: 0, scale: 1.08 },
        { opacity: 1, scale: 1, duration: 0.6 * q, ease: "power2.out" },
        0.55 * q,
      );
    }
  });

  const zoomOut = contextSafe(() => {
    if (!part) return;
    const from = part;
    setPart(null);
    const q = reduced() ? 0 : 1;
    gsap.killTweensOf([".explore-zoom", ".explore-macro"]);
    gsap
      .timeline()
      .to(`.explore-macro-${from}`, { opacity: 0, scale: 1.04, duration: 0.45 * q, ease: "power2.in" }, 0)
      .to(".explore-zoom", { scale: 1, xPercent: 0, yPercent: 0, duration: 0.85 * q, ease: "expo.inOut" }, 0.1 * q);
  });

  const choices = [{ id: null, name: "Hele racket" }, ...PARTS.map((x) => ({ id: x.id, name: x.name }))];

  return (
    <div ref={root} className="mt-14 border-t border-panel-2 pt-10">
      <h3 className="text-2xl font-bold">Bekijk een racket van dichtbij</h3>
      <p className="mt-2 max-w-[66ch] text-fg/75">Klik op een punt op het racket. We zoomen in op dat onderdeel en laten zien hoe het eruitziet en wat het voor je spel doet.</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Het racket met de punten */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-[3/4] max-h-[78svh] overflow-hidden rounded-[var(--radius-panel)] bg-[#e7e4df]">
            <div className="explore-zoom absolute inset-0 will-change-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/onderdelen/doorsnede.webp" alt="Padelracket met een opengewerkte hoek: slagvlak, kern en frame" loading="lazy" decoding="async" className="size-full object-cover" />
              {PARTS.map((x, i) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => zoomTo(x.id)}
                  style={{ left: `${x.x}%`, top: `${x.y}%` }}
                  className={`group absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${part ? "pointer-events-none opacity-0" : "opacity-100"}`}
                  aria-label={`Zoom in op ${x.name.toLowerCase()}`}
                >
                  <span className="absolute -inset-1.5 rounded-full border-2 border-accent/60 transition-transform duration-300 group-hover:scale-125" aria-hidden="true" />
                  <span className="relative grid size-8 place-items-center rounded-full border-2 border-white bg-accent text-sm font-bold text-on-accent shadow-[0_4px_12px_rgb(20_17_15/0.5)]">{i + 2}</span>
                  <span className="pointer-events-none absolute top-1/2 left-[calc(100%+6px)] -translate-y-1/2 rounded-[4px] bg-ink/85 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-fg">{x.name}</span>
                </button>
              ))}
            </div>
            {/* Close-ups liggen klaar boven het racket en vloeien in elkaar over */}
            {PARTS.map((x) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={x.id}
                src={x.img}
                alt={part === x.id ? `Close-up van ${x.name.toLowerCase()}` : ""}
                loading="lazy"
                decoding="async"
                className={`explore-macro explore-macro-${x.id} pointer-events-none absolute inset-0 size-full object-cover opacity-0`}
              />
            ))}
            {p && (
              <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                <span className="rounded-[4px] bg-ink/85 px-2.5 py-1 text-sm font-semibold text-fg">{p.name}</span>
                <button type="button" onClick={zoomOut} className="btn btn-sand btn-sm">
                  Hele racket
                </button>
              </div>
            )}
            <p className="absolute bottom-3 left-3 rounded-[3px] bg-ink/75 px-2 py-1 text-xs text-fg/80">Illustratie, geen echt product</p>
          </div>
        </div>

        {/* Uitleg bij het gekozen onderdeel */}
        <div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Onderdeel">
            {choices.map((x, i) => (
              <button key={x.name} type="button" className="chip" aria-pressed={part === x.id} onClick={() => (x.id ? zoomTo(x.id) : zoomOut())}>
                <span className="tabular-nums opacity-50">{i + 1}</span> {x.name}
              </button>
            ))}
          </div>
          <div aria-live="polite">
            {p ? (
              <>
                <h4 className="mt-6 text-2xl font-bold">{p.name}</h4>
                <p className="mt-2 max-w-[64ch] text-fg/80">{p.text}</p>
                {p.tech.length > 0 && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {TECH.filter((t) => p.tech.includes(t.name)).map((t) => (
                      <div key={t.name} className="rounded-[var(--radius-control)] border border-panel-2 px-3 py-2.5 text-sm">
                        <p className="font-semibold">{t.name}</p>
                        <p className="mt-0.5 text-fg/70">{t.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-muted">Technieken zoals Bullpadel ze beschrijft; demping en spin zijn claims van het merk.</p>
                {part === "kern" && (
                  <div className="mt-6">
                    <CoreLab />
                  </div>
                )}
                {part === "slagvlak" && (
                  <div className="mt-6">
                    <FaceLab />
                  </div>
                )}
              </>
            ) : (
              <>
                <h4 className="mt-6 text-2xl font-bold">Het hele racket</h4>
                <p className="mt-2 max-w-[64ch] text-fg/80">
                  Een padelracket bestaat uit vijf delen die samen bepalen hoe hij speelt: het slagvlak waar de bal op komt, de kern van rubber of foam daaronder, het frame eromheen, het hart waar de kop overgaat in de grip, en de grip zelf. Kies een onderdeel om in te zoomen.
                </p>
                <ul className="mt-4 grid gap-1.5 text-sm text-fg/75 sm:grid-cols-2">
                  {PARTS.map((x, i) => (
                    <li key={x.id}>
                      <button type="button" onClick={() => zoomTo(x.id)} className="flex w-full items-center gap-3 rounded-[var(--radius-control)] border border-panel-2 px-3 py-2 text-left transition-colors hover:border-fg/40">
                        <span className="grid size-6 place-items-center rounded-full bg-accent text-xs font-bold text-on-accent tabular-nums">{i + 2}</span>
                        {x.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
