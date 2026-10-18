"use client";

import { useRef } from "react";
import { preload } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MEDIA, SHOP, euro } from "@/lib/site";
import { ArrowIcon } from "./icons";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FACTS = [
  ["45 min", "testen op de baan"],
  ["3 tot 5", "rackets voor jouw spel"],
  [euro(SHOP.testPrice), "terug bij aankoop"],
];

/**
 * Hero: eigen foto van Poort Padel, rustig links uitgelijnd op het raster.
 * Alleen transform en opacity animeren (geen blend-lagen of vastzetten), zodat het ook op een
 * tragere laptop of telefoon soepel blijft.
 */
export function HeroLetters() {
  const root = useRef<HTMLElement>(null);
  preload(MEDIA.hero1600, { as: "image", fetchPriority: "high", imageSrcSet: MEDIA.heroSrcSet, imageSizes: "100vw" });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(".hero-img", { scale: 1.08, duration: 1.6 }, 0)
          .from(".hero-line > span", { yPercent: 105, duration: 1, stagger: 0.08 }, 0.15)
          .from(".hero-fade", { y: 18, opacity: 0, duration: 0.8, stagger: 0.07 }, 0.45);
        // Bij scrollen schuift de foto iets langzamer weg dan de tekst (parallax, alleen transform)
        gsap.to(".hero-img", { yPercent: 12, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hero-img size-full object-cover object-[62%_center] will-change-transform"
          src={MEDIA.hero1600}
          srcSet={MEDIA.heroSrcSet}
          sizes="100vw"
          alt="Rally op een blauwe baan bij Poort Padel"
          fetchPriority="high"
          decoding="async"
        />
        {/* Vaste verlopen voor leesbaarheid: van links en van onder, in espresso */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/60 to-bg/0 max-md:from-bg/80 max-md:via-bg/55" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-5 pt-36 pb-12 md:pb-16">
        <p className="hero-fade eyebrow">Testcenter · Poort Padel, Almere</p>
        <h1 className="mt-6 max-w-[14ch] text-[clamp(52px,8.4vw,132px)] leading-[0.9] font-semibold tracking-[-0.045em]">
          <span className="hero-line block overflow-hidden pb-[0.06em]">
            <span className="block">Voel het</span>
          </span>
          <span className="hero-line block overflow-hidden pb-[0.08em]">
            <span className="block">
              <span className="accent">verschil</span>.
            </span>
          </span>
        </h1>
        <p className="hero-fade mt-6 max-w-[46ch] text-[17px] leading-relaxed text-fg/85 md:text-lg">
          Rackets van tien topmerken, met advies van de coaches van All Court Academy. Twijfel je? Test ze eerst op de baan en koop pas als het goed voelt.
        </p>
        <div className="hero-fade mt-8 flex flex-wrap gap-3">
          <a href="/rackets/" className="flex items-center gap-3 rounded-full bg-accent py-2 pr-2 pl-5 font-semibold text-on-accent transition-transform hover:-translate-y-0.5">
            Shop rackets
            <span className="grid size-9 place-items-center rounded-full bg-bg">
              <ArrowIcon className="size-3 text-accent" />
            </span>
          </a>
          <a href="#testcenter" className="flex items-center gap-3 rounded-full border border-fg/25 py-2 pr-2 pl-5 font-semibold transition-colors hover:border-fg/60">
            Boek een racket-test
            <span className="grid size-9 place-items-center rounded-full bg-fg/10">
              <ArrowIcon className="size-3" />
            </span>
          </a>
        </div>
        <dl className="hero-fade mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-fg/15 pt-6">
          {FACTS.map(([a, b]) => (
            <div key={a}>
              <dt className="text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">{a}</dt>
              <dd className="mt-1 text-sm text-muted">{b}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
