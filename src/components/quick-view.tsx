"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { brandName, profile, styleColor, PLAYSTYLES, type CatalogRacket } from "@/lib/catalog";
import { euro } from "@/lib/site";
import { CloseIcon } from "./icons";
import { ProfileBar } from "./racket-card";
import { RacketArt } from "./racket-art";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Snelle weergave van een racket. Opent vanuit de aangeklikte kaart (het paneel groeit uit de kaartpositie),
 * daarna schuiven de specificaties gestaffeld in. Alleen transform en opacity, dus licht voor de browser.
 */
export function QuickView({ racket, from, onClose }: { racket: CatalogRacket | null; from: HTMLElement | null; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useIsoLayoutEffect(() => {
    if (!racket || !panel.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    closeBtn.current?.focus({ preventScroll: true });
    if (reduced) return;
    const p = panel.current.getBoundingClientRect();
    const f = from?.getBoundingClientRect();
    const tl = gsap.timeline();
    tl.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, 0);
    if (f) {
      // Panel start op de plek en maat van de kaart en groeit naar zijn eigen plek
      tl.fromTo(
        panel.current,
        { x: f.left + f.width / 2 - (p.left + p.width / 2), y: f.top + f.height / 2 - (p.top + p.height / 2), scaleX: f.width / p.width, scaleY: f.height / p.height, opacity: 0.6 },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.55, ease: "expo.out" },
        0,
      );
    } else {
      tl.fromTo(panel.current, { y: 30, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "expo.out" }, 0);
    }
    tl.from(panel.current.querySelectorAll(".qv-in"), { y: 16, opacity: 0, duration: 0.45, ease: "power3.out", stagger: 0.04 }, 0.18);
    return () => {
      tl.kill();
    };
  }, [racket, from]);

  useEffect(() => {
    if (!racket) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [racket, onClose]);

  if (!racket) return null;
  const p = profile(racket);
  const color = styleColor(racket.playstyle);
  const specs: [string, string | null][] = [
    ["Vorm", racket.shape],
    ["Gewicht", racket.weight],
    ["Balans", racket.balance],
    ["Kern", racket.core],
    ["Slagvlak", racket.face],
    ["Frame", racket.frame],
    ["Hardheid", racket.feel],
    ["Niveau", racket.level],
    ["Speelstijl", PLAYSTYLES.find((s) => s.id === racket.playstyle)?.label ?? null],
  ];

  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`${brandName(racket.brand)} ${racket.model}`} data-lenis-prevent>
      <div ref={backdrop} className="absolute inset-0 bg-ink/80" onClick={onClose} />
      <div ref={panel} className="relative grid max-h-[92svh] w-full max-w-[980px] origin-center overflow-y-auto rounded-[var(--radius-panel)] border border-fg/10 bg-bg will-change-transform md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative bg-paper p-6 pb-9 md:p-14">
          <div className="mx-auto aspect-[2/3] h-[30svh] md:h-auto md:max-h-none">
            <RacketArt shape={racket.shape} color={color} label={`${racket.model}, productfoto volgt`} />
          </div>
          <p className="absolute bottom-3 left-4 label text-on-accent/70">Illustratie · productfoto volgt</p>
        </div>
        <div className="grid content-start gap-5 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="qv-in label text-accent">{brandName(racket.brand)}</p>
              <h2 className="qv-in mt-2 text-3xl leading-tight font-semibold">{racket.model}</h2>
            </div>
            <button ref={closeBtn} type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-control)] border border-panel-2 hover:border-fg/40" aria-label="Sluiten">
              <CloseIcon className="size-3.5" />
            </button>
          </div>
          {racket.price != null && (
            <p className="qv-in flex items-baseline gap-2">
              <span className="text-3xl font-semibold whitespace-nowrap tabular-nums">{euro(racket.price)}</span>
              {racket.priceNote && <span className="text-sm text-muted">{racket.priceNote}</span>}
            </p>
          )}
          {racket.description && <p className="qv-in text-fg/80">{racket.description}</p>}
          <div className="qv-in grid gap-2">
            <ProfileBar label="Kracht" value={p.power} color="#ff4a4a" />
            <ProfileBar label="Controle" value={p.control} color="#d9a48f" />
            <p className="text-xs text-muted">Profiel berekend uit vorm, balans en hardheid. Geen labtest; voel het verschil zelf in het testcenter.</p>
          </div>
          <dl className="qv-in grid grid-cols-2 gap-x-6 border-t border-fg/10 pt-4 text-sm sm:grid-cols-3">
            {specs
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="border-b border-fg/5 py-2">
                  <dt className="label text-muted">{k}</dt>
                  <dd className="mt-0.5 first-letter:uppercase">{v}</dd>
                </div>
              ))}
          </dl>
          <div className="qv-in flex flex-wrap gap-2">
            <a href="/#testcenter" onClick={onClose} className="btn btn-primary">
              Test dit racket
            </a>
            <a href="/#bezoek" onClick={onClose} className="btn btn-line">
              Bekijk in de winkel
            </a>
          </div>
          {racket.sources.length > 0 && (
            <p className="qv-in text-xs text-muted">
              Specificaties:{" "}
              {racket.sources.slice(0, 2).map((s, i) => (
                <span key={s}>
                  {i > 0 && " · "}
                  <a href={s} target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">
                    {new URL(s).hostname.replace(/^www\./, "")}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
