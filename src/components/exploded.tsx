"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MEDIA } from "@/lib/site";

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

const holes = "radial-gradient(circle, #0b1420 3px, transparent 3.6px) 0 0 / 22px 22px";

/** Racket valt in lagen uit elkaar tijdens scrollen; elke laag is een klikbare technologie-hotspot. */
export function Exploded() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>("face");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=160%", scrub: 1, pin: true },
        });
        tl.from(".stack", { rotateX: 0, rotateZ: 0, duration: 0.4, ease: "power2.inOut" })
          .to(".layer-face", { z: 150, duration: 0.6, ease: "power2.out" }, 0.35)
          .to(".layer-frame", { z: -150, duration: 0.6, ease: "power2.out" }, 0.35)
          .from(".hotspot", { opacity: 0, x: 30, stagger: 0.1, duration: 0.3 }, 0.6);
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
    <section ref={root} className="relative grid min-h-[100svh] items-center overflow-hidden bg-navy py-20">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative mx-auto grid aspect-square w-[min(560px,88vw)] place-items-center [perspective:1400px]">
          <div className="stack relative h-[62%] w-[48%] [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-28deg)]">
            <div
              className="layer-frame racket-head absolute inset-0 border-[10px] border-[#2a3a52] shadow-[0_0_0_2px_#ccff00,0_0_40px_rgba(204,255,0,0.25)]"
              style={{ background: "#0b1420" }}
            />
            <div className="layer-core racket-head absolute inset-[10px]" style={{ background: `${holes}, linear-gradient(160deg,#f4f1e6,#d9d2bb)` }} />
            <div
              className="layer-face racket-head absolute inset-[6px] shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
              style={{ background: `${holes}, url(${MEDIA.carbonMacro}) center/cover, repeating-linear-gradient(45deg,#1b1f26 0 4px,#2b313b 4px 8px)` }}
            />
          </div>
        </div>

        <div>
          <p className="eyebrow">Wat zit er in een racket?</p>
          <h2 className="mt-5 text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-medium">
            Drie lagen, <span className="accent">één</span> gevoel.
          </h2>
          <p className="mt-5 max-w-md text-white/70">Elk racket is opgebouwd uit dezelfde drie lagen. De keuzes per laag bepalen hoe hij speelt. Klik op een laag.</p>

          <div className="mt-8 grid gap-2" role="tablist" aria-label="Lagen van het racket">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={active === l.id}
                onClick={() => setActive(l.id)}
                className={`hotspot flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
                  active === l.id ? "border-lime bg-navy-2" : "border-white/5 bg-navy-2/50 hover:border-white/20"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${active === l.id ? "bg-lime text-navy" : "bg-navy-3 text-mist"}`}>+</span>
                  <span className="text-lg font-semibold">{l.name}</span>
                </span>
                <span className="text-right font-ui text-[11px] font-semibold tracking-[0.1em] text-mist uppercase">{l.spec}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 min-h-[5lh] rounded-2xl bg-ink/40 p-5 text-white/80" role="tabpanel">
            {current.text}
          </p>
        </div>
      </div>
    </section>
  );
}
