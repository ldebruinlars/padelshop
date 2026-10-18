"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MEDIA } from "@/lib/site";
import { ArrowIcon } from "./icons";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Header "video door de letters": de racketvideo speelt in de letters
 * (multiply-overlay in navy), bij scrollen groeit de tekst tot de video het scherm vult.
 */
export function HeroLetters() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-word", { yPercent: 60, duration: 0.7, ease: "expo.out", stagger: 0.06 });
        gsap.from(".hero-copy > *", { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.6 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=140%", scrub: 1, pin: true },
        });
        tl.to(".hero-copy", { opacity: 0, y: -40, duration: 0.25 }, 0)
          .to(".hero-title", { scale: 9, duration: 1, ease: "power2.in" }, 0)
          .to(".hero-mask", { opacity: 0, duration: 0.35 }, 0.6)
          .to(".hero-media", { scale: 1, duration: 1 }, 0);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative h-[100svh] overflow-hidden bg-ink">
      {/* Beeld of video onder de letters */}
      <div className="hero-media absolute inset-0 scale-110 brightness-[1.9] contrast-[1.1] bg-[radial-gradient(circle_at_65%_40%,#3b5b86,#0b1420_60%)]">
        {MEDIA.heroVideo ? (
          <video className="size-full object-cover" src={MEDIA.heroVideo} autoPlay muted loop playsInline poster={MEDIA.hero} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="size-full object-cover" src={MEDIA.hero} alt="Coach geeft een testracket aan een speler bij Poort Padel" />
        )}
      </div>

      {/* Navy laag: alleen de witte letters laten het beeld door */}
      <div className="hero-mask absolute inset-0 grid place-items-center bg-navy mix-blend-multiply">
        <h1 className="hero-title px-4 text-center text-[clamp(52px,15vw,300px)] leading-[0.82] font-bold tracking-[-0.06em] text-white uppercase">
          <span className="block overflow-hidden">
            <span className="hero-word inline-block">Voel</span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-word inline-block">het verschil</span>
          </span>
        </h1>
      </div>

      {/* Dunne lime contour boven de maskerlaag, zodat de kop ook leesbaar is waar het beeld donker is */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center motion-reduce:hidden">
        <div className="hero-title px-4 text-center text-[clamp(52px,15vw,300px)] leading-[0.82] font-bold tracking-[-0.06em] text-lime uppercase [-webkit-text-fill-color:transparent] [-webkit-text-stroke:1px_rgba(204,255,0,0.45)]">
          <span className="block overflow-hidden">
            <span className="hero-word inline-block">Voel</span>
          </span>
          <span className="block overflow-hidden">
            <span className="hero-word inline-block">het verschil</span>
          </span>
        </div>
      </div>

      <div className="hero-copy pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-[max(20px,env(safe-area-inset-left))] pb-10">
        <p className="eyebrow">Racket-testcenter · Poort Padel, Almere</p>
        <p className="max-w-md text-[17px] leading-relaxed text-white/85">
          Speel 45 minuten met 3 tot 5 rackets, met een coach van All Court Academy naast je. Pas als het <span className="accent">goed voelt</span>, koop je. De test krijg je dan terug.
        </p>
        <a
          href="#testcenter"
          className="pointer-events-auto flex items-center gap-3 rounded-full bg-lime py-2 pr-2 pl-5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
        >
          Boek je racket-test
          <span className="grid size-8 place-items-center rounded-full bg-navy">
            <ArrowIcon className="size-3 text-lime" />
          </span>
        </a>
      </div>
    </section>
  );
}
