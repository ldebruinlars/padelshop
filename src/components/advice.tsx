"use client";

import { useId, useState } from "react";
import { SHOP, euro } from "@/lib/site";
import { PlusIcon } from "./icons";

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
  { q: "Kan ik ook zonder coach testen?", a: `Ja. Kies bij het boeken voor de balmachine: die speelt de ballen aan en jij wisselt zelf van racket, in je eigen tempo. Ook dan krijg je de ${euro(SHOP.testPrice)} terug als je een racket koopt.` },
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
          <span className={`grid size-8 shrink-0 place-items-center rounded-[var(--radius-control)] border border-panel-2 transition-transform duration-300 ${open ? "rotate-45" : ""}`} aria-hidden="true">
            <PlusIcon className="size-3" />
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

// Korte adviesteksten, volledig leesbaar: geen kaarten en geen "lees verder".
function Guide({ g }: { g: (typeof GUIDES)[number] }) {
  return (
    <article className="border-t border-panel-2 pt-5">
      <h3 className="text-xl font-bold">{g.title}</h3>
      <p className="mt-2 max-w-[62ch] text-fg/75">{g.text}</p>
    </article>
  );
}

/** Advies van de coaches en veelgestelde vragen. */
export function Advice() {
  return (
    <section id="advies" className="bg-ink py-24">
      <div className="mx-auto max-w-[1400px] px-5">
        <h2 className="max-w-2xl text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">
          Racketadvies
        </h2>
        <div className="mt-8 grid items-start gap-x-10 gap-y-8 md:grid-cols-3">
          {GUIDES.map((g) => (
            <Guide key={g.title} g={g} />
          ))}
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-[clamp(26px,2.6vw,36px)] leading-[1.05] font-bold">
              Veelgestelde vragen
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
