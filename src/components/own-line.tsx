"use client";

import { useState } from "react";
import { PLAYSTYLES, ratings } from "@/lib/catalog";
import { OWN_RACKETS } from "@/lib/own-line";
import { Model3D } from "./model-3d";
import { ProfileBar } from "./racket-card";

/** Racket Lab eigen lijn: vier eigen ontwerpen, het gekozen racket draait in 3D. */
export function OwnLine() {
  const [i, setI] = useState(0);
  const r = OWN_RACKETS[i];
  return (
    <section id="eigen-lijn" aria-labelledby="eigen-lijn-titel" className="border-b border-panel-2 bg-bg">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-panel-2 pb-6">
          <div>
            <h2 id="eigen-lijn-titel" className="text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">
              Racket Lab eigen lijn
            </h2>
            <p className="mt-3 max-w-[60ch] text-fg/75">Vier eigen ontwerpen, één per speelstijl. Ze zijn nog in ontwikkeling: draai ze rond in 3D en zet je op de lijst om ze als eerste te testen.</p>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Kies een racket">
            {OWN_RACKETS.map((x, n) => (
              <button key={x.id} type="button" role="tab" aria-selected={n === i} className="chip" onClick={() => setI(n)}>
                {x.model}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative rounded-[var(--radius-panel)] bg-paper">
            {r.model3d ? (
              <Model3D key={r.id} src={r.model3d} poster={r.images.cutout} alt={`${r.model} in 3D`} autoStart className="mx-auto aspect-[4/5] max-h-[70svh] w-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.images.cutout} alt={r.model} className="mx-auto aspect-[4/5] max-h-[70svh] object-contain p-8" />
            )}
            <p className="label pointer-events-none absolute top-3 left-4 text-on-accent/70">Concept · sleep om te draaien</p>
          </div>

          <div role="tabpanel" aria-live="polite">
            <p className="label text-accent">
              {PLAYSTYLES.find((p) => p.id === r.playstyle)?.label} · {r.shape}
            </p>
            <h3 className="mt-2 text-[clamp(32px,3.6vw,52px)] leading-[0.95] font-bold">{r.model}</h3>
            <p className="mt-3 text-lg text-fg/80">{r.tagline}.</p>
            <p className="mt-3 max-w-[56ch] text-fg/70">{r.description}</p>
            <div className="mt-6 grid gap-2.5">
              {ratings(r).map((x) => (
                <ProfileBar key={x.id} label={x.label} value={x.value} color={x.color} wide />
              ))}
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-3">
              {(
                [
                  ["Gewicht", r.weight],
                  ["Balans", r.balance],
                  ["Kern", r.core],
                  ["Slagvlak", r.face],
                  ["Hardheid", r.feel],
                  ["Niveau", r.level],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="border-b border-panel-2 py-2">
                  <dt className="label text-muted">{k}</dt>
                  <dd className="mt-0.5 first-letter:uppercase">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={`/rackets/${r.id}/`} className="btn btn-primary">
                Bekijk en zet me op de lijst
              </a>
            </div>
            <p className="mt-3 text-xs text-muted">Ontwerpdoelen, nog geen geproduceerd racket. Eigenschappen geschat uit die specificaties.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
