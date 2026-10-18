"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { RACKETS, STYLES, type Racket } from "@/lib/site";
import { ArrowIcon } from "./icons";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="grid grid-cols-[64px_1fr_28px] items-center gap-3 font-ui text-[11px] font-semibold tracking-[0.1em] uppercase">
      <span className="text-mist">{label}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-navy-3">
        <span className="block h-full rounded-full" style={{ width: `${value * 10}%`, background: color }} />
      </span>
      <span className="text-right tabular-nums">{value.toFixed(1)}</span>
    </div>
  );
}

function RacketCard({ r, compare, onCompare }: { r: Racket; compare: boolean; onCompare: () => void }) {
  const style = STYLES.find((s) => s.id === r.style)!;
  return (
    <article className="flex w-[min(380px,82vw)] shrink-0 flex-col rounded-[var(--radius-card)] border border-white/5 bg-navy-2 p-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_40%,#1d2f47,#0b1420_70%)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" decoding="async" src={r.image} alt={`${r.name} padel racket`} className="size-full object-cover transition-transform duration-700 hover:scale-105" />
        <span className="absolute top-3 left-3 rounded-full px-3 py-1 font-ui text-[11px] font-semibold tracking-[0.14em] text-navy uppercase" style={{ background: style.color }}>
          {style.label}
        </span>
        {r.testable && (
          <span className="absolute top-3 right-3 rounded-full bg-navy/80 px-3 py-1 font-ui text-[11px] font-semibold tracking-[0.12em] text-lime uppercase backdrop-blur">
            Ligt in het testcenter
          </span>
        )}
      </div>
      <div className="grid gap-3 p-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-2xl font-semibold">{r.name}</h3>
          <span className="text-lg tabular-nums">€ {r.price}</span>
        </div>
        <p className="text-sm text-mist">
          {r.shape} · {r.weight} · balans {r.balance} · {r.level}
        </p>
        <Bar label="Power" value={r.power} color="#ccff00" />
        <Bar label="Control" value={r.control} color="#9fb6d6" />
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={onCompare}
            aria-pressed={compare}
            className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${compare ? "border-lime bg-lime text-navy" : "border-navy-3 text-white hover:border-white/40"}`}
          >
            {compare ? "In vergelijking" : "Vergelijk"}
          </button>
          {r.testable && (
            <a href="#testcenter" className="flex items-center gap-2 rounded-full bg-sand py-1.5 pr-1.5 pl-4 text-sm font-semibold text-navy">
              Test dit racket
              <span className="grid size-7 place-items-center rounded-full bg-navy">
                <ArrowIcon className="size-3 text-lime" />
              </span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/** Horizontale collectie per speelstijl, met power/control-balken en een vergelijker. */
export function Collection() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [compare, setCompare] = useState<string[]>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const distance = () => (track.current ? track.current.scrollWidth - window.innerWidth + 40 : 0);
        gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: 1, pin: true, invalidateOnRefresh: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Maximaal 3; een vierde keuze wordt geweigerd met een melding in plaats van stil de oudste te vervangen.
  const [full, setFull] = useState(false);
  const toggle = (id: string) =>
    setCompare((c) => {
      if (c.includes(id)) {
        setFull(false);
        return c.filter((x) => x !== id);
      }
      if (c.length >= 3) {
        setFull(true);
        return c;
      }
      return [...c, id];
    });
  // De balk staat via een portal in <body>: binnen de vastgepinde sectie zou position:fixed meeschuiven.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const picked = RACKETS.filter((r) => compare.includes(r.id));

  return (
    <section ref={root} id="collectie" className="relative overflow-hidden bg-ink py-16 md:flex md:h-[100svh] md:flex-col md:justify-center md:py-0">
      <div className="mx-auto mb-10 flex w-full max-w-[1400px] flex-wrap items-end justify-between gap-6 px-5">
        <div>
          <p className="eyebrow">Shop per speelstijl</p>
          <h2 className="mt-5 text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-medium">
            Power of <span className="accent">control</span>?
          </h2>
        </div>
        <p className="max-w-md text-white/70">Onze coaches scoren elk racket op power en control. Kies er tot drie en zet ze naast elkaar.</p>
      </div>

      <div ref={track} className="flex gap-4 overflow-x-auto px-5 pb-4 md:overflow-visible md:pb-0">
        {STYLES.flatMap((s) => [
          <div key={s.id} className="flex w-[min(300px,70vw)] shrink-0 flex-col justify-end rounded-[var(--radius-card)] p-6" style={{ background: s.color }}>
            <span className="font-ui text-[11px] font-semibold tracking-[0.14em] text-navy/70 uppercase">Speelstijl</span>
            <span className="mt-2 text-5xl font-semibold tracking-tight text-navy">{s.label}</span>
            <span className="mt-2 text-sm text-navy/75">{s.tagline}</span>
          </div>,
          ...RACKETS.filter((r) => r.style === s.id).map((r) => (
            <RacketCard key={r.id} r={r} compare={compare.includes(r.id)} onCompare={() => toggle(r.id)} />
          )),
        ])}
      </div>

      {mounted && picked.length > 0 && createPortal(
        <div className="fixed inset-x-0 bottom-0 z-40 px-[max(10px,env(safe-area-inset-left))] pb-[calc(10px+env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-[900px] flex-wrap items-center gap-4 rounded-[var(--radius-card)] border border-white/10 bg-navy/95 p-3 pl-5 shadow-2xl backdrop-blur">
            <span className="font-ui text-[11px] font-semibold tracking-[0.14em] text-mist uppercase">Vergelijk ({picked.length}/3)</span>
            <div className="flex flex-1 flex-wrap gap-4">
              {picked.map((r) => (
                <div key={r.id} className="min-w-[140px] flex-1">
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="mt-1 grid gap-1">
                    <Bar label="Power" value={r.power} color="#ccff00" />
                    <Bar label="Control" value={r.control} color="#9fb6d6" />
                  </div>
                </div>
              ))}
            </div>
            {full && <span className="w-full text-sm text-sand" role="status">Je vergelijkt er al drie. Haal er eerst een weg.</span>}
            <button type="button" onClick={() => { setCompare([]); setFull(false); }} className="rounded-full border border-navy-3 px-4 py-2 text-sm text-mist hover:text-white">
              Wissen
            </button>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
