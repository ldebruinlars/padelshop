"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CATALOG_RACKETS, PLAYSTYLES, SHAPES, type CatalogRacket, type Playstyle, type Shape } from "@/lib/catalog";
import { ArrowIcon } from "./icons";
import { QuickView } from "./quick-view";
import { RacketCard } from "./racket-card";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Rackets: tabs en speelstijl-filter, veegbare rij lichte productkaarten, en een vergelijker. */
export function Collection() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Shape | "">("");
  const [style, setStyle] = useState<Playstyle | null>(null);
  const [open, setOpen] = useState<{ r: CatalogRacket; from: HTMLElement } | null>(null);

  // Op de homepage maximaal twaalf: om en om per merk, met per merk een andere speelstijl voorop; de rest staat op /rackets/
  const all = CATALOG_RACKETS.filter((r) => (!tab || r.shape === tab) && (!style || r.playstyle === style));
  const perBrand = [...new Set(all.map((r) => r.brand))].map((b, i) => {
    const own = all.filter((r) => r.brand === b);
    return [...own.slice(i % own.length), ...own.slice(0, i % own.length)];
  });
  const longest = Math.max(0, ...perBrand.map((o) => o.length));
  const list = Array.from({ length: longest }, (_, rank) => perBrand.map((own) => own[rank]).filter(Boolean)).flat().slice(0, 12);

  // Kaarten en balken animeren bij binnenkomst, en opnieuw na het wisselen van filter.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".racket-card", { y: 48, opacity: 0, duration: 0.6, ease: "back.out(1.4)", stagger: 0.06, clearProps: "transform", scrollTrigger: { trigger: track.current, start: "top 85%", once: true } });
        gsap.from(".bar-fill", { scaleX: 0, duration: 1, ease: "power2.out", stagger: 0.03, scrollTrigger: { trigger: track.current, start: "top 75%", once: true } });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [tab, style], revertOnUpdate: true },
  );

  // Slepen met de muis, met uitlopen na loslaten. Touch en touchpad scrollen gewoon zelf.
  const drag = useRef({ active: false, moved: false, x: 0, left: 0, lastX: 0, lastT: 0, v: 0 });
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !track.current) return;
    gsap.killTweensOf(track.current);
    drag.current = { active: true, moved: false, x: e.clientX, left: track.current.scrollLeft, lastX: e.clientX, lastT: performance.now(), v: 0 };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || !track.current) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 4) {
      // Pas vastpakken als er echt gesleept wordt, zodat een gewone klik de kaart opent
      d.moved = true;
      track.current.style.scrollSnapType = "none";
      track.current.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    track.current.scrollLeft = d.left - dx;
    const now = performance.now();
    d.v = (e.clientX - d.lastX) / Math.max(1, now - d.lastT);
    d.lastX = e.clientX;
    d.lastT = now;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = track.current;
    if (!d.active || !el) return;
    d.active = false;
    if (!d.moved) return;
    el.releasePointerCapture(e.pointerId);
    const restoreSnap = () => {
      el.style.scrollSnapType = "";
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || Math.abs(d.v) < 0.05) return restoreSnap();
    const target = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft - d.v * 450));
    gsap.to(el, { scrollLeft: target, duration: 0.9, ease: "power3.out", onComplete: restoreSnap });
  };
  // Een klik direct na slepen niet doorlaten (anders opent een link per ongeluk)
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".snap-start");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 320) + 16), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <section ref={root} id="collectie" className="relative bg-ink py-24">
      <div className="mx-auto max-w-[1400px] px-5">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Rackets</p>
            <h2 className="mt-5 text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-medium">
              Power of <span className="accent">control</span>?
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-fg/70">{CATALOG_RACKETS.length} modellen van tien topmerken. Kies een vorm, klik op een racket voor alle specificaties en test je favoriet in het testcenter.</p>
            <a href="/rackets/" className="mt-4 inline-flex items-center gap-2 font-ui text-[12px] font-semibold tracking-[0.12em] text-accent uppercase">
              Bekijk het hele assortiment <ArrowIcon className="size-3" />
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="Filter rackets" className="flex flex-wrap gap-2">
            {[{ id: "" as const, label: "Alle vormen" }, ...SHAPES].map((t) => (
              <button
                key={t.id || "alle"}
                type="button"
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${tab === t.id ? "border-fg bg-fg text-on-accent" : "border-panel-2 text-fg hover:border-fg/40"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div role="group" className="flex flex-wrap gap-2" aria-label="Speelstijl">
            {PLAYSTYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={style === s.id}
                onClick={() => setStyle((cur) => (cur === s.id ? null : s.id))}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-colors ${style === s.id ? "border-fg/60 bg-panel-2 text-fg" : "border-panel-2 text-muted hover:text-fg"}`}
              >
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-8">
        <div
          ref={track}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={onClickCapture}
          onDragStart={(e) => e.preventDefault()}
          className="snap-x snap-mandatory scroll-px-5 overflow-x-auto pb-4 [scrollbar-width:thin] select-none md:cursor-grab md:active:cursor-grabbing"
        >
          <div className="track-inner flex w-max gap-4 px-5 md:px-[max(20px,calc((100vw-1400px)/2+20px))]">
            {list.length ? (
              <>
                {list.map((r) => (
                  <div key={r.id} className="w-[min(300px,74vw)] shrink-0 snap-start">
                    <RacketCard r={r} onOpen={(racket, from) => !drag.current.moved && setOpen({ r: racket, from })} />
                  </div>
                ))}
                <a
                  href={`/rackets/${tab ? `?vorm=${tab}` : ""}`}
                  className="group flex w-[min(300px,74vw)] shrink-0 snap-start flex-col justify-between rounded-[var(--radius-card)] bg-accent p-6 text-on-accent"
                >
                  <span className="text-[clamp(28px,2.6vw,40px)] leading-[1] font-semibold">
                    Alle {all.length} rackets bekijken
                  </span>
                  <span className="flex items-center gap-2 font-ui text-[11px] font-semibold tracking-[0.12em] uppercase">
                    Filter op merk, vorm en hardheid <ArrowIcon className="size-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              </>
            ) : (
              <p className="text-muted" role="status">
                Geen rackets met deze combinatie. Kies een andere speelstijl of filter.
              </p>
            )}
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-[1400px] px-5 font-ui text-[11px] font-semibold tracking-[0.12em] text-muted uppercase max-md:hidden">Sleep of gebruik de pijlen om meer rackets te zien</p>
        {list.length > 1 && (
          <div className="mx-auto mt-4 flex max-w-[1400px] justify-end gap-2 px-5">
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Vorige rackets" className="grid size-11 place-items-center rounded-full border border-panel-2 hover:border-fg/40">
              <ArrowIcon className="size-3 -rotate-[135deg]" />
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="Volgende rackets" className="grid size-11 place-items-center rounded-full border border-panel-2 hover:border-fg/40">
              <ArrowIcon className="size-3 rotate-45" />
            </button>
          </div>
        )}
      </div>

      <QuickView racket={open?.r ?? null} from={open?.from ?? null} onClose={() => setOpen(null)} />
    </section>
  );
}
