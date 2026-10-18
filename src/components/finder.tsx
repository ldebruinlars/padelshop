"use client";

import { useEffect, useRef, useState } from "react";
import { CATALOG_RACKETS, brandName, profile, type Level } from "@/lib/catalog";
import { STYLES, euro, type Style } from "@/lib/site";

type Answer = { label: string; score: Partial<Record<Style, number>>; maxPrice?: number; level?: Level };
const QUESTIONS: { q: string; answers: Answer[] }[] = [
  {
    q: "Hoe lang speel je al padel?",
    answers: [
      { label: "Net begonnen", score: { licht: 3, control: 1 }, level: "Beginner" },
      { label: "1 tot 3 jaar", score: { allround: 2, control: 2 }, level: "Gemiddeld" },
      { label: "Langer, ik speel competitie", score: { power: 2, allround: 1 }, level: "Gevorderd" },
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

  // Rackets binnen budget (tenzij er dan niets overblijft), gerangschikt op speelstijl, niveau en armvriendelijkheid.
  const maxPrice = answers.find((a) => a.maxPrice)?.maxPrice;
  const level = answers.find((a) => a.level)?.level;
  const inBudget = maxPrice ? CATALOG_RACKETS.filter((r) => r.price != null && r.price <= maxPrice) : CATALOG_RACKETS;
  const fit = (r: (typeof CATALOG_RACKETS)[number]) =>
    (best === "licht" ? (r.feel === "zacht" ? 3 : 0) + (r.playstyle === "control" ? 1 : 0) : r.playstyle === best ? 3 : 0) +
    (level && r.level === level ? 2 : 0) +
    (armFriendly && r.feel === "hard" ? -2 : 0) +
    (armFriendly ? profile(r).control : profile(r).power) / 10;
  const picks = [...(inBudget.length ? inBudget : CATALOG_RACKETS)].sort((a, b) => fit(b) - fit(a)).slice(0, 3);

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
          <h2 className="text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">
            Welk racket past bij jou?
          </h2>
          <p className="mt-5 max-w-md text-fg/70">Vier vragen, dan weet je welke speelstijl bij je past en welke rackets binnen je budget vallen. Die kun je daarna testen.</p>
        </div>

        <div className="rounded-[var(--radius-panel)] border border-fg/5 bg-bg p-6 md:p-10" aria-live="polite">
          {!done ? (
            <>
              <div className="mb-6 flex gap-1.5" aria-hidden="true">
                {QUESTIONS.map((_, i) => (
                  <span key={i} aria-hidden="true" className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-panel-2"}`} />
                ))}
              </div>
              <h3 ref={heading} tabIndex={-1} className="text-3xl font-medium outline-none">{QUESTIONS[step].q}</h3>
              <div className="mt-6 grid gap-2">
                {QUESTIONS[step].answers.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => answer(a)}
                    className="group flex items-center justify-between rounded-[var(--radius-control)] border border-panel-2 px-6 py-4 text-left text-lg transition-colors hover:border-accent hover:bg-panel"
                  >
                    {a.label}
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
              <p className="label text-muted">Jouw speelstijl</p>
              <h3 ref={heading} tabIndex={-1} className="mt-3 text-5xl font-semibold outline-none" style={{ color: style.color }}>
                {style.label}
              </h3>
              <p className="mt-2 text-fg/70">{style.tagline}. Deze rackets leggen we voor je klaar:</p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                {picks.map((r) => (
                  <li key={r.id} className="rounded-[var(--radius-card)] bg-panel p-4">
                    <div className="label text-accent">{brandName(r.brand)}</div>
                    <div className="mt-1 font-semibold">{r.model}</div>
                    <div className="text-sm text-muted">
                      {r.shape}
                      {r.price != null && ` · ${euro(r.price)}`}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#testcenter" className="btn btn-primary">
                  Test deze drie
                </a>
                <button
                  type="button"
                  className="rounded-[var(--radius-control)] border border-panel-2 px-5 py-2 text-muted hover:text-fg"
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
