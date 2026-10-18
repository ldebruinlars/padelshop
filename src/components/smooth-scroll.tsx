"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Koppelt Lenis aan de GSAP-ticker. Draait binnen <ReactLenis>, zodat `useLenis`
 * pas een instance teruggeeft als Lenis echt bestaat (een ref is bij de eerste effect-run nog leeg,
 * en met autoRaf: false bleef het wiel dan hangen).
 */
function GsapBridge() {
  const lenis = useLenis(ScrollTrigger.update);

  useEffect(() => {
    if (!lenis) return;
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.1, anchors: true }}>
      <GsapBridge />
      {children}
    </ReactLenis>
  );
}
