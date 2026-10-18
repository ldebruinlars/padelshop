"use client";

import { useState } from "react";
import { RACKETS, STYLES, type Style } from "@/lib/site";
import { ArrowIcon } from "./icons";

type Answer = { label: string; score: Partial<Record<Style, number>> };
const QUESTIONS: { q: string; answers: Answer[] }[] = [
  {
    q: "Hoe lang speel je al padel?",
    answers: [
      { label: "Net begonnen", score: { licht: 3, control: 1 } },
      { label: "1 tot 3 jaar", score: { allround: 2, control: 2 } },
      { label: "Langer, ik speel competitie", score: { power: 2, allround: 1 } },
    ],
  },
  {
    q: "Wat is jouw favoriete slag?",
    answers: [
      { label: "Smash, hard over het glas", score: { power: 3 } },
      { label: "Lob en plaatsen", score: { control: 3 } },
      { label: "Een beetje van alles", score: { allround: 3 } },
    ],
  },
  {
    q: "Heb je last van je arm of elleboog?",
    answers: [
      { label: "Ja, soms", score: { licht: 2, control: 1 } },
      { label: "Nee", score: { power: 1, allround: 1 } },
    ],
  },
];

/** Racketfinder: drie vragen, daarna advies per speelstijl met een link naar het testcenter. */
export function Finder() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<Style, number>>({ power: 0, control: 0, allround: 0, licht: 0 });

  const done = step >= QUESTIONS.length;
  const best = (Object.entries(scores) as [Style, number][]).sort((a, b) => b[1] - a[1])[0][0];
  const style = STYLES.find((s) => s.id === best)!;
  const picks = [...RACKETS].sort((a, b) => Number(b.style === best) - Number(a.style === best)).slice(0, 3);

  function answer(a: Answer) {
    setScores((s) => {
      const next = { ...s };
      for (const [k, v] of Object.entries(a.score) as [Style, number][]) next[k] += v;
      return next;
    });
    setStep((n) => n + 1);
  }

  return (
    <section id="finder" className="bg-ink px-5 py-28">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">Racketfinder</p>
          <h2 className="mt-5 text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-medium">
            Welk racket <span className="accent">past</span> bij jou?
          </h2>
          <p className="mt-5 max-w-md text-white/70">Drie vragen, dan weet je welke speelstijl bij je past. De rackets die eruit komen, kun je daarna testen.</p>
        </div>

        <div className="rounded-[var(--radius-panel)] border border-white/5 bg-navy p-6 md:p-10" aria-live="polite">
          {!done ? (
            <>
              <div className="mb-6 flex gap-1.5" aria-hidden="true">
                {QUESTIONS.map((_, i) => (
                  <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-lime" : "bg-navy-3"}`} />
                ))}
              </div>
              <p className="font-ui text-[11px] font-semibold tracking-[0.14em] text-mist uppercase">
                Vraag {step + 1} van {QUESTIONS.length}
              </p>
              <h3 className="mt-3 text-3xl font-medium">{QUESTIONS[step].q}</h3>
              <div className="mt-6 grid gap-2">
                {QUESTIONS[step].answers.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => answer(a)}
                    className="group flex items-center justify-between rounded-full border border-navy-3 px-6 py-4 text-left text-lg transition-colors hover:border-lime hover:bg-navy-2"
                  >
                    {a.label}
                    <ArrowIcon className="size-3 text-lime transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="font-ui text-[11px] font-semibold tracking-[0.14em] text-mist uppercase">Jouw speelstijl</p>
              <h3 className="mt-3 text-5xl font-semibold" style={{ color: style.color }}>
                {style.label}
              </h3>
              <p className="mt-2 text-white/70">{style.tagline}. Deze rackets leggen we voor je klaar:</p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                {picks.map((r) => (
                  <li key={r.id} className="rounded-2xl bg-navy-2 p-4">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-sm text-mist">
                      {r.shape} · € {r.price}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#testcenter" className="flex items-center gap-3 rounded-full bg-lime py-2 pr-2 pl-5 font-semibold text-navy">
                  Test deze drie
                  <span className="grid size-8 place-items-center rounded-full bg-navy">
                    <ArrowIcon className="size-3 text-lime" />
                  </span>
                </a>
                <button
                  type="button"
                  className="rounded-full border border-navy-3 px-5 py-2 text-mist hover:text-white"
                  onClick={() => {
                    setStep(0);
                    setScores({ power: 0, control: 0, allround: 0, licht: 0 });
                  }}
                >
                  Opnieuw
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
