"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, useGSAP);

const STEPS = [
  { n: "01", title: "Kies", text: "Doe de racketfinder of blader per speelstijl. Je krijgt drie rackets die bij je spel passen." },
  { n: "02", title: "Test", text: "Speel 45 minuten op een baan bij Poort Padel, met een coach van All Court Academy die meekijkt." },
  { n: "03", title: "Koop", text: "Neem je favoriet direct mee of laat hem thuisbezorgen. De testkosten gaan van de prijs af." },
];

/** Balbaan: een padelbal volgt een lob-boog langs de drie stappen en tekent een stippellijn. */
export function BallPath() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const path = root.current?.querySelector<SVGPathElement>("#lob");
      if (!path) return;
      const len = path.getTotalLength();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".trail", { strokeDasharray: len, strokeDashoffset: len });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 60%", scrub: 1 },
        });
        gsap.set(".ball", { opacity: 0 });
        tl.to(".ball", { opacity: 1, duration: 0.04 }, 0)
          .to(".trail", { strokeDashoffset: 0, ease: "none", duration: 1 }, 0)
          .to(".ball", { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, ease: "none", duration: 1 }, 0);
        gsap.utils.toArray<HTMLElement>(".step").forEach((el, i) => {
          tl.from(el, { y: 40, opacity: 0, duration: 0.15, ease: "power3.out" }, i * 0.33);
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-ink py-28">
      <div className="mx-auto max-w-[1400px] px-5">
        <p className="eyebrow">Zo werkt het</p>
        <h2 className="mt-5 max-w-2xl text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-medium">
          Van twijfel naar <span className="accent">je racket</span>.
        </h2>

        <div className="relative mt-16">
          <svg viewBox="0 0 1200 260" className="pointer-events-none absolute inset-x-0 -top-6 hidden aspect-[1200/260] w-full md:block" aria-hidden="true">
            <path id="lob" d="M60 230 C 240 20, 420 20, 600 200 S 960 20, 1140 230" fill="none" stroke="transparent" />
            <path className="trail" d="M60 230 C 240 20, 420 20, 600 200 S 960 20, 1140 230" fill="none" stroke="#f06a30" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <circle className="ball" r="11" fill="#f06a30" />
          </svg>

          <ol className="relative grid gap-4 pt-[clamp(140px,18vw,240px)] max-md:pt-0 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="step rounded-[var(--radius-card)] border border-fg/5 bg-bg p-7">
                <span className="font-serif text-4xl italic">{s.n}</span>
                <h3 className="mt-4 text-2xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-fg/70">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
