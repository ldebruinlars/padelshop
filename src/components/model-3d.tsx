"use client";

import { createElement, useEffect, useRef, useState } from "react";

/**
 * 3D-weergave van een racket (GLB) met Google model-viewer: slepen om te draaien, knijpen om te zoomen,
 * op telefoons "Bekijk in je kamer" (AR). De viewer (three.js) laadt pas als het blok in beeld komt of
 * als iemand op "Draai in 3D" klikt, zodat de pagina zelf licht blijft.
 */
export function Model3D({ src, poster, alt, autoStart = false, className = "" }: { src: string; poster: string; alt: string; autoStart?: boolean; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!autoStart || !box.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, [autoStart]);

  useEffect(() => {
    if (!active) return;
    import("@google/model-viewer").then(() => setReady(true));
  }, [active]);

  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div ref={box} className={`relative ${className}`}>
      {ready ? (
        createElement("model-viewer", {
          src,
          poster,
          alt,
          "camera-controls": true,
          "touch-action": "pan-y",
          "auto-rotate": reduced ? undefined : true,
          "auto-rotate-delay": 0,
          "rotation-per-second": "18deg",
          "interaction-prompt": "none",
          "shadow-intensity": "0.8",
          "shadow-softness": "0.9",
          exposure: "1.05",
          "environment-image": "neutral",
          ar: true,
          "ar-modes": "webxr scene-viewer quick-look",
          "camera-orbit": "20deg 80deg auto",
          style: { width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent" },
        })
      ) : (
        <button type="button" onClick={() => setActive(true)} className="group relative block size-full" aria-label={`${alt} in 3D draaien`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" className="size-full object-contain" />
          <span className="btn btn-sand btn-sm absolute bottom-3 left-1/2 -translate-x-1/2 shadow-[0_8px_20px_-8px_rgb(20_17_15/0.6)]">{active ? "3D laden…" : "Draai in 3D"}</span>
        </button>
      )}
    </div>
  );
}
