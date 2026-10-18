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
        gsap.fromTo(
          root.current,
          { clipPath: "inset(12% 18% 12% 18% round 120px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 28px)",
            ease: "none",
            // Eindigt al op 60%, zodat ook de footer onderaan de pagina helemaal opengaat.
            scrollTrigger: { trigger: root.current, start: "top 100%", end: "top 60%", scrub: 1 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div className="px-[max(10px,env(safe-area-inset-left))]">
      <div ref={root} id={id} className={`overflow-hidden rounded-[var(--radius-panel)] ${className}`}>
        {children}
      </div>
    </div>
  );
}
