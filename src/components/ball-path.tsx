"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";
import { SHOP, euro } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, useGSAP);

const STEPS = [
  { n: "01", title: "Kies", text: "Doe de racketfinder of filter op niveau en speelstijl. Je krijgt drie rackets die bij je spel passen." },
  { n: "02", title: "Test", text: "Speel 45 minuten op een baan bij Poort Padel, met een coach van All Court Academy die meekijkt." },
  { n: "03", title: "Koop", text: `Neem je favoriet direct mee of laat hem bezorgen. De ${euro(SHOP.testPrice)} testkosten gaan van de prijs af.` },
];

// Padelbaan van bovenaf, 20 x 10 m op schaal (1 m = 50 eenheden). Servicelijnen op 6,95 m van het net.
const W = 1000;
const H = 500;
const SERVICE = 347.5;
// Rally: service links, drie stuiters afwisselend over het net. Bogen omhoog suggereren hoogte op de gekantelde baan.
const BOUNCES = [
  { x: 690, y: 330 },
  { x: 300, y: 150 },
  { x: 770, y: 175 },
];
const RALLY = `M 70 410 C 250 120, 520 120, ${BOUNCES[0].x} ${BOUNCES[0].y} C 610 60, 420 0, ${BOUNCES[1].x} ${BOUNCES[1].y} C 420 -40, 640 -20, ${BOUNCES[2].x} ${BOUNCES[2].y}`;

/** Zo werkt het: een padelbaan tekent zich op scroll, de bal speelt een rally en elke stuit licht een stap op. */
export function BallPath() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const path = el?.querySelector<SVGPathElement>("#rally");
      if (!el || !path) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = gsap.utils.toArray<SVGGeometryElement>(".court-line");
        lines.forEach((l) => {
          const len = l.getTotalLength();
          gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
        });
        const trailLen = path.getTotalLength();
        gsap.set(".trail", { strokeDasharray: trailLen, strokeDashoffset: trailLen });
        gsap.set(".ball", { opacity: 0 });
        gsap.set(".bounce", { scale: 0, transformOrigin: "50% 50%" });
        el.querySelectorAll<HTMLElement>(".step").forEach((s) => s.classList.remove("is-on"));

        // Eerst de baan
        gsap.to(lines, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 75%", once: true } });

        // Dan de rally, gekoppeld aan scroll
        const steps = el.querySelectorAll<HTMLElement>(".step");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 55%",
            end: "bottom 70%",
            scrub: 1,
            onUpdate: (st) => steps.forEach((s, i) => s.classList.toggle("is-on", st.progress >= (i + 1) / 3 - 0.02)),
          },
        });
        tl.to(".ball", { opacity: 1, duration: 0.03 }, 0)
          .to(".trail", { strokeDashoffset: 0, ease: "none", duration: 1 }, 0)
          .to(".ball", { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, ease: "none", duration: 1 }, 0);
        gsap.utils.toArray<SVGElement>(".bounce").forEach((b, i) => {
          tl.to(b, { scale: 1, duration: 0.06, ease: "back.out(3)" }, (i + 1) / 3 - 0.04);
        });
      });
      // Zonder animatie: alles meteen zichtbaar en alle stappen aan
      mm.add("(prefers-reduced-motion: reduce)", () => {
        el.querySelectorAll<HTMLElement>(".step").forEach((s) => s.classList.add("is-on"));
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-bg py-24">
      <div className="mx-auto max-w-[1400px] px-5">
        <p className="eyebrow">Zo werkt het</p>
        <h2 className="mt-5 max-w-2xl text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-medium">
          Van twijfel naar <span className="accent">je racket</span>.
        </h2>

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
        {/* Baan recht van bovenaf (geen 3D-kanteling): rustiger en goedkoper om te tekenen */}
        <div aria-hidden="true">
          <svg viewBox={`-20 -60 ${W + 40} ${H + 80}`} className="w-full overflow-visible">
            <rect x="0" y="0" width={W} height={H} rx="6" fill="#2c241f" fillOpacity="0.55" />
            <g fill="none" stroke="#f6efe6" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round">
              <rect className="court-line" x="0" y="0" width={W} height={H} rx="6" />
              <line className="court-line" x1={W / 2 - SERVICE} y1="0" x2={W / 2 - SERVICE} y2={H} />
              <line className="court-line" x1={W / 2 + SERVICE} y1="0" x2={W / 2 + SERVICE} y2={H} />
              <line className="court-line" x1={W / 2 - SERVICE} y1={H / 2} x2={W / 2 + SERVICE} y2={H / 2} />
            </g>
            <line className="court-line" x1={W / 2} y1="-8" x2={W / 2} y2={H + 8} stroke="#f6efe6" strokeWidth="7" strokeLinecap="round" />
            <path id="rally" d={RALLY} fill="none" stroke="transparent" />
            <path className="trail" d={RALLY} fill="none" stroke="#f06a30" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 10" opacity="0.8" />
            {BOUNCES.map((b) => (
              <circle key={b.x} className="bounce" cx={b.x} cy={b.y} r="22" fill="none" stroke="#f06a30" strokeWidth="3" />
            ))}
            <circle className="ball" r="13" fill="#f06a30" />
          </svg>
        </div>

        <ol className="grid gap-3">
          {STEPS.map((s) => (
            <li key={s.n} className="step group grid grid-cols-[auto_1fr] gap-x-5 rounded-[var(--radius-card)] border border-fg/5 bg-panel p-6 transition-colors duration-500 [&.is-on]:border-accent/50">
              <span className="row-span-2 font-serif text-4xl text-muted italic transition-colors duration-500 group-[.is-on]:text-accent">{s.n}</span>
              <h3 className="text-2xl font-semibold">{s.title}</h3>
              <p className="mt-1 text-fg/70">{s.text}</p>
            </li>
          ))}
        </ol>
        </div>
      </div>
    </section>
  );
}
