"use client";

import { useState } from "react";
import type { OwnRacket } from "@/lib/own-line";
import { Model3D } from "./model-3d";

/**
 * Beeld van een eigen racket: groot vlak met een foto (of als laatste keuze het 3D-model), en daaronder miniaturen om te wisselen.
 * Alles past in één schermhoogte, zodat de foto's in beeld blijven terwijl je rechts door de info scrolt.
 */
export function ProductGallery({ r }: { r: OwnRacket }) {
  const shots = [
    { id: "voor", label: "Voorkant", src: r.images.front },
    { id: "schuin", label: "Schuin", src: r.images.angle },
    { id: "achter", label: "Achterkant", src: r.images.back },
    ...(r.model3d ? [{ id: "3d", label: "3D", src: r.images.cutout }] : []),
  ];
  // Eerst de foto's; het 3D-model is een extraatje dat je zelf kiest
  const [pick, setPick] = useState("voor");
  const current = shots.find((s) => s.id === pick)!;

  return (
    <div className="grid gap-3 lg:sticky lg:top-28 lg:self-start">
      <div className={`relative h-[min(62svh,680px)] overflow-hidden rounded-[var(--radius-panel)] lg:h-[calc(100svh-18rem)] ${pick === "3d" ? "bg-paper" : "bg-[#d8d5d1]"}`}>
        {pick === "3d" && r.model3d ? (
          <Model3D key={r.id} src={r.model3d} poster={r.images.cutout} alt={`${r.model} in 3D`} autoStart className="size-full" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.src} alt={`${r.model}, ${current.label.toLowerCase()}`} className="size-full object-contain" />
        )}
        <p className="label pointer-events-none absolute top-3 left-4 text-on-accent/70">{pick === "3d" ? "Concept · sleep om te draaien" : `Concept · ${current.label.toLowerCase()}`}</p>
      </div>
      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Kies een beeld">
        {shots.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={pick === s.id}
            onClick={() => setPick(s.id)}
            className={`relative h-20 overflow-hidden rounded-[var(--radius-control)] border bg-[#e6e3de] transition-colors ${pick === s.id ? "border-accent ring-1 ring-accent" : "border-transparent hover:border-fg/30"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt="" loading="lazy" className={`size-full ${s.id === "3d" ? "object-contain p-1" : "object-cover"}`} />
            <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-0.5 text-center text-[11px] font-semibold text-fg">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
