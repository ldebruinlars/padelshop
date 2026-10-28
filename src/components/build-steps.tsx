"use client";

import { useEffect, useRef, useState } from "react";

// Zo wordt een padelracket gemaakt, in de volgorde van de meeste fabrieken (bron per stap; de volgorde verschilt per merk).
const STEPS = [
  {
    img: "/media/maken/1-kern-v2.webp",
    title: "De kern snijden",
    text: "De kern van EVA-rubber of foam wordt in de vorm van de kop uit een plaat gestanst, zo'n 2 cm dik. De hardheid van dat rubber bepaalt straks hoe zacht of direct het racket aanvoelt.",
  },
  {
    img: "/media/maken/2-vezels-v2.webp",
    title: "Vezels opleggen",
    text: "Vellen carbon of glasvezel, al voorzien van hars (prepreg), worden met een mal op maat gesneden. Om een luchtslang komt een gevlochten carbonbuis: het frame. Daarin de kern, en aan beide kanten de lagen, in een vaste volgorde en kruiselings gelegd. Dit is handwerk.",
  },
  {
    img: "/media/maken/3-pers-v2.webp",
    title: "Persen en uitharden",
    text: "Alles gaat in een stalen of aluminium mal in een verwarmde pers. De luchtslang blaast op en drukt de vezels tegen de mal terwijl de hars uithardt, bij Head rond de 160 °C in 10 tot 15 minuten. Eén mal maakt één racket per keer. Er komt een rand overtollige hars uit.",
  },
  {
    img: "/media/maken/4-boren-v2.webp",
    title: "Gaten boren",
    text: "De rand hars wordt eraf geslepen (ontbramen). Daarna boort een machine de gaten door slagvlak en kern. Volgens de regels zijn ze 9 tot 13 mm in het midden. Het patroon verschilt per racket en bepaalt mee hoe de bal reageert.",
  },
  {
    img: "/media/maken/5-lakken-v2.webp",
    title: "Afwerken en lakken",
    text: "Schoonmaken, primer, drogen, spuiten, stickers en lak: veel daarvan gaat met de hand. Bij Starvie duurt een racket van begin tot eind zo'n tien dagen. Een zandruw oppervlak komt er nu op; 3D-reliëf zit al in de mal.",
  },
  {
    img: "/media/maken/6-grip-v2.webp",
    title: "Grip, wegen en meten",
    text: "De greep wordt opgebouwd en omwikkeld, de dop en het polskoord gaan erop. Elk racket wordt gewogen en het balanspunt gemeten voordat het de fabriek verlaat.",
  },
];
const SOURCES = [
  { label: "Studypadel", url: "https://www.studypadel.com/articles/how-padel-rackets-are-made" },
  { label: "Padelvida", url: "https://padelvida.com/learn/how-padel-rackets-manufactured/" },
  { label: "Head (via Tennis Warehouse)", url: "https://www.tenniswarehouse-europe.com/learning_center/how_to/how_a_head_racket_is_made.html?lang=it" },
  { label: "Starvie fabrieksbezoek (PadelPROShop)", url: "https://padelproshop.com/en-ar/blogs/blog/how-are-the-padel-rackets-we-visit-the-factory-starvie" },
];

/** Zes stappen van plaat rubber tot racket. Speelt vanzelf door als je kijkt; klikken neemt het over. */
export function BuildSteps() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Vanzelf doorspelen zodra het blok in beeld is, niet bij voorkeur voor minder beweging
  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => setAuto(e.isIntersecting), { threshold: 0.5 });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setI((n) => (n + 1) % STEPS.length), 5000);
    return () => clearTimeout(t);
  }, [auto, i]);

  const pick = (n: number) => {
    setI(n);
    setAuto(false);
  };

  return (
    <div ref={root} className="mt-14 border-t border-panel-2 pt-10">
      <h3 className="text-2xl font-bold">Zo wordt een racket gemaakt</h3>
      <p className="mt-2 max-w-[64ch] text-fg/75">Van een plaat rubber tot het racket aan de wand, in zes stappen.</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-panel">
          {STEPS.map((s, n) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.img}
              src={s.img}
              alt={n === i ? s.title : ""}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${n === i ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`}
            />
          ))}
          <p className="absolute bottom-3 left-3 rounded-[3px] bg-ink/80 px-2 py-1 text-xs text-fg/80">Illustratie, geen foto van een echte fabriek</p>
        </div>
        <ol className="grid content-start">
          {STEPS.map((s, n) => (
            <li key={s.title} className="border-b border-panel-2">
              <button type="button" onClick={() => pick(n)} aria-expanded={n === i} className="flex w-full items-baseline gap-4 py-3 text-left">
                <span className={`font-display text-lg font-bold tabular-nums ${n === i ? "text-accent" : "text-fg/40"}`}>{n + 1}</span>
                <span className={`text-lg font-semibold ${n === i ? "" : "text-fg/70"}`}>{s.title}</span>
              </button>
              {n === i && (
                <div className="pb-4 pl-8">
                  <p className="text-fg/75">{s.text}</p>
                  {auto && (
                    <span className="mt-3 block h-0.5 overflow-hidden rounded-full bg-panel-2" aria-hidden="true">
                      <span key={i} className="block h-full origin-left animate-[grow_5s_linear_forwards] bg-accent" />
                    </span>
                  )}
                </div>
              )}
            </li>
          ))}
          <li className="pt-3 text-xs text-muted">
            Bronnen:{" "}
            {SOURCES.map((s, n) => (
              <span key={s.url}>
                {n > 0 && ", "}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">
                  {s.label}
                </a>
              </span>
            ))}
            . Temperatuur en volgorde verschillen per fabriek.
          </li>
        </ol>
      </div>
    </div>
  );
}
