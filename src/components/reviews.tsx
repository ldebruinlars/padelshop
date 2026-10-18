"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { RATING, REVIEWS } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Reviews van echte klanten. Verschijnt pas als REVIEWS in site.ts gevuld is. */
export function Reviews() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!RATING) return;
      const el = root.current?.querySelector<HTMLElement>(".score");
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Telt op als een scorebord
        const n = { v: 0 };
        gsap.to(n, {
          v: RATING!.score,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = n.v.toFixed(1).replace(".", ",");
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  if (!REVIEWS.length) return null;

  return (
    <section ref={root} id="reviews" className="bg-bg py-24">
      <div className="mx-auto max-w-[1400px] px-5">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">
              Reviews
            </h2>
          </div>
          {RATING && (
            <p className="flex items-baseline gap-3">
              <span className="score text-6xl font-semibold tabular-nums">{RATING.score.toFixed(1).replace(".", ",")}</span>
              <span className="text-muted">
                uit {RATING.count} reviews op {RATING.source}
              </span>
            </p>
          )}
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {REVIEWS.slice(0, 3).map((r) => (
            <li key={r.name + r.text.slice(0, 12)} className="rounded-[var(--radius-card)] border border-fg/5 bg-panel p-6">
              <p className="text-accent-2" aria-label={`${r.stars} van 5 sterren`}>
                {"★".repeat(r.stars)}
                <span className="text-fg/25">{"★".repeat(5 - r.stars)}</span>
              </p>
              <blockquote className="mt-4 text-lg leading-relaxed">“{r.text}”</blockquote>
              <p className="mt-4 text-sm text-muted">
                {r.name} · {r.source}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
