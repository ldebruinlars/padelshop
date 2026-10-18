"use client";

import { useEffect, useRef, useState } from "react";
import { RACKETS, STYLES, type Style } from "@/lib/site";
import { ArrowIcon } from "./icons";

type Answer = { label: string; score: Partial<Record<Style, number>>; maxPrice?: number };
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
      { label: "Ja, soms", score: { licht: 3, control: 2, power: -2 } },
      { label: "Nee", score: { power: 1, allround: 1 } },
    ],
  },
  {
    q: "Wat wil je ongeveer uitgeven?",
    answers: [
      { label: "Tot € 150", score: {}, maxPrice: 150 },
      { label: "Tot € 250", score: {}, maxPrice: 250 },
      { label: "Maakt niet uit", score: {} },
    ],
  },
];

/** Racketfinder: vier vragen, daarna advies per speelstijl met een link naar het testcenter. */
export function Finder() {
  // Antwoorden als lijst, zodat "Vorige" een stap terug kan.
  const [answers, setAnswers] = useState<Answer[]>([]);
  const step = answers.length;
  const done = step >= QUESTIONS.length;

  const scores: Record<Style, number> = { power: 0, control: 0, allround: 0, licht: 0 };
  for (const a of answers) for (const [k, v] of Object.entries(a.score) as [Style, number][]) scores[k] += v;
  // Bij gelijke stand kiezen we de veiligste stijl voor de arm.
  const SAFE_ORDER: Style[] = ["licht", "control", "allround", "power"];
  const best = [...SAFE_ORDER].sort((a, b) => scores[b] - scores[a] || SAFE_ORDER.indexOf(a) - SAFE_ORDER.indexOf(b))[0];
  const style = STYLES.find((s) => s.id === best)!;
  const armFriendly = best === "licht" || best === "control";

  // Alleen testbare rackets binnen budget (tenzij er dan niets overblijft); eerst de eigen stijl,
  // daarna wat er qua karakter het dichtst bij ligt.
  const maxPrice = answers.find((a) => a.maxPrice)?.maxPrice;
  const testable = RACKETS.filter((r) => r.testable);
  const inBudget = maxPrice ? testable.filter((r) => r.price <= maxPrice) : testable;
  const picks = (inBudget.length ? inBudget : testable)
    .sort((a, b) => {
      const own = Number(b.style === best) - Number(a.style === best);
      if (own) return own;
      return armFriendly ? b.control - a.control : b.power - a.power;
    })
    .slice(0, 3);

  const answer = (a: Answer) => setAnswers((list) => [...list, a]);

  // Na elk antwoord de focus naar de nieuwe vraag of de uitkomst, zodat toetsenbordgebruikers niet kwijtraken.
  const heading = useRef<HTMLHeadingElement>(null);
  const touched = useRef(false);
  useEffect(() => {
    if (touched.current) heading.current?.focus();
    touched.current = true;
  }, [step]);

  return (
    <section id="finder" className="bg-ink px-5 py-28">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">Racketfinder</p>
          <h2 className="mt-5 text-[clamp(36px,4.6vw,64px)] leading-[0.95] font-medium">
            Welk racket <span className="accent">past</span> bij jou?
          </h2>
          <p className="mt-5 max-w-md text-fg/70">Vier vragen, dan weet je welke speelstijl bij je past en welke rackets binnen je budget vallen. Die kun je daarna testen.</p>
        </div>

        <div className="rounded-[var(--radius-panel)] border border-fg/5 bg-bg p-6 md:p-10" aria-live="polite">
          {!done ? (
            <>
              <div className="mb-6 flex gap-1.5" aria-hidden="true">
                {QUESTIONS.map((_, i) => (
                  <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-panel-2"}`} />
                ))}
              </div>
              <p className="font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                Vraag {step + 1} van {QUESTIONS.length}
              </p>
              <h3 ref={heading} tabIndex={-1} className="mt-3 text-3xl font-medium outline-none">{QUESTIONS[step].q}</h3>
              <div className="mt-6 grid gap-2">
                {QUESTIONS[step].answers.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => answer(a)}
                    className="group flex items-center justify-between rounded-full border border-panel-2 px-6 py-4 text-left text-lg transition-colors hover:border-accent hover:bg-panel"
                  >
                    {a.label}
                    <ArrowIcon className="size-3 text-accent transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button type="button" onClick={() => setAnswers((list) => list.slice(0, -1))} className="mt-4 text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
                  Vorige vraag
                </button>
              )}
            </>
          ) : (
            <>
              <p className="font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Jouw speelstijl</p>
              <h3 ref={heading} tabIndex={-1} className="mt-3 text-5xl font-semibold outline-none" style={{ color: style.color }}>
                {style.label}
              </h3>
              <p className="mt-2 text-fg/70">{style.tagline}. Deze rackets leggen we voor je klaar:</p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                {picks.map((r) => (
                  <li key={r.id} className="rounded-2xl bg-panel p-4">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-sm text-muted">
                      {r.shape} · € {r.price}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#testcenter" className="flex items-center gap-3 rounded-full bg-accent py-2 pr-2 pl-5 font-semibold text-on-accent">
                  Test deze drie
                  <span className="grid size-8 place-items-center rounded-full bg-bg">
                    <ArrowIcon className="size-3 text-accent" />
                  </span>
                </a>
                <button
                  type="button"
                  className="rounded-full border border-panel-2 px-5 py-2 text-muted hover:text-fg"
                  onClick={() => setAnswers([])}
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
