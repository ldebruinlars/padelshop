"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** "Panelen die opengaan": een afgerond paneel opent vanuit het midden zodra het in beeld scrolt. */
export function RevealPanel({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Schalen in plaats van clip-path: transform laat de grafische kaart het werk doen,
        // clip-path moest het hele paneel elk scrollframe opnieuw tekenen.
        gsap.fromTo(
          root.current,
          { scale: 0.9, opacity: 0.4 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            // Eindigt al op 60%, zodat ook de footer onderaan de pagina helemaal opengaat.
            scrollTrigger: { trigger: root.current, start: "top 100%", end: "top 60%", scrub: 0.5 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div className="px-[max(10px,env(safe-area-inset-left))]">
      <div ref={root} id={id} className={`overflow-hidden rounded-[var(--radius-panel)] will-change-transform ${className}`}>
        {children}
      </div>
    </div>
  );
}
