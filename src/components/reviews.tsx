"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CONFIG } from "@/lib/config";
import { RATING, REVIEWS } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Wat zeggen testers: tot 6 Google-reviews (naam, niveau, racket gekocht, één zin) en een knop naar Google.
 * Het blok verschijnt pas als er echte reviews in site.ts staan of als de Google-reviewlink in config.ts is ingevuld.
 */
export function Reviews() {
  const root = useRef<HTMLElement>(null);
  const list = REVIEWS.slice(0, 6);

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

  // Geen echte reviews en nog geen Google-link: dan geen blok
  if (!list.length && !CONFIG.googleReviewUrl) return null;

  return (
    <section ref={root} id="reviews" className="cv bg-bg py-24">
      <div className="mx-auto max-w-[1400px] px-5">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">Wat zeggen testers</h2>
            <p className="mt-3 max-w-[56ch] text-fg/70">{list.length ? "Reviews van spelers die bij ons een racket testten, uit Google." : "Heb je bij ons een racket getest? Laat je mening achter op Google."}</p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {RATING && (
              <p className="flex items-baseline gap-3">
                <span className="score text-6xl font-semibold tabular-nums">{RATING.score.toFixed(1).replace(".", ",")}</span>
                <span className="text-muted">
                  uit {RATING.count} reviews op {RATING.source}
                </span>
              </p>
            )}
            {CONFIG.googleReviewUrl ? (
              <a href={CONFIG.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Schrijf een review
              </a>
            ) : null}
          </div>
        </div>
        {list.length > 0 && (
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {list.map((r, i) => (
            <li key={`${r.name}-${i}`} className="relative rounded-[var(--radius-card)] border border-fg/5 bg-panel p-6">
              <p className="text-accent-2" aria-label={`${r.stars} van 5 sterren`}>
                {"★".repeat(r.stars)}
                <span className="text-fg/25">{"★".repeat(5 - r.stars)}</span>
              </p>
              <blockquote className="mt-4 text-lg leading-relaxed">“{r.text}”</blockquote>
              <p className="mt-4 text-sm text-muted">
                {r.name} · {r.level} · kocht de {r.racket}
              </p>
            </li>
          ))}
        </ul>
        )}
      </div>
    </section>
  );
}
