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
 * (multiply-overlay in espresso), bij scrollen groeit de tekst tot de video het scherm vult.
 */
/** De kop "Voel het verschil", één keer gedefinieerd voor zowel de maskerletters als de contour. */
function Title({ as: Tag, className }: { as: "h1" | "div"; className: string }) {
  return (
    <Tag className={`hero-title px-4 text-center text-[clamp(52px,15vw,300px)] leading-[0.82] font-bold tracking-[-0.06em] text-balance uppercase ${className}`}>
      <span className="block overflow-hidden">
        <span className="hero-word inline-block">Voel</span>
      </span>
      <span className="block overflow-hidden">
        <span className="hero-word inline-block">het verschil</span>
      </span>
    </Tag>
  );
}

export function HeroLetters() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-word", { yPercent: 60, duration: 0.7, ease: "expo.out", stagger: 0.06 });
        gsap.from(".hero-copy > *", { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.6 });

        // Kort vastzetten: na ruim een halve schermhoogte scrollen staat de foto vrij en loopt de pagina door.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=60%", scrub: 0.5, pin: true },
        });
        tl.to(".hero-copy", { opacity: 0, y: -30, duration: 0.2 }, 0)
          .to(".hero-title", { scale: 4.5, duration: 1, ease: "power2.in" }, 0)
          .to([".hero-mask", ".hero-outline"], { opacity: 0, duration: 0.4 }, 0.5)
          .to(".hero-media", { scale: 1, duration: 1 }, 0);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative h-[100svh] overflow-hidden bg-ink">
      {/* Beeld of video onder de letters */}
      {/* Natuurlijk daglicht, zonder extra helderheidsfilter (dat blies de hooglichten op) */}
      <div className="hero-media absolute inset-0 scale-110 bg-panel">
        {MEDIA.heroVideo ? (
          <video className="size-full object-cover" src={MEDIA.heroVideo} autoPlay muted loop playsInline poster={MEDIA.hero} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="size-full object-cover" src={MEDIA.hero} alt="Rally op een blauwe baan bij Poort Padel" fetchPriority="high" />
        )}
      </div>

      {/* Espresso-laag: alleen de witte letters laten het beeld door */}
      <div className="hero-mask absolute inset-0 grid place-items-center bg-bg mix-blend-multiply">
        <Title as="h1" className="text-fg" />
      </div>

      {/* Oranje contour boven de maskerlaag. Zelfde component, dus exact dezelfde maat en letterafstand als de letters eronder. */}
      <div aria-hidden="true" className="hero-outline pointer-events-none absolute inset-0 grid place-items-center motion-reduce:hidden">
        <Title as="div" className="[-webkit-text-fill-color:transparent] [-webkit-text-stroke:1.5px_rgba(240,106,48,0.7)]" />
      </div>

      <div className="hero-copy pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-[max(20px,env(safe-area-inset-left))] pb-10">
        <p className="eyebrow">Racket-testcenter · Poort Padel, Almere</p>
        <p className="max-w-md text-[17px] leading-relaxed text-fg/85">
          Rackets, schoenen en alles voor padel. Twijfel je? Test 3 tot 5 rackets met een coach van All Court Academy. Pas als het <span className="accent">goed voelt</span>, koop je.
        </p>
        <div className="pointer-events-auto flex flex-wrap gap-2">
          <a href="#collectie" className="flex items-center gap-3 rounded-full bg-accent-2 py-2 pr-2 pl-5 text-sm font-semibold text-on-accent transition-transform hover:-translate-y-0.5">
            Shop rackets
            <span className="grid size-8 place-items-center rounded-full bg-bg">
              <ArrowIcon className="size-3 text-accent" />
            </span>
          </a>
          <a href="#testcenter" className="flex items-center gap-3 rounded-full bg-accent py-2 pr-2 pl-5 text-sm font-semibold text-on-accent transition-transform hover:-translate-y-0.5">
            Boek je racket-test
            <span className="grid size-8 place-items-center rounded-full bg-bg">
              <ArrowIcon className="size-3 text-accent" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
