"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { brandName, ratings, styleColor, PLAYSTYLES, type CatalogRacket } from "@/lib/catalog";
import { euro } from "@/lib/site";
import { DELIVERY, isTestRacket } from "@/lib/test-range";
import { ChevronIcon, CloseIcon } from "./icons";
import { ProfileBar } from "./racket-card";
import { RacketArt } from "./racket-art";
import { ownRacket, photoOf } from "@/lib/all-rackets";
import { Model3D } from "./model-3d";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** De afbeelding in de aangeklikte kaart of aan de haak: daar vliegt het racket vandaan en weer naartoe. */
const sourceImg = (from: HTMLElement | null) => from?.querySelector<HTMLElement>(".hang img, .racket-media img, img") ?? null;

/** Verschuiving en schaal om element `el` op de plek en maat van `to` te zetten (FLIP). */
function flipFrom(el: HTMLElement, to: DOMRect) {
  const a = el.getBoundingClientRect();
  return { x: to.left + to.width / 2 - (a.left + a.width / 2), y: to.top + to.height / 2 - (a.top + a.height / 2), scale: to.height / a.height };
}

/**
 * Snelle weergave van een racket. Het racket komt los van de haak (of uit de kaart) en zoomt naar de grote afbeelding,
 * daarna schuiven de specificaties in. Bij sluiten gaat het terug naar zijn plek. Met een lijst kun je swipen,
 * de pijltoetsen gebruiken of de knoppen om naar het vorige of volgende racket te gaan.
 */
export function QuickView({
  racket,
  from,
  onClose,
  list,
  onChange,
}: {
  racket: CatalogRacket | null;
  from: HTMLElement | null;
  onClose: () => void;
  list?: CatalogRacket[];
  onChange?: (r: CatalogRacket) => void;
}) {
  const backdrop = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  // Eigen ontwerpen kun je hier meteen in 3D draaien; bij een ander racket begint hij weer als foto
  const [in3d, setIn3d] = useState<string | null>(null);
  const body = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const openedId = useRef<string | null>(null); // het racket waarmee geopend werd (dat gaat terug naar de haak)
  const shownId = useRef<string | null>(null);
  const dir = useRef(1);
  const closing = useRef(false);

  const index = racket && list ? list.findIndex((r) => r.id === racket.id) : -1;
  const go = useCallback(
    (step: 1 | -1) => {
      if (!list || index < 0 || !onChange) return;
      dir.current = step;
      onChange(list[(index + step + list.length) % list.length]);
    },
    [list, index, onChange],
  );

  // Openen (zoom vanaf de haak) of wisselen naar een ander racket (schuiven)
  useIsoLayoutEffect(() => {
    if (!racket || !art.current) {
      shownId.current = null;
      return;
    }
    const first = shownId.current === null;
    shownId.current = racket.id;
    // Alle inhoud van de dialoog (beide kolommen en de sluitknop) komt pas na de landing in beeld
    const content = art.current.closest("[role=dialog]")?.querySelectorAll(".qv-in") ?? [];
    if (first) {
      openedId.current = racket.id;
      closing.current = false;
      closeBtn.current?.focus({ preventScroll: true });
      const src = sourceImg(from);
      if (reduced()) return;
      if (src) gsap.set(src, { opacity: 0 });
      // Eerst dimt de wand, dan vliegt het racket zichtbaar van de haak naar voren (iets voorbij zijn maat),
      // en pas als het geland is bouwt de snelle weergave zich eromheen op.
      const tl = gsap.timeline();
      tl.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" }, 0);
      gsap.set([bg.current, ...content], { opacity: 0 });
      if (src) {
        const f = flipFrom(art.current, src.getBoundingClientRect());
        tl.fromTo(art.current, { ...f, rotation: -8 }, { x: 0, y: 0, scale: 1.08, rotation: 2, duration: 0.6, ease: "power3.inOut" }, 0.05);
        tl.to(art.current, { scale: 1, rotation: 0, duration: 0.35, ease: "expo.out" }, 0.65);
      } else {
        tl.fromTo(art.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, 0);
      }
      tl.fromTo(bg.current, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" }, src ? 0.5 : 0.1);
      tl.fromTo(content, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.035 }, src ? 0.62 : 0.25);
      return () => {
        tl.kill();
      };
    }
    if (reduced()) return;
    const tl = gsap.timeline();
    tl.fromTo(art.current, { x: 70 * dir.current, opacity: 0, rotation: 4 * dir.current }, { x: 0, opacity: 1, rotation: 0, duration: 0.45, ease: "expo.out" });
    tl.fromTo(content, { opacity: 0, x: 14 * dir.current }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out", stagger: 0.02 }, 0.05);
    return () => {
      tl.kill();
    };
  }, [racket, from]);

  // Sluiten: het racket gaat terug naar de haak, daarna pas echt dicht
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const src = sourceImg(from);
    const done = () => {
      if (src) gsap.set(src, { clearProps: "opacity" });
      onClose();
    };
    if (reduced() || !art.current) return done();
    const tl = gsap.timeline({ onComplete: done });
    tl.to(body.current?.querySelectorAll(".qv-in") ?? [], { opacity: 0, duration: 0.15, ease: "power2.in" }, 0);
    const backHome = src && racket?.id === openedId.current && src.getBoundingClientRect().bottom > 0;
    if (backHome) tl.to(art.current, { ...flipFrom(art.current, src.getBoundingClientRect()), rotation: -6, duration: 0.45, ease: "expo.inOut" }, 0);
    else tl.to(art.current, { opacity: 0, scale: 0.9, duration: 0.25, ease: "power2.in" }, 0);
    tl.to(bg.current, { opacity: 0, scale: 0.98, duration: 0.3, ease: "power2.in" }, 0.05);
    tl.to(backdrop.current, { opacity: 0, duration: 0.3, ease: "power2.in" }, 0.1);
  }, [from, onClose, racket]);

  useEffect(() => {
    if (!racket) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [racket, close, go]);

  // Swipen over de afbeelding: naar het vorige of volgende racket
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onSwipeStart = (e: React.PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onSwipeEnd = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(dx < 0 ? 1 : -1);
  };

  if (!racket) return null;
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
  const canNav = Boolean(list && list.length > 1 && onChange);

  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto overscroll-contain p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`${brandName(racket.brand)} ${racket.model}`} data-lenis-prevent>
      <div ref={backdrop} className="fixed inset-0 bg-ink/85" onClick={close} />
      <div className="relative grid w-full max-w-[1040px] md:grid-cols-[0.9fr_1.1fr]">
        {/* Geen overflow op het paneel: het racket moet er tijdens het zoomen buiten kunnen vliegen. Achtergrond van het paneel apart, zodat het racket er los overheen kan vliegen */}
        <div ref={bg} className="absolute inset-0 overflow-hidden rounded-[var(--radius-panel)] border border-fg/10 bg-bg">
          <div className="h-[calc(30svh+64px)] bg-paper md:absolute md:inset-y-0 md:left-0 md:h-auto md:w-[calc(0.9/2*100%)]" />
        </div>
        <div className="relative touch-pan-y p-6 pb-10 select-none md:p-14" onPointerDown={in3d === racket.id ? undefined : onSwipeStart} onPointerUp={in3d === racket.id ? undefined : onSwipeEnd}>
          <div ref={art} className="mx-auto aspect-[2/3] h-[30svh] will-change-transform md:h-auto">
            {in3d === racket.id && ownRacket(racket.id)?.model3d ? (
              <Model3D key={racket.id} src={ownRacket(racket.id)!.model3d!} poster={photoOf(racket, "groot")!} alt={`${racket.model} in 3D`} autoStart className="size-full" />
            ) : (
              <RacketArt shape={racket.shape} color={color} photo={photoOf(racket, "groot")} label={photoOf(racket) ? racket.model : `Tekening van de ${racket.model}, productfoto volgt`} eager />
            )}
          </div>
          {ownRacket(racket.id)?.model3d && in3d !== racket.id && (
            <button type="button" onClick={() => setIn3d(racket.id)} className="qv-in btn btn-sand btn-sm absolute top-4 right-4 shadow-[0_8px_20px_-8px_rgb(20_17_15/0.6)]">
              Draai in 3D
            </button>
          )}
          <p className="qv-in absolute bottom-3 left-4 label text-on-accent/70">{photoOf(racket) ? "Concept · ook in 3D" : "Illustratie · productfoto volgt"}</p>
          {canNav && (
            <div className="qv-in absolute right-3 bottom-2 flex items-center gap-1 text-on-accent">
              <button type="button" onClick={() => go(-1)} className="grid size-9 place-items-center rounded-[var(--radius-control)] hover:bg-on-accent/10" aria-label="Vorig racket">
                <ChevronIcon className="size-3.5 rotate-180" />
              </button>
              <span className="text-xs tabular-nums">
                {index + 1}/{list!.length}
              </span>
              <button type="button" onClick={() => go(1)} className="grid size-9 place-items-center rounded-[var(--radius-control)] hover:bg-on-accent/10" aria-label="Volgend racket">
                <ChevronIcon className="size-3.5" />
              </button>
            </div>
          )}
        </div>
        <div ref={body} className="relative grid content-start gap-5 p-6 sm:p-8" aria-live="polite">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="qv-in label text-accent">{brandName(racket.brand)}</p>
              <h2 className="qv-in mt-2 text-3xl leading-tight font-bold">{racket.model}</h2>
            </div>
            <button ref={closeBtn} type="button" onClick={close} className="qv-in grid size-10 shrink-0 place-items-center rounded-[var(--radius-control)] border border-panel-2 hover:border-fg/40" aria-label="Sluiten">
              <CloseIcon className="size-3.5" />
            </button>
          </div>
          {racket.price != null ? (
            <p className="qv-in flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-3xl font-bold whitespace-nowrap tabular-nums">{euro(racket.price)}</span>
              <span className="text-sm text-muted">adviesprijs</span>
              {isTestRacket(racket.id) && <span className="rounded-[var(--radius-control)] bg-accent px-2.5 py-0.5 label text-on-accent">Testracket</span>}
            </p>
          ) : (
            racket.priceNote && <p className="qv-in text-sm font-semibold text-accent">{racket.priceNote}</p>
          )}
          {racket.price != null && <p className="qv-in -mt-3 text-sm text-fg/70">{DELIVERY}</p>}
          {racket.description && <p className="qv-in text-fg/80">{racket.description}</p>}
          <div className="qv-in grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {ratings(racket).map((x) => (
              <div key={x.id} title={x.hint}>
                <ProfileBar label={x.label} value={x.value} color={x.color} wide />
              </div>
            ))}
            <p className="text-xs text-muted sm:col-span-2">Racket Lab-schatting op basis van vorm, balans, gewicht, kern en slagvlak. Geen labtest; voel het verschil zelf in het testcenter.</p>
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
            <a href={`/rackets/${racket.id}/`} className="btn btn-primary">
              {photoOf(racket) ? "Bekijk in 3D" : "Bekijk en reserveer"}
            </a>
            <a href="/#testcenter" onClick={onClose} className="btn btn-line">
              Test dit racket
            </a>
            <a
              href={`/?opbouw=${racket.id}#anatomie`}
              onClick={(e) => {
                // Op de homepage: direct naar de opbouw van dit racket, zonder de pagina te herladen
                if (!document.getElementById("anatomie")) return;
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("racketlab:opbouw", { detail: racket.id }));
                onClose();
              }}
              className="btn btn-line"
            >
              Bekijk de opbouw
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
