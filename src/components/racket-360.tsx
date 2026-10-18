"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MEDIA, RACKETS } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SPECS = [
  { k: "Vorm", v: "Diamant" },
  { k: "Gewicht", v: "365 g" },
  { k: "Balans", v: "Hoog, kop-zwaar" },
  { k: "Kern", v: "EVA hard" },
  { k: "Oppervlak", v: "Carbon 18K met 3D-grip" },
];

/**
 * Header 2 "racket draait 360°": vastgepind racket dat meedraait met scrollen.
 * Met turntable-frames (MEDIA.turntable.count > 0) tekenen we een beeldreeks op canvas,
 * anders draait de productfoto in 3D als tijdelijke oplossing.
 */
export function Racket360() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);
  const useFrames = MEDIA.turntable.count > 0;
  const racket = RACKETS[0];

  useEffect(() => {
    if (!useFrames) return;
    frames.current = Array.from({ length: MEDIA.turntable.count }, (_, i) => {
      const img = new Image();
      img.src = MEDIA.turntable.path(i);
      return img;
    });
    frames.current[0].onload = () => draw(0);
  }, [useFrames]);

  function draw(i: number) {
    const c = canvas.current;
    const img = frames.current[i];
    if (!c || !img?.complete) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    c.width = c.clientWidth * dpr;
    c.height = c.clientHeight * dpr;
    const s = Math.min(c.width / img.width, c.height / img.height);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, (c.width - img.width * s) / 2, (c.height - img.height * s) / 2, img.width * s, img.height * s);
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Desktop: vastpinnen en draaien. Mobiel: niet pinnen (het blok is hoger dan het scherm), alleen meedraaien.
      mm.add({ desktop: "(min-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const desktop = ctx.conditions.desktop;
        const tl = gsap.timeline({
          scrollTrigger: desktop
            ? { trigger: root.current, start: "top top", end: "+=220%", scrub: 0.6, pin: true }
            : { trigger: root.current, start: "top 80%", end: "bottom 20%", scrub: 0.6 },
        });
        if (useFrames) {
          const state = { f: 0 };
          tl.to(state, { f: MEDIA.turntable.count - 1, ease: "none", duration: 1, onUpdate: () => draw(Math.round(state.f)) }, 0);
        } else {
          tl.to(".spin", { rotateY: 360, ease: "none", duration: 1 }, 0);
        }
        tl.from(".spec", { x: 40, opacity: 0, stagger: 0.12, duration: 0.2, ease: "power3.out" }, 0.1);
        tl.to(".spin-progress", { scaleX: 1, ease: "none", duration: 1 }, 0);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative grid items-center overflow-hidden py-24 md:h-[100svh] md:py-0 bg-[radial-gradient(circle_at_40%_55%,#1d2f47,#05090f_65%)]">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-5 md:grid-cols-[1fr_1.1fr_0.9fr]">
        <div>
          <p className="eyebrow">Uitgelicht · {racket.style}</p>
          <h2 className="mt-5 text-[clamp(40px,5vw,72px)] leading-[0.95] font-medium">
            {racket.name}. <span className="accent">Draai</span> hem om.
          </h2>
          <p className="mt-5 max-w-sm text-white/70">Scroll en bekijk het racket van alle kanten. Daarna leg je hem bij ons op de baan in je hand.</p>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-[min(420px,70vw)] [perspective:1200px]">
          <div className="absolute inset-[10%] rounded-full bg-lime/10 blur-3xl" />
          {useFrames ? (
            <canvas ref={canvas} className="relative size-full [mask-image:radial-gradient(closest-side,#000_72%,transparent)]" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={racket.image} alt={`${racket.name} padel racket`} className="spin relative size-full object-contain [backface-visibility:visible]" />
          )}
          <div className="absolute inset-x-6 -bottom-6 h-[3px] rounded-full bg-navy-3">
            <div className="spin-progress h-full origin-left scale-x-0 rounded-full bg-lime" />
          </div>
        </div>

        <ul className="grid gap-2">
          {SPECS.map((s) => (
            <li key={s.k} className="spec flex items-baseline justify-between gap-4 rounded-2xl border border-white/5 bg-navy-2/80 px-5 py-4">
              <span className="font-ui text-[11px] font-semibold tracking-[0.14em] text-mist uppercase">{s.k}</span>
              <span className="text-right font-medium">{s.v}</span>
            </li>
          ))}
          <li className="spec mt-2 flex items-center justify-between rounded-2xl bg-lime px-5 py-4 text-navy">
            <span className="font-semibold">€ {racket.price},-</span>
            <span className="font-ui text-[11px] font-semibold tracking-[0.14em] uppercase">Te testen in Almere</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
