"use client";

import { useId, useState } from "react";
import { CONFIG } from "@/lib/config";
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
  {
    q: "Wat kost een racket-test?",
    a: "Een Racket Fit met coach duurt 30 minuten: je test 3 rackets op maat en krijgt per racket een eerlijk oordeel. Alleen kost het €30, met z'n tweeën €52,50. Ben je alleen? Kies \"koppel mij\", dan zetten we je bij een andere tester van jouw niveau voor €26,25. Het testgeld betaal je voor de test zelf; het wordt niet verrekend als je daarna een racket koopt.",
  },
  {
    q: "Kan ik ook zonder coach testen?",
    a: "Ja, met het balmachine-uur: 60 minuten, 1 speler, 5 rackets, zonder coach, voor €60. Je boekt vooraf en laat een ID achter zolang je de rackets gebruikt.",
  },
  { q: "Met hoeveel mensen kan ik testen?", a: "Met 1 of 2 personen boek je één slot van 30 minuten. Met 3 of 4 personen boek je twee slots achter elkaar." },
  ...(CONFIG.academy.show
    ? [{ q: `Ik train bij ${CONFIG.academy.name}. Wat kost het voor mij?`, a: "Tijdens je eigen les test je gratis. Wil je een los testslot, dan betaal je €15." }]
    : []),
  { q: "Wanneer betaal ik en tot wanneer kan ik annuleren?", a: "Je betaalt bij het boeken met iDEAL; je plek staat pas vast na betaling. Annuleren is gratis tot 24 uur vooraf." },
  { q: "Geen slot dat past?", a: "Zet je op de wachtlijst met je telefoonnummer en het dagdeel dat jou past. We bellen of appen je zodra er een plek vrijkomt." },
  {
    q: "Krijg ik iets extra als ik direct bestel?",
    a: "Bestel je direct op de baan, dan krijg je een gratis grip-pakket: overgrip en bumper, ter plekke opgezet. Bij rackets vanaf €250 krijg je er een gratis inspeel-les van 30 minuten bij. Alle rackets verkopen we voor de adviesprijs.",
  },
  {
    q: "Kan ik een grip op maat krijgen?",
    a: "Ja. We zetten een overgrip of basisgrip op maat, en halen de Hesacore eraf voor een normale grip als je dat liever hebt. Dat kost €5 tot €10, en is gratis bij een racket dat je op de baan bestelt.",
  },
  {
    q: "Wat als het racket toch niet past?",
    a: "Dan geldt onze omruilgarantie van 30 dagen: past het racket na 30 dagen spelen toch niet, ruil je hem één keer om voor een ander model uit de testrange.",
  },
  {
    q: "Kan ik een online bestelling terugsturen?",
    a: `Ja. Bestel je online, dan heb je volgens de wet ${SHOP.returnDays} dagen bedenktijd om het racket ongebruikt terug te sturen. Dat staat los van de omruilgarantie, die geldt juist als je er al mee gespeeld hebt.`,
  },
  { q: "Hoe snel heb ik mijn racket?", a: "Meteen mee na je test, of binnen een week geleverd." },
  { q: "Wat kost bezorgen?", a: `Vanaf ${euro(SHOP.freeShippingFrom)} bezorgen we gratis. Je kunt je bestelling ook ophalen bij Poort Padel.` },
  { q: "Welke garantie krijg ik?", a: `Op rackets zit ${SHOP.warranty}. Stuur ons een bericht als er iets mis is, dan regelen we het met het merk.` },
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
