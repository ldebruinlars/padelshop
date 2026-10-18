"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LAYERS = [
  {
    id: "face",
    name: "Oppervlak",
    spec: "Carbon 3K tot 18K, met 3D-grip",
    text: "Hoe hoger het K-getal, hoe stijver het carbon: meer power, minder gevoel. De ruwe grip geeft extra spin op je vibora en bandeja.",
  },
  {
    id: "core",
    name: "Kern",
    spec: "EVA soft, medium of hard · foam",
    text: "Zachte EVA of foam geeft comfort en een makkelijke uitgang van de bal. Harde EVA geeft controle en power bij harde slagen, maar vraagt meer van je arm.",
  },
  {
    id: "frame",
    name: "Frame",
    spec: "Buisvormig carbon, met of zonder gewichtssysteem",
    text: "Het frame bepaalt balans en stabiliteit. Sommige rackets hebben schroeven of plaatjes om het gewicht naar de kop of de grip te verplaatsen.",
  },
];

const holes = "radial-gradient(circle, #14110f 3px, transparent 3.6px) 0 0 / 22px 22px";

/** Racket valt in lagen uit elkaar tijdens scrollen; elke laag is een klikbare technologie-hotspot. */
export function Exploded() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>("face");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Niet vastpinnen: de lagen gaan uit elkaar terwijl je gewoon doorscrolt.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 80%", end: "center 45%", scrub: 1 },
        });
        tl.from(".stack", { rotateX: 0, rotateZ: 0, duration: 0.4, ease: "power2.inOut" })
          .to(".layer-face", { z: 150, duration: 0.6, ease: "power2.out" }, 0.35)
          .to(".layer-frame", { z: -150, duration: 0.6, ease: "power2.out" }, 0.35);

        // Labels en knoppen springen vanzelf in beeld, zoals de stappen 01 / 02 / 03
        gsap.from(".layer-label", {
          opacity: 0,
          x: -20,
          stagger: 0.15,
          duration: 0.6,
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: ".stack", start: "top 60%", toggleActions: "play none none reverse" },
        });
        gsap.from(".hotspot", {
          opacity: 0,
          y: 30,
          stagger: 0.12,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: ".hotspot-list", start: "top 85%", toggleActions: "play none none reverse" },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".layer-face", { z: 150 });
        gsap.set(".layer-frame", { z: -150 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const current = LAYERS.find((l) => l.id === active)!;

  return (
    <section ref={root} className="relative grid items-center overflow-hidden bg-bg py-28">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative mx-auto grid aspect-square w-[min(560px,88vw)] place-items-center [perspective:1400px]">
          <div className="stack relative h-[62%] w-[48%] [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-28deg)]">
            <div
              className="layer-frame racket-head absolute inset-0 border-[10px] border-[#3a2f28] shadow-[0_0_0_2px_#f06a30,0_0_40px_rgba(240,106,48,0.25)]"
              style={{ background: "#14110f" }}
            />
            <div className="layer-core racket-head absolute inset-[10px]" style={{ background: `${holes}, linear-gradient(160deg,#f4f1e6,#d9d2bb)` }} />
            <div
              className="layer-face racket-head absolute inset-[6px] shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
              style={{
                background: `${holes}, linear-gradient(115deg,transparent 40%,rgba(240,106,48,0.18) 50%,transparent 60%), repeating-linear-gradient(45deg,#1c1917 0 4px,#2b2622 4px 8px), repeating-linear-gradient(-45deg,transparent 0 4px,rgba(255,255,255,0.03) 4px 8px)`,
              }}
            />
          </div>
          {/* Labels naast de lagen */}
          <ul className="pointer-events-none absolute top-[12%] right-0 bottom-[12%] flex flex-col justify-between font-ui text-[11px] font-semibold tracking-[0.14em] uppercase">
            {LAYERS.map((l) => (
              <li key={l.id} className={`layer-label flex items-center gap-2 ${active === l.id ? "text-accent" : "text-muted"}`}>
                <span className="h-px w-8 bg-current" />
                {l.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Wat zit er in een racket?</p>
          <h2 className="mt-5 text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-medium">
            Drie lagen, <span className="accent">één</span> gevoel.
          </h2>
          <p className="mt-5 max-w-md text-fg/70">Elk racket is opgebouwd uit dezelfde drie lagen. De keuzes per laag bepalen hoe hij speelt. Klik op een laag.</p>

          <div className="hotspot-list mt-8 grid gap-2" role="group" aria-label="Lagen van het racket">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={active === l.id}
                aria-controls="laag-uitleg"
                onClick={() => setActive(l.id)}
                className={`hotspot flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
                  active === l.id ? "border-accent bg-panel" : "border-fg/5 bg-panel/50 hover:border-fg/20"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${active === l.id ? "bg-accent text-on-accent" : "bg-panel-2 text-muted"}`}>+</span>
                  <span className="text-lg font-semibold">{l.name}</span>
                </span>
                <span className="text-right font-ui text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">{l.spec}</span>
              </button>
            ))}
          </div>
          <p id="laag-uitleg" aria-live="polite" className="mt-4 min-h-[4lh] rounded-2xl bg-ink/40 p-5 text-fg/80">
            {current.text}
          </p>
        </div>
      </div>
    </section>
  );
}
