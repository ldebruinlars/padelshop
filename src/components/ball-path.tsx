"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SHOP, euro } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Padelbaan van bovenaf op schaal: 20 x 10 m, 1 m = 50 eenheden. Servicelijnen op 6,95 m van het net.
const W = 1000;
const H = 500;
const SERVICE = 347.5;

// Drie plekken op de baan: kiezen achterin, testen aan het net, kopen aan de overkant.
const STATIONS = [
  { x: 120, y: 360, title: "Kies", text: "Doe de racketfinder of filter op merk, vorm en hardheid. Je komt uit op drie rackets die bij je spel passen." },
  { x: 430, y: 150, title: "Test", text: "Speel 45 minuten op een baan bij Poort Padel. Een coach kijkt mee en wisselt de rackets met je af." },
  { x: 860, y: 300, title: "Koop", text: `Neem je favoriet direct mee of laat hem bezorgen. De ${euro(SHOP.testPrice)} testkosten gaan van de prijs af.` },
];
const ARC = [170, 210]; // hoogte van de boog per slag, in eenheden

/** Positie van de bal (in de lucht) en zijn schaduw (op de baan) bij voortgang p van 0 tot 1. */
function ballAt(p: number) {
  const seg = Math.min(1.999, Math.max(0, p * 2));
  const i = Math.floor(seg);
  const t = seg - i;
  const a = STATIONS[i];
  const b = STATIONS[i + 1];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, h: Math.sin(Math.PI * t) * ARC[i] };
}

/**
 * Zo werkt een racket-test. De bal speelt van Kies naar Test naar Koop terwijl je scrolt, met een schaduw op de
 * baan die laat zien hoe hoog hij is. Bij elke landing licht de stap op en loopt de lijn ernaast vol.
 */
export function BallPath() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const ball = el.querySelector<SVGGElement>(".ball");
      const shadow = el.querySelector<SVGEllipseElement>(".ball-shadow");
      const trail = el.querySelector<SVGPathElement>(".trail");
      const steps = gsap.utils.toArray<HTMLElement>(".step", el);
      const fills = gsap.utils.toArray<HTMLElement>(".step-fill", el);
      const rings = gsap.utils.toArray<SVGCircleElement>(".ring", el);
      if (!ball || !shadow || !trail) return;

      // Het spoor van de bal als één pad, zodat het kan meetekenen
      const pts = Array.from({ length: 81 }, (_, k) => ballAt(k / 80));
      trail.setAttribute("d", pts.map((q, k) => `${k ? "L" : "M"}${q.x.toFixed(1)} ${(q.y - q.h).toFixed(1)}`).join(" "));
      const len = trail.getTotalLength();

      const render = (p: number) => {
        const q = ballAt(p);
        ball.setAttribute("transform", `translate(${q.x} ${q.y - q.h})`);
        const lift = q.h / 210;
        shadow.setAttribute("cx", String(q.x));
        shadow.setAttribute("cy", String(q.y + 6));
        shadow.setAttribute("rx", String(16 - lift * 7));
        shadow.setAttribute("opacity", String(0.45 - lift * 0.3));
        trail.style.strokeDasharray = String(len);
        trail.style.strokeDashoffset = String(len * (1 - p));
        // Stap i is actief zodra de bal bij station i is; de lijn ernaast loopt vol tot het volgende station
        const at = p * 2;
        steps.forEach((s, i) => s.classList.toggle("is-on", at >= i - 0.02));
        fills.forEach((f, i) => gsap.set(f, { scaleY: Math.min(1, Math.max(0, at - i)) }));
      };

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = gsap.utils.toArray<SVGGeometryElement>(".court-line", el);
        lines.forEach((l) => gsap.set(l, { strokeDasharray: l.getTotalLength(), strokeDashoffset: l.getTotalLength() }));
        gsap.to(lines, { strokeDashoffset: 0, duration: 0.9, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: el, start: "top 80%", once: true } });
        render(0);
        let landed = 0;
        ScrollTrigger.create({
          trigger: el.querySelector(".court"),
          start: "top 70%",
          end: "bottom 35%",
          scrub: 0.5,
          onUpdate: (st) => {
            render(st.progress);
            // Een ring bij elke landing
            const now = Math.floor(st.progress * 2 + 0.02);
            if (now > landed && rings[now]) gsap.fromTo(rings[now], { attr: { r: 8 }, opacity: 0.9 }, { attr: { r: 46 }, opacity: 0, duration: 0.7, ease: "expo.out" });
            landed = now;
          },
        });
      });
      // Zonder animatie: bal aan het eind, alle stappen aan
      mm.add("(prefers-reduced-motion: reduce)", () => render(1));
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="zo-werkt-titel" className="relative overflow-hidden bg-bg py-24">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-panel-2 pb-6">
          <h2 id="zo-werkt-titel" className="text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">
            Zo werkt een racket-test
          </h2>
          <p className="max-w-[46ch] text-fg/75">Drie stappen, één middag. De testkosten krijg je terug als je een racket koopt.</p>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
          <div className="court" aria-hidden="true">
            <svg viewBox={`-30 -230 ${W + 60} ${H + 270}`} className="w-full overflow-visible">
              {/* Glas rondom en de baan */}
              <rect x="-14" y="-14" width={W + 28} height={H + 28} rx="4" fill="none" stroke="#3a312b" strokeWidth="3" />
              <rect x="0" y="0" width={W} height={H} fill="#201a16" />
              <g fill="none" stroke="#f6efe6" strokeOpacity="0.7" strokeWidth="2.5">
                <rect className="court-line" x="0" y="0" width={W} height={H} />
                <line className="court-line" x1={W / 2 - SERVICE} y1="0" x2={W / 2 - SERVICE} y2={H} />
                <line className="court-line" x1={W / 2 + SERVICE} y1="0" x2={W / 2 + SERVICE} y2={H} />
                <line className="court-line" x1={W / 2 - SERVICE} y1={H / 2} x2={W / 2 + SERVICE} y2={H / 2} />
              </g>
              {/* Net met palen */}
              <line className="court-line" x1={W / 2} y1="-6" x2={W / 2} y2={H + 6} stroke="#f6efe6" strokeWidth="6" />
              <circle cx={W / 2} cy="-8" r="6" fill="#f6efe6" />
              <circle cx={W / 2} cy={H + 8} r="6" fill="#f6efe6" />

              <path className="trail" fill="none" stroke="#f06a30" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.85" />

              {STATIONS.map((s, i) => (
                <g key={s.title}>
                  <circle className="ring" cx={s.x} cy={s.y} r="8" fill="none" stroke="#f06a30" strokeWidth="3" opacity="0" />
                  <circle cx={s.x} cy={s.y} r="7" fill="#f06a30" />
                  <g transform={`translate(${s.x + (i === 2 ? -150 : 18)} ${s.y + 14})`}>
                    <rect width="132" height="44" rx="3" fill="#14110f" stroke="#2c241f" />
                    <text x="14" y="30" fill="#f6efe6" fontSize="22" fontWeight="700" style={{ fontFamily: "var(--font-archivo)" }}>
                      {s.title}
                    </text>
                  </g>
                </g>
              ))}

              <ellipse className="ball-shadow" cx={STATIONS[0].x} cy={STATIONS[0].y + 6} rx="16" ry="6" fill="#0c0a09" opacity="0.45" />
              <g className="ball" transform={`translate(${STATIONS[0].x} ${STATIONS[0].y})`}>
                <circle r="14" fill="#e3e86a" />
                <path d="M-10 -9c6 5 6 13 0 18M10 -9c-6 5-6 13 0 18" fill="none" stroke="#f6f7e0" strokeWidth="2" />
              </g>
            </svg>
          </div>

          <ol className="grid">
            {STATIONS.map((s) => (
              <li key={s.title} className="step group relative grid grid-cols-[3px_1fr] gap-x-5 py-5">
                {/* Lijn die volloopt als de bal onderweg is naar de volgende stap */}
                <span className="relative row-span-2 overflow-hidden rounded-full bg-panel-2">
                  <span className="step-fill absolute inset-0 origin-top scale-y-0 bg-accent" />
                </span>
                <h3 className="font-display text-[clamp(28px,2.6vw,40px)] leading-none font-bold text-fg/45 transition-colors duration-300 [font-stretch:80%] group-[.is-on]:text-fg">
                  {s.title}
                </h3>
                <p className="mt-2 max-w-[48ch] text-fg/60 transition-colors duration-300 group-[.is-on]:text-fg/85">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
