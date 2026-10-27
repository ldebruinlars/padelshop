"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { brandName, styleColor, type CatalogRacket } from "@/lib/catalog";
import { QUESTIONS, recommend, type Answer } from "@/lib/finder-logic";
import { saveIntake } from "@/lib/intake";
import { track } from "@/lib/track";
import { photoOf } from "@/lib/all-rackets";
import { euro } from "@/lib/site";
import { QuickView } from "./quick-view";
import { RacketArt } from "./racket-art";

/** Racketfinder: acht vragen, daarna drie echte rackets met een match-percentage en waarom ze passen. */
export function Finder() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [open, setOpen] = useState<{ r: CatalogRacket; from: HTMLElement } | null>(null);
  const step = answers.length;
  const done = step >= QUESTIONS.length;
  const result = useMemo(() => (done ? recommend(answers) : null), [done, answers]);

  // Klaar: het advies gaat mee naar de boeking als intake, en telt als quiz_complete
  useEffect(() => {
    if (!result) return;
    saveIntake({
      answers: Object.fromEntries(QUESTIONS.map((q, i) => [q.id, answers[i]?.label ?? ""])),
      rackets: result.picks.map((p) => ({ id: p.r.id, label: `${brandName(p.r.brand)} ${p.r.model}` })),
    });
    track("quiz_complete");
  }, [result, answers]);

  // Na elk antwoord de focus naar de nieuwe vraag of de uitkomst
  const heading = useRef<HTMLHeadingElement>(null);
  const touched = useRef(false);
  useEffect(() => {
    if (touched.current) heading.current?.focus({ preventScroll: true });
    touched.current = true;
  }, [step]);

  const current = QUESTIONS[step];

  // Cijfertoetsen 1-5 kiezen een antwoord, Backspace gaat een vraag terug (alleen als de finder in beeld is)
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select") || !box.current) return;
      const r = box.current.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const n = Number(e.key);
      if (n >= 1 && n <= current.answers.length) setAnswers((l) => [...l, current.answers[n - 1]]);
      if (e.key === "Backspace" && step > 0) setAnswers((l) => l.slice(0, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, current, step]);

  return (
    <section id="finder" className="bg-ink px-4 py-24 md:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">Welk racket past bij jou?</h2>
          <p className="mt-4 max-w-md text-fg/75">
            Negen korte vragen, zoals een verkoper in de winkel ze stelt. Daarna krijg je drie rackets uit onze testrange met de reden waarom ze passen. Die liggen op de baan klaar voor je test.
          </p>
          {!done && (
            <ol className="mt-8 hidden gap-1 text-sm lg:grid" aria-label="Voortgang">
              {QUESTIONS.map((q, i) => (
                <li key={q.id} className={`flex items-baseline justify-between gap-4 border-b border-panel-2 py-2 ${i === step ? "text-fg" : "text-muted"}`}>
                  <span>{q.q}</span>
                  <span className="shrink-0 text-right text-xs">{answers[i]?.label ?? ""}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div ref={box} className="rounded-[var(--radius-panel)] border border-fg/5 bg-bg p-6 md:p-10" aria-live="polite">
          {!done ? (
            <>
              <div className="mb-6 flex gap-1" aria-hidden="true">
                {QUESTIONS.map((q, i) => (
                  <span key={q.id} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-panel-2"}`} />
                ))}
              </div>
              <h3 ref={heading} tabIndex={-1} className="text-3xl font-bold outline-none">
                {current.q}
              </h3>
              <p className="mt-2 text-sm text-muted">{current.help}</p>
              {/* Antwoorden als compacte kaarten; kiezen kan ook met de cijfertoetsen */}
              <div className={`mt-6 grid gap-2 sm:grid-cols-2 ${current.answers.length === 3 ? "xl:grid-cols-3" : ""}`}>
                {current.answers.map((a, i) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => setAnswers((l) => [...l, a])}
                    className="group grid min-h-[84px] grid-cols-[28px_1fr] content-start gap-x-3 rounded-[var(--radius-card)] border border-panel-2 bg-panel/40 p-4 text-left transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-panel active:translate-y-0"
                  >
                    <span className="row-span-2 grid size-7 place-items-center rounded-full border border-panel-2 text-xs font-bold text-fg/60 tabular-nums transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="font-semibold leading-snug">{a.label}</span>
                    {a.hint && <span className="mt-0.5 text-sm text-muted">{a.hint}</span>}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-sm">
                {step > 0 ? (
                  <button type="button" onClick={() => setAnswers((l) => l.slice(0, -1))} className="text-muted underline-offset-4 hover:text-fg hover:underline">
                    Vorige vraag
                  </button>
                ) : (
                  <span />
                )}
                <span className="text-muted tabular-nums">
                  {step + 1} / {QUESTIONS.length}
                </span>
              </div>
            </>
          ) : (
            <>
              <h3 ref={heading} tabIndex={-1} className="text-3xl font-bold outline-none">
                {result?.picks.length ? `${result.picks.length === 1 ? "Dit racket leggen" : `Deze ${result.picks.length === 2 ? "twee" : "drie"} leggen`} we voor je klaar` : "Ons advies"}
              </h3>
              {result?.armFiltered && <p className="mt-2 text-sm text-muted">Vanwege je armklachten tonen we alleen rackets met een zachte of medium kern, lage of midden balans, tot zo&apos;n 365 gram en geen diamantvorm.</p>}
              {result?.junior && (
                <p className="mt-2 text-sm text-muted">
                  {result.picks.length ? "Juniorrackets uit ons assortiment." : "In het merkassortiment hebben we nu geen juniorracket."} Kom langs met je kind: dan kijken we samen naar lengte, gewicht en gripmaat.
                </p>
              )}
              <ul className="mt-6 grid border-t border-panel-2">
                {result?.picks.map(({ r, fit, over, why }) => (
                  <li key={r.id} className="border-b border-panel-2">
                    <button
                      type="button"
                      onClick={(e) => setOpen({ r, from: e.currentTarget })}
                      className="grid w-full grid-cols-[56px_1fr_auto] items-start gap-4 py-4 text-left transition-colors hover:bg-panel/60 sm:grid-cols-[72px_1fr_auto]"
                    >
                      <span className="block h-[84px] rounded-[var(--radius-control)] bg-paper p-1.5 sm:h-[104px]">
                        <RacketArt shape={r.shape} color={styleColor(r.playstyle)} label="" />
                      </span>
                      <span>
                        <span className="label text-accent">{brandName(r.brand)}</span>
                        <span className="mt-1 block text-xl font-bold">{r.model}</span>
                        <span className="mt-1 block text-sm text-muted">
                          {[r.shape, r.weight, r.feel, r.price != null ? euro(r.price) : null].filter(Boolean).join(" · ")}
                          {over && " · net boven je budget"}
                        </span>
                        {why.length > 0 && (
                          <span className="mt-2 flex flex-wrap gap-1.5">
                            {why.map((w) => (
                              <span key={w} className="rounded-[var(--radius-control)] bg-panel px-2 py-1 text-xs text-fg/85 first-letter:uppercase">
                                {w}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                      <span className="text-right">
                        <span className="block font-display text-3xl font-bold text-accent tabular-nums">{fit}%</span>
                        <span className="text-xs text-muted">match</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">Match berekend uit je antwoorden en de specificaties. Het echte gevoel test je op de baan. We raden alleen rackets aan die in de testrange liggen; de andere merken kun je gewoon bestellen.</p>
              {result?.own && (
                <a href={`/rackets/${result.own.id}/`} className="mt-5 flex items-center gap-4 rounded-[var(--radius-card)] border border-panel-2 p-3 transition-colors hover:border-fg/40">
                  <span className="block h-[84px] w-[56px] shrink-0 rounded-[var(--radius-control)] bg-paper p-1">
                    <RacketArt shape={result.own.shape} color={styleColor(result.own.playstyle)} photo={photoOf(result.own)} label="" />
                  </span>
                  <span>
                    <span className="label text-accent">Uit onze eigen lijn · concept</span>
                    <span className="mt-1 block font-bold">{result.own.model}</span>
                    <span className="block text-sm text-muted">Past ook bij je antwoorden. Bekijk hem in 3D en zet je op de lijst.</span>
                  </span>
                </a>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                <a href="#testcenter" className="btn btn-primary">
                  Boek een test met deze drie
                </a>
                <button type="button" className="btn btn-line" onClick={() => setAnswers([])}>
                  Opnieuw beginnen
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <QuickView
        racket={open?.r ?? null}
        from={open?.from ?? null}
        list={result?.picks.map((p) => p.r)}
        onChange={(r) => setOpen((o) => (o ? { ...o, r } : o))}
        onClose={() => setOpen(null)}
      />
    </section>
  );
}
