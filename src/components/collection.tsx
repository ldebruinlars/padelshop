"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { RACKETS, STYLES, euro, type Racket, type Style } from "@/lib/site";
import { ArrowIcon } from "./icons";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TABS: { id: string; label: string; test: (r: Racket) => boolean }[] = [
  { id: "alle", label: "Alle", test: () => true },
  { id: "bestseller", label: "Bestsellers", test: (r) => r.tags.includes("bestseller") },
  { id: "beginner", label: "Beginner", test: (r) => r.level === "Beginner" },
  { id: "gevorderd", label: "Gevorderd", test: (r) => r.level === "Gevorderd" },
  { id: "nieuw", label: "Nieuw", test: (r) => r.tags.includes("nieuw") },
  { id: "outlet", label: "Outlet", test: (r) => r.tags.includes("outlet") },
];

const POWER = "#ff4a4a";
const CONTROL = "#d9a48f";

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="grid grid-cols-[64px_1fr_28px] items-center gap-3 font-ui text-[11px] font-semibold tracking-[0.1em] uppercase">
      <span className="text-muted">{label}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-panel-2">
        <span className="bar-fill block h-full origin-left rounded-full" style={{ width: `${value * 10}%`, background: color }} />
      </span>
      <span className="text-right tabular-nums">{value.toFixed(1)}</span>
    </div>
  );
}

function RacketCard({ r, compare, onCompare }: { r: Racket; compare: boolean; onCompare: () => void }) {
  const style = STYLES.find((s) => s.id === r.style)!;
  const media = useRef<HTMLDivElement>(null);

  // Lichte kanteling naar de cursor (alleen met muis en zonder reduced motion)
  const tilt = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !media.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const b = media.current.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5;
    const y = (e.clientY - b.top) / b.height - 0.5;
    gsap.to(media.current.querySelector("img"), { rotateY: x * 10, rotateX: -y * 8, scale: 1.03, duration: 0.5, ease: "power2.out" });
  };
  const untilt = () => {
    if (media.current) gsap.to(media.current.querySelector("img"), { rotateY: 0, rotateX: 0, scale: 1, duration: 0.7, ease: "power3.out" });
  };

  return (
    <article className="racket-card flex w-[min(320px,78vw)] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius-card)] border border-fg/5 bg-panel">
      <div ref={media} onPointerMove={tilt} onPointerLeave={untilt} className="relative aspect-[4/5] bg-paper [perspective:900px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" decoding="async" draggable={false} src={r.image} alt={`${r.name} padel racket`} className="size-full object-cover will-change-transform [-webkit-user-drag:none]" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-full px-3 py-1 font-ui text-[11px] font-semibold tracking-[0.14em] text-on-accent uppercase" style={{ background: style.color }}>
            {style.label}
          </span>
          {r.tags.includes("nieuw") && <span className="rounded-full bg-on-accent px-3 py-1 font-ui text-[11px] font-semibold tracking-[0.14em] text-fg uppercase">Nieuw</span>}
          {r.oldPrice && <span className="rounded-full bg-accent px-3 py-1 font-ui text-[11px] font-semibold tracking-[0.14em] text-on-accent uppercase">-{Math.round((1 - r.price / r.oldPrice) * 100)}%</span>}
        </div>
        {r.testable && (
          <span className="absolute right-3 bottom-3 rounded-full bg-bg px-3 py-1 font-ui text-[11px] font-semibold tracking-[0.12em] text-accent uppercase">
            Ligt in het testcenter
          </span>
        )}
      </div>
      <div className="grid flex-1 content-start gap-3 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold">{r.name}</h3>
          <span className="flex items-baseline gap-2 tabular-nums">
            {r.oldPrice && <s className="text-sm text-muted">{euro(r.oldPrice)}</s>}
            <span className="text-lg font-semibold">{euro(r.price)}</span>
          </span>
        </div>
        <p className="text-sm text-muted">
          {r.shape} · {r.weight} · balans {r.balance} · {r.level}
        </p>
        <Bar label="Power" value={r.power} color={POWER} />
        <Bar label="Control" value={r.control} color={CONTROL} />
        <div className="mt-auto flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCompare}
            aria-pressed={compare}
            className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${compare ? "border-accent bg-accent text-on-accent" : "border-panel-2 text-fg hover:border-fg/40"}`}
          >
            {compare ? "In vergelijking" : "Vergelijk"}
          </button>
          <a href={r.testable ? "#testcenter" : "#bezoek"} className="flex items-center gap-2 rounded-full bg-accent-2 py-1.5 pr-1.5 pl-4 text-sm font-semibold whitespace-nowrap text-on-accent">
            {r.testable ? "Test dit racket" : "In de winkel"}
            <span className="grid size-7 place-items-center rounded-full bg-bg">
              <ArrowIcon className="size-3 text-accent" />
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}

/** Rackets: tabs en speelstijl-filter, veegbare rij lichte productkaarten, en een vergelijker. */
export function Collection() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState("alle");
  const [style, setStyle] = useState<Style | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [full, setFull] = useState(false);

  const list = RACKETS.filter((r) => TABS.find((t) => t.id === tab)!.test(r) && (!style || r.style === style));

  // Kaarten en balken animeren bij binnenkomst, en opnieuw na het wisselen van filter.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".racket-card", { y: 30, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.06, scrollTrigger: { trigger: track.current, start: "top 85%", once: true } });
        gsap.from(".bar-fill", { scaleX: 0, duration: 1, ease: "power2.out", stagger: 0.03, scrollTrigger: { trigger: track.current, start: "top 75%", once: true } });
      });
      // Licht scroll-effect: de rij schuift tijdens het voorbijscrollen een stukje naar links, zonder de pagina vast te zetten.
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(".track-inner", { x: 90 }, { x: -90, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [tab, style], revertOnUpdate: true },
  );

  // Slepen met de muis, met uitlopen na loslaten. Touch en touchpad scrollen gewoon zelf.
  const drag = useRef({ active: false, moved: false, x: 0, left: 0, lastX: 0, lastT: 0, v: 0 });
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !track.current) return;
    if ((e.target as HTMLElement).closest("button, a")) return;
    gsap.killTweensOf(track.current);
    drag.current = { active: true, moved: false, x: e.clientX, left: track.current.scrollLeft, lastX: e.clientX, lastT: performance.now(), v: 0 };
    track.current.style.scrollSnapType = "none";
    track.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || !track.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
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
    const card = el.querySelector<HTMLElement>(".racket-card");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 320) + 16), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const picked = RACKETS.filter((r) => compare.includes(r.id));

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
          <p className="max-w-md text-fg/70">Onze coaches scoren elk racket op power en control. Filter op niveau of speelstijl en zet er tot drie naast elkaar.</p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="Filter rackets" className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
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
            {STYLES.map((s) => (
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
              list.map((r) => <RacketCard key={r.id} r={r} compare={compare.includes(r.id)} onCompare={() => toggle(r.id)} />)
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

      {mounted && picked.length > 0 && createPortal(
        <div className="fixed inset-x-0 bottom-0 z-40 px-[max(10px,env(safe-area-inset-left))] pb-[calc(10px+env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-[900px] flex-wrap items-center gap-4 rounded-[var(--radius-card)] border border-fg/10 bg-bg/95 p-3 pl-5 shadow-2xl backdrop-blur">
            <span className="font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Vergelijk ({picked.length}/3)</span>
            <div className="flex flex-1 flex-wrap gap-4">
              {picked.map((r) => (
                <div key={r.id} className="min-w-[140px] flex-1">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{r.name}</span>
                    <span className="tabular-nums text-muted">{euro(r.price)}</span>
                  </div>
                  <div className="mt-1 grid gap-1">
                    <Bar label="Power" value={r.power} color={POWER} />
                    <Bar label="Control" value={r.control} color={CONTROL} />
                  </div>
                </div>
              ))}
            </div>
            {full && <span className="w-full text-sm text-accent-2" role="status">Je vergelijkt er al drie. Haal er eerst een weg.</span>}
            <button type="button" onClick={() => { setCompare([]); setFull(false); }} className="rounded-full border border-panel-2 px-4 py-2 text-sm text-muted hover:text-fg">
              Wissen
            </button>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
