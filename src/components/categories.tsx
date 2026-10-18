"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CATEGORIES } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Shop per categorie: fototegels die gestaffeld binnenkomen en langzaam inzoomen bij hover. */
export function Categories() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".cat-tile", {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="categorieen" className="bg-ink py-24">
      <div className="mx-auto max-w-[1400px] px-5">
        <div className="grid gap-3 border-b border-panel-2 pb-6">
          <h2 className="text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">
            Meer dan rackets
          </h2>
          <p className="max-w-[60ch] text-fg/70">Rackets vergelijk je hier en test je bij ons op de baan. Schoenen, tassen, ballen en kleding vind je in de winkel bij Poort Padel.</p>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <li key={c.id} className="cat-tile">
              <a href={c.online ? "#collectie" : "#bezoek"} className="group relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-paper sm:aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  decoding="async"
                  src={c.image}
                  alt=""
                  className={`size-full transition-transform duration-[1200ms] ease-out group-hover:scale-105 ${c.id === "rackets" ? "object-contain p-6" : "object-cover"}`}
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-bg/90 via-bg/50 to-transparent p-4 pt-16 sm:p-5 sm:pt-20">
                  <div>
                    <p className="text-lg font-semibold leading-tight sm:text-2xl">{c.label}</p>
                    <p className="mt-1 text-xs text-fg/85 sm:text-sm">
                      <span className="max-sm:hidden">{c.online ? c.text : `${c.text} · in de winkel`}</span>
                      <span className="sm:hidden">{c.online ? "Bekijk alle" : "In de winkel"}</span>
                    </p>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
