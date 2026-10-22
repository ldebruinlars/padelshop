"use client";

import { useState } from "react";
import { BULLPADEL_SOURCE, FIBRE_SCALE, RUBBER_SCALE } from "@/lib/tech";

function Scale({ title, items }: { title: string; items: { name: string; text: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <h4 className="font-semibold">{title}</h4>
      {/* Van hard (links, oranje) naar comfort (rechts, zand) */}
      <div className="mt-3 h-1.5 rounded-full bg-gradient-to-r from-accent to-accent-2" aria-hidden="true" />
      <div className="mt-1 flex justify-between text-xs text-muted" aria-hidden="true">
        <span>Hard en direct</span>
        <span>Zacht en comfortabel</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={title}>
        {items.map((it, i) => (
          <button key={it.name} type="button" className="chip" aria-pressed={active === i} onClick={() => setActive(i)}>
            {it.name}
          </button>
        ))}
      </div>
      <p className="mt-3 min-h-[3lh] text-fg/80" aria-live="polite">
        <strong className="font-semibold">{items[active].name}:</strong> {items[active].text}
      </p>
    </div>
  );
}

/** Materiaalschalen uit de Bullpadel-catalogus: welke vezel en welk rubber hard of zacht speelt. */
export function MaterialScales() {
  return (
    <div className="mt-14 border-t border-panel-2 pt-10">
      <h3 className="text-2xl font-bold">Van hard naar comfort</h3>
      <p className="mt-2 max-w-[64ch] text-fg/75">
        Het materiaal van slagvlak en kern bepaalt hoe een racket aanvoelt. Zo zet Bullpadel zijn materialen op een rij, van het hardste en meest directe naar het zachtste en meest comfortabele.
      </p>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <Scale title="Slagvlak: de vezels" items={FIBRE_SCALE} />
        <Scale title="Kern: het rubber" items={RUBBER_SCALE} />
      </div>
      <p className="mt-4 text-xs text-muted">
        Bron:{" "}
        <a href={BULLPADEL_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">
          {BULLPADEL_SOURCE.label}
        </a>
        , p.4-5. Andere merken gebruiken eigen namen voor vergelijkbare materialen.
      </p>
    </div>
  );
}
