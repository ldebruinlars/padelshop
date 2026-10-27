"use client";

import { createElement, useEffect, useRef, useState } from "react";

type Viewer = HTMLElement & {
  getCameraOrbit: () => { theta: number; phi: number; radius: number };
  cameraOrbit: string;
  autoRotate: boolean;
};

const VIEWS = [
  { label: "Voor", orbit: "0deg 85deg auto" },
  { label: "Zijkant", orbit: "90deg 85deg auto" },
  { label: "Achter", orbit: "180deg 85deg auto" },
];

/**
 * 3D-weergave van een racket (GLB) met Google model-viewer. De viewer (three.js, zo'n 1,5 MB met model) laadt pas
 * bij een klik op "Draai in 3D", of bij autoStart zodra het blok in beeld komt.
 * Scrollen boven het model scrolt gewoon de pagina; pas na een klik op het model zoomt het scrollwiel in en uit
 * (tot je de muis van het model haalt). Knoppen voor zoomen, vaste aanzichten en volledig scherm.
 */
export function Model3D({ src, poster, alt, autoStart = false, onStart, className = "" }: { src: string; poster: string; alt: string; autoStart?: boolean; onStart?: () => void; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const viewer = useRef<Viewer | null>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [zoomable, setZoomable] = useState(false);
  const [full, setFull] = useState(false);

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

  useEffect(() => {
    const onFs = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canZoom = zoomable || full;

  const stopSpin = () => {
    if (viewer.current) viewer.current.autoRotate = false;
  };
  const zoom = (f: number) => {
    const v = viewer.current;
    if (!v) return;
    stopSpin();
    const o = v.getCameraOrbit();
    v.cameraOrbit = `${o.theta}rad ${o.phi}rad ${Math.max(0.2, o.radius * f)}m`;
  };
  const view = (orbit: string) => {
    if (!viewer.current) return;
    stopSpin();
    viewer.current.cameraOrbit = orbit;
  };

  return (
    <div
      ref={box}
      className={`relative ${full ? "bg-paper" : ""} ${className}`}
      // Na een klik op het model is scrollen zoomen; Lenis laat de pagina dan met rust
      data-lenis-prevent={canZoom || undefined}
      onPointerDown={() => ready && setZoomable(true)}
      onPointerLeave={() => setZoomable(false)}
    >
      {ready ? (
        <>
          {createElement("model-viewer", {
            ref: (el: Viewer | null) => {
              viewer.current = el;
            },
            src,
            poster,
            alt,
            "camera-controls": true,
            "disable-zoom": canZoom ? undefined : true,
            "touch-action": "pan-y",
            "auto-rotate": reduced ? undefined : true,
            "auto-rotate-delay": 0,
            "rotation-per-second": "18deg",
            "interaction-prompt": "none",
            "min-camera-orbit": "auto 10deg 0.2m",
            "max-camera-orbit": "auto 170deg auto",
            "min-field-of-view": "8deg",
            "shadow-intensity": "0.8",
            "shadow-softness": "0.9",
            "tone-mapping": "neutral",
            exposure: "1.05",
            "environment-image": "neutral",
            ar: true,
            "ar-modes": "webxr scene-viewer quick-look",
            "camera-orbit": "20deg 80deg auto",
            style: { width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent" },
          })}
          {/* Bediening: aanzichten links, zoom en volledig scherm rechts */}
          <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-end justify-between gap-2">
            <div className="pointer-events-auto flex gap-1 rounded-[var(--radius-control)] bg-bg/85 p-1 text-fg shadow-[0_6px_16px_-8px_rgb(20_17_15/0.6)]">
              {VIEWS.map((v) => (
                <button key={v.label} type="button" onClick={() => view(v.orbit)} className="rounded-[4px] px-2.5 py-1.5 text-xs font-semibold hover:bg-panel">
                  {v.label}
                </button>
              ))}
            </div>
            <div className="pointer-events-auto flex gap-1 rounded-[var(--radius-control)] bg-bg/85 p-1 text-fg shadow-[0_6px_16px_-8px_rgb(20_17_15/0.6)]">
              <button type="button" onClick={() => zoom(0.75)} className="grid size-8 place-items-center rounded-[4px] text-lg leading-none hover:bg-panel" aria-label="Inzoomen">
                +
              </button>
              <button type="button" onClick={() => zoom(1.33)} className="grid size-8 place-items-center rounded-[4px] text-lg leading-none hover:bg-panel" aria-label="Uitzoomen">
                −
              </button>
              <button
                type="button"
                onClick={() => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen?.())}
                className="grid size-8 place-items-center rounded-[4px] hover:bg-panel"
                aria-label={full ? "Volledig scherm sluiten" : "Volledig scherm"}
              >
                <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  {full ? <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" /> : <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />}
                </svg>
              </button>
            </div>
          </div>
          {!canZoom && <p className="pointer-events-none absolute top-3 right-3 rounded-[4px] bg-bg/80 px-2 py-1 text-[11px] text-fg/80 max-sm:hidden">Klik op het racket om met scrollen te zoomen</p>}
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            setActive(true);
            onStart?.();
          }}
          // Alvast beginnen met laden als iemand de knop aanwijst
          onPointerEnter={() => import("@google/model-viewer")}
          className="group relative block size-full"
          aria-label={`${alt} in 3D draaien`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" className="size-full object-contain" />
          <span className="btn btn-sand btn-sm absolute bottom-3 left-1/2 -translate-x-1/2 shadow-[0_8px_20px_-8px_rgb(20_17_15/0.6)]">{active ? "3D laden…" : "Draai in 3D"}</span>
        </button>
      )}
    </div>
  );
}
