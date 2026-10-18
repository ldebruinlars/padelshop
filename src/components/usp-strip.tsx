"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SHOP, euro } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Lijniconen (24x24), getekend met één stroke zodat ze zichzelf kunnen "tekenen".
const ICONS = {
  coach: "M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-7 18c0-3.9 3.1-7 7-7s7 3.1 7 7",
  back: "M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4M12 8v4l3 2",
  truck: "M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  card: "M3 6h18v12H3zM3 10h18M7 15h4",
  home: "M4 11 12 4l8 7v9h-5v-6H9v6H4z",
};

const ITEMS: { icon: keyof typeof ICONS; title: string; text: string }[] = [
  { icon: "coach", title: "Getest door coaches", text: "Elk racket gescoord door All Court Academy" },
  { icon: "back", title: `${euro(SHOP.testPrice)} terug`, text: "Testkosten gaan van je racket af" },
  { icon: "truck", title: `Gratis vanaf ${euro(SHOP.freeShippingFrom)}`, text: `${SHOP.returnDays} dagen bedenktijd` },
  SHOP.payLater
    ? { icon: "card", title: "Achteraf betalen", text: `In 3 termijnen met ${SHOP.payLater}` }
    : { icon: "home", title: "Thuistest", text: `${SHOP.homeTestDays} dagen op je eigen club` },
];

/** USP-strook direct onder de hero: vier beloftes, iconen tekenen zich eenmalig bij binnenkomst. */
export function UspStrip() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const paths = gsap.utils.toArray<SVGPathElement>(".usp-icon path");
        paths.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: 1.1,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Waarom bij ons" className="relative z-10 bg-bg">
      <ul className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px overflow-hidden border-y border-fg/5 bg-fg/5 lg:grid-cols-4">
        {ITEMS.map((it) => (
          <li key={it.title} className="flex items-center gap-4 bg-bg px-5 py-6 lg:px-8">
            <svg viewBox="0 0 24 24" className="usp-icon size-8 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={ICONS[it.icon]} />
            </svg>
            <div>
              <p className="font-semibold leading-tight">{it.title}</p>
              <p className="mt-0.5 text-sm text-muted">{it.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
