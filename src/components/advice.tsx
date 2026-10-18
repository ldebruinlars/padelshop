"use client";

import { useId, useState } from "react";
import { SHOP, euro } from "@/lib/site";
import { ArrowIcon } from "./icons";

const GUIDES = [
  {
    tag: "Vorm",
    title: "Rond, druppel of diamant?",
    text: "Een ronde kop heeft de sweet spot laag en dicht bij je hand: veel controle en vergevingsgezind, ideaal als je begint of graag plaatst. Een druppel zit in het midden en past bij de meeste spelers. Een diamant legt het gewicht hoger in de kop: meer kracht bij de smash, maar minder vergevingsgezind en zwaarder voor je arm.",
  },
  {
    tag: "Beginners",
    title: "Welk racket als je net begint?",
    text: "Kies een ronde kop, rond de 340 tot 355 gram, met een lage balans en een zachte kern (EVA soft of foam). Een slagvlak van glasvezel geeft de bal makkelijk snelheid mee, ook als je nog niet hard slaat. Duur is niet nodig: de techniek komt eerst.",
  },
  {
    tag: "Materiaal",
    title: "Carbon of glasvezel?",
    text: "Carbon is stijver en duurzamer en geeft meer controle bij harde slagen, maar voelt harder. Glasvezel is soepeler en comfortabeler en helpt bij langzamere slagen. Het K-getal (3K, 12K, 18K) zegt hoeveel draden er in een carbonbundel zitten; een hoger getal voelt meestal stijver.",
  },
];

const FAQ = [
  { q: "Wat kost een racket-test?", a: `Een sessie van 45 minuten met een coach kost ${euro(SHOP.testPrice)}. Koop je daarna een racket, dan gaat dat bedrag van de prijs af.` },
  { q: "Hoe werkt de thuistest?", a: `We sturen tot drie testrackets naar je toe. Je speelt er ${SHOP.homeTestDays} dagen mee op je eigen club en stuurt terug wat je niet houdt.` },
  { q: "Kan ik een racket terugsturen?", a: `Ja, je hebt ${SHOP.returnDays} dagen bedenktijd. Twijfel je vooraf, boek dan een test: dan weet je het zeker voordat je koopt.` },
  { q: "Wat kost bezorgen?", a: `Vanaf ${euro(SHOP.freeShippingFrom)} bezorgen we gratis. Je kunt je bestelling ook ophalen bij Poort Padel.` },
  { q: "Welke garantie krijg ik?", a: `Op rackets zit ${SHOP.warranty}. Kom langs of stuur ons een bericht als er iets mis is, dan regelen we het met het merk.` },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li className="border-b border-fg/10">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-medium">
          {q}
          <span className={`grid size-8 shrink-0 place-items-center rounded-full border border-panel-2 transition-transform duration-300 ${open ? "rotate-45" : ""}`} aria-hidden="true">
            +
          </span>
        </button>
      </h3>
      {/* Hoogte animeren met grid-rows 0fr -> 1fr */}
      <div id={id} className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-5 text-fg/70">{a}</p>
        </div>
      </div>
    </li>
  );
}

function Guide({ g }: { g: (typeof GUIDES)[number] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <article className="flex flex-col rounded-[var(--radius-card)] border border-fg/5 bg-panel p-6 transition-transform duration-300 hover:-translate-y-1">
      <span className="eyebrow">{g.tag}</span>
      <h3 className="mt-4 text-2xl font-semibold">{g.title}</h3>
      <div id={id} className={`relative mt-3 overflow-hidden text-fg/70 ${open ? "" : "max-h-[4.8em]"}`}>
        <p>{g.text}</p>
        {!open && <span className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-panel" />}
      </div>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className="mt-4 flex items-center gap-2 self-start font-ui text-[11px] font-semibold tracking-[0.12em] text-accent uppercase">
        {open ? "Minder" : "Lees verder"}
        <ArrowIcon className={`size-3 transition-transform ${open ? "-rotate-45" : "rotate-[135deg]"}`} />
      </button>
    </article>
  );
}

/** Advies van de coaches en veelgestelde vragen. */
export function Advice() {
  return (
    <section id="advies" className="bg-ink py-24">
      <div className="mx-auto max-w-[1400px] px-5">
        <p className="eyebrow">Advies van onze coaches</p>
        <h2 className="mt-5 max-w-2xl text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-medium">
          Kies met <span className="accent">kennis</span>.
        </h2>
        <div className="mt-12 grid items-start gap-4 md:grid-cols-3">
          {GUIDES.map((g) => (
            <Guide key={g.title} g={g} />
          ))}
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Veelgestelde vragen</p>
            <h2 className="mt-5 text-[clamp(30px,3.4vw,48px)] leading-[0.95] font-medium">
              Goed om te <span className="accent">weten</span>.
            </h2>
          </div>
          <ul className="border-t border-fg/10">
            {FAQ.map((f) => (
              <FaqItem key={f.q} {...f} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
