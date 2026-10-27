"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CATALOG_RACKETS, brandName, encode, ratings, styleColor, type CatalogRacket, type Level } from "@/lib/catalog";
import { OWN_RACKETS } from "@/lib/own-line";
import { photoOf } from "@/lib/all-rackets";
import { euro } from "@/lib/site";
import { QuickView } from "./quick-view";
import { RacketArt } from "./racket-art";

/**
 * Racketfinder naar het voorbeeld van echte finders (o.a. Central Sports, Express Padel, Decathlon, PadelGear, Tennis
 * Warehouse, Padelful): elk antwoord zet een doel en een gewicht per eigenschap. Vorm (s), balans (b), hardheid (h), slagvlak (f) en
 * gewicht (w) staan op 0-1 (zie encode in catalog.ts). Armklachten en budget filteren hard.
 */
type Key = "s" | "b" | "h" | "f" | "w";
type Answer = {
  label: string;
  hint?: string;
  target?: Partial<Record<Key, [number, number]>>; // [doel, gewicht]
  level?: Level;
  maxPrice?: number;
  arm?: "soms" | "nu";
  comfort?: number; // extra gewicht voor comfort
  junior?: boolean;
};
type Question = { id: string; q: string; help: string; answers: Answer[] };

const QUESTIONS: Question[] = [
  {
    id: "niveau",
    q: "Hoe lang speel je al?",
    help: "De belangrijkste vraag: je niveau bepaalt vorm, hardheid en slagvlak.",
    answers: [
      { label: "Net begonnen", hint: "korter dan een jaar", level: "Beginner", target: { s: [0.1, 2], h: [0.25, 1.5], f: [0.2, 1.5], b: [0.2, 1] } },
      { label: "Regelmatig, gemiddeld niveau", hint: "1 tot 3 jaar", level: "Gemiddeld", target: { s: [0.5, 1], h: [0.5, 1], f: [0.5, 0.8] } },
      { label: "Gevorderd of competitie", hint: "toernooien, competitie", level: "Gevorderd", target: { h: [0.75, 0.8], f: [0.7, 1] } },
      { label: "Het is voor een kind", hint: "8 tot 13 jaar", level: "Beginner", junior: true, target: { s: [0, 2], h: [0, 2], f: [0, 1.5], w: [0, 2] } },
    ],
  },
  {
    id: "kant",
    q: "Aan welke kant van de baan speel je?",
    help: "Links staat vaak de afmaker met de smash, rechts de speler die opbouwt en verdedigt.",
    answers: [
      { label: "Links", hint: "afmaken, smashen", target: { s: [0.85, 0.7], b: [0.8, 0.5] } },
      { label: "Rechts", hint: "opbouwen, plaatsen", target: { s: [0.3, 0.7], b: [0.3, 0.5] } },
      { label: "Wisselt / geen vaste kant" },
    ],
  },
  {
    id: "stijl",
    q: "Hoe speel je het liefst?",
    help: "Je speelstijl kiest vooral de vorm en de balans.",
    answers: [
      { label: "Verdedigend en plaatsen", hint: "lobs, lange rally's", target: { s: [0, 2], b: [0, 1.5] } },
      { label: "Een beetje van alles", hint: "allround", target: { s: [0.5, 2], b: [0.5, 1.5] } },
      { label: "Aanvallend en smashen", hint: "aan het net, afmaken", target: { s: [1, 2], b: [1, 1.5] } },
    ],
  },
  {
    id: "arm",
    q: "Heb je last van je elleboog, pols of schouder?",
    help: "Bij klachten nu vallen harde, kopzware en diamantvormige rackets af.",
    answers: [
      { label: "Nee" },
      { label: "Soms, of vroeger", arm: "soms", comfort: 1.5, target: { b: [0.25, 1] } },
      { label: "Ja, op dit moment", arm: "nu", comfort: 3 },
    ],
  },
  {
    id: "gevoel",
    q: "Welk gevoel wil je bij de slag?",
    help: "Dit gaat over de kern: zacht rubber of foam, of hard EVA.",
    answers: [
      { label: "Zacht, de bal schiet er makkelijk uit", target: { h: [0.1, 2] } },
      { label: "Weet ik niet / gemiddeld", target: { h: [0.5, 0.8] } },
      { label: "Hard en direct", hint: "meer controle bij harde slagen", target: { h: [0.9, 2] } },
    ],
  },
  {
    id: "bouw",
    q: "Hoe zou je je bouw en kracht omschrijven?",
    help: "Het racketgewicht hangt vooral af van je bouw: een te zwaar racket wordt laat in de wedstrijd traag en belast je arm.",
    answers: [
      { label: "Licht gebouwd of weinig kracht", hint: "± 340-355 g", target: { w: [0.1, 1.5] } },
      { label: "Gemiddeld", hint: "± 355-365 g", target: { w: [0.45, 1] } },
      { label: "Sterk, ik sla graag hard", hint: "± 365-380 g", target: { w: [0.85, 1.5] } },
    ],
  },
  {
    id: "vaak",
    q: "Hoe vaak speel je?",
    help: "Vaker spelen vraagt om een duurzamer slagvlak en meer comfort.",
    answers: [
      { label: "Een keer per week of minder", target: { f: [0.3, 0.6] } },
      { label: "Twee tot drie keer per week" },
      { label: "Vier keer of meer", target: { f: [0.7, 0.6] }, comfort: 1 },
    ],
  },
  {
    id: "budget",
    q: "Wat wil je ongeveer uitgeven?",
    help: "Rackets net boven je budget tonen we ook, met een melding.",
    answers: [
      { label: "Tot € 100", maxPrice: 100 },
      { label: "Tot € 175", maxPrice: 175 },
      { label: "Tot € 250", maxPrice: 250 },
      { label: "Tot € 350", maxPrice: 350 },
      { label: "Maakt niet uit" },
    ],
  },
  {
    id: "wens",
    q: "Wat wil je anders dan nu?",
    help: "Zo houden we rekening met je huidige racket.",
    answers: [
      { label: "Dit wordt mijn eerste racket" },
      { label: "Meer kracht", target: { s: [0.8, 0.8], b: [0.8, 0.8] } },
      { label: "Meer controle", target: { s: [0.2, 0.8], b: [0.2, 0.8] } },
      { label: "Minder armklachten", arm: "soms", comfort: 1.5 },
    ],
  },
];

type Pick = { r: CatalogRacket; fit: number; over: boolean; why: string[] };

/** Hoe ver een racket van de doelen af zit (0 = perfect). */
function missFor(r: CatalogRacket, goal: Partial<Record<Key, { t: number; w: number }>>, comfortWeight: number, level?: Level) {
  const e = encode(r);
  let miss = 0;
  for (const [k, g] of Object.entries(goal) as [Key, { t: number; w: number }][]) miss += g.w * Math.abs(g.t - e[k]);
  miss += comfortWeight * Math.max(0, (8 - ratings(r).find((x) => x.id === "comfort")!.value) / 5);
  if (level && r.level !== level) miss += 1.5 * 0.6;
  return miss;
}

function recommend(answers: Answer[]): { picks: Pick[]; armFiltered: boolean; junior: boolean; own: CatalogRacket | null } {
  const maxPrice = answers.find((a) => a.maxPrice)?.maxPrice;
  const level = answers.find((a) => a.level)?.level;
  const armNow = answers.some((a) => a.arm === "nu");
  const comfortWeight = answers.reduce((n, a) => n + (a.comfort ?? 0), 0);
  // Doelen per eigenschap: gewogen gemiddelde van alle antwoorden
  const goal: Partial<Record<Key, { t: number; w: number }>> = {};
  for (const a of answers)
    for (const [k, [t, w]] of Object.entries(a.target ?? {}) as [Key, [number, number]][]) {
      const g = goal[k] ?? { t: 0, w: 0 };
      goal[k] = { t: (g.t * g.w + t * w) / (g.w + w), w: g.w + w };
    }
  // Beginners: geen diamant of zware kop, ook als ze graag aanvallen
  if (level === "Beginner") {
    if (goal.s) goal.s.t = Math.min(goal.s.t, 0.4);
    if (goal.b) goal.b.t = Math.min(goal.b.t, 0.4);
  }

  const junior = answers.some((a) => a.junior);
  // Kinderen: alleen rackets onder de 330 gram (juniormodellen)
  let pool = junior ? CATALOG_RACKETS.filter((r) => encode(r).grams < 330) : CATALOG_RACKETS;
  // Armvriendelijk volgens de gidsen: zachte kern, geen stijf carbon, lage of midden balans, geen diamant, niet zwaar
  const armSafe = (r: CatalogRacket) => {
    const e = encode(r);
    return e.h <= 0.5 && e.f <= 0.6 && e.b <= 0.5 && e.s < 1 && e.grams <= 366;
  };
  let armFiltered = false;
  if (armNow) {
    const safe = pool.filter(armSafe);
    if (safe.length >= 3) {
      pool = safe;
      armFiltered = true;
    }
  }
  if (maxPrice) {
    const within = pool.filter((r) => r.price != null && r.price <= maxPrice * 1.1);
    if (within.length >= 3) pool = within;
  }

  const totalW = Object.values(goal).reduce((n, g) => n + (g?.w ?? 0), 0) + comfortWeight + (level ? 1.5 : 0);
  const wish = answers.find((a) => QUESTIONS.find((q) => q.id === "wens")!.answers.includes(a))?.label;
  const scored = pool.map((r) => {
    const e = encode(r);
    const miss = missFor(r, goal, comfortWeight, level);
    const rt = ratings(r);
    const val = (id: string) => rt.find((x) => x.id === id)!.value;
    const fit = Math.round(100 - (100 * miss) / Math.max(1, totalW));
    // Mogelijke redenen; prioriteit 0 = altijd tonen als het van toepassing is
    const why: { key: string; text: string; prio: number }[] = [];
    if (comfortWeight) why.push({ key: "comfort", text: `Armvriendelijk: comfort ${val("comfort").toFixed(1)}`, prio: 0 });
    if (wish === "Meer kracht") why.push({ key: "wish", text: `Meer kracht: ${val("power").toFixed(1)}`, prio: 0 });
    if (wish === "Meer controle") why.push({ key: "wish", text: `Meer controle: ${val("control").toFixed(1)}`, prio: 0 });
    if (level && r.level === level) why.push({ key: "level", text: `Voor niveau ${level.toLowerCase()}`, prio: 1 });
    if (goal.s && Math.abs(goal.s.t - e.s) < 0.3 && r.shape) why.push({ key: `shape-${r.shape}`, text: `${r.shape}, past bij je spel`, prio: 1 });
    if (goal.h && Math.abs(goal.h.t - e.h) < 0.3 && r.feel) why.push({ key: `feel-${r.feel}`, text: `${r.feel} gevoel`, prio: 1 });
    if (goal.b && Math.abs(goal.b.t - e.b) < 0.3 && r.balance) why.push({ key: `bal-${r.balance}`, text: `Balans ${r.balance}`, prio: 1 });
    if (goal.w && Math.abs(goal.w.t - e.w) < 0.3 && r.weight) why.push({ key: `w-${r.weight}`, text: `Gewicht ${r.weight}`, prio: 1 });
    if (maxPrice && r.price != null && r.price <= maxPrice) why.push({ key: "budget", text: `${euro(r.price)}, binnen je budget`, prio: 1 });
    why.push({ key: `handling`, text: `Wendbaarheid ${val("handling").toFixed(1)}`, prio: 2 });
    why.push({ key: `sweet`, text: `Sweet spot ${val("sweetspot").toFixed(1)}`, prio: 2 });
    return { r, fit: Math.max(1, Math.min(99, fit)), over: Boolean(maxPrice && r.price != null && r.price > maxPrice), reasons: why };
  });
  scored.sort((a, b) => b.fit - a.fit || (a.r.price ?? 0) - (b.r.price ?? 0));
  const top = scored.slice(0, 3);
  // Per racket de redenen die hem onderscheiden: eerst de vaste (armklachten, je wens), dan wat de andere twee niet hebben
  const shared = (key: string) => top.filter((p) => p.reasons.some((x) => x.key === key)).length;
  const picks: Pick[] = top.map(({ r, fit, over, reasons }) => ({
    r,
    fit,
    over,
    why: [...reasons]
      .sort((a, b) => a.prio - b.prio || shared(a.key) - shared(b.key))
      .slice(0, 3)
      .map((x) => x.text),
  }));
  // Beste match uit de eigen lijn (concept), los van de drie die we klaarleggen
  const ownPool = OWN_RACKETS.filter((r) => (junior ? encode(r).grams < 330 : encode(r).grams >= 330) && (!armNow || armSafe(r)));
  const own = ownPool.sort((a, b) => missFor(a, goal, comfortWeight, level) - missFor(b, goal, comfortWeight, level))[0] ?? null;
  return { picks, armFiltered, junior, own };
}

/** Racketfinder: acht vragen, daarna drie echte rackets met een match-percentage en waarom ze passen. */
export function Finder() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [open, setOpen] = useState<{ r: CatalogRacket; from: HTMLElement } | null>(null);
  const step = answers.length;
  const done = step >= QUESTIONS.length;
  const result = useMemo(() => (done ? recommend(answers) : null), [done, answers]);

  // Na elk antwoord de focus naar de nieuwe vraag of de uitkomst
  const heading = useRef<HTMLHeadingElement>(null);
  const touched = useRef(false);
  useEffect(() => {
    if (touched.current) heading.current?.focus({ preventScroll: true });
    touched.current = true;
  }, [step]);

  const current = QUESTIONS[step];

  return (
    <section id="finder" className="bg-ink px-4 py-24 md:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">Welk racket past bij jou?</h2>
          <p className="mt-4 max-w-md text-fg/75">
            Negen korte vragen, zoals een verkoper in de winkel ze stelt. Daarna krijg je drie rackets uit ons assortiment met de reden waarom ze passen. Die kun je meteen testen.
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

        <div className="rounded-[var(--radius-panel)] border border-fg/5 bg-bg p-6 md:p-10" aria-live="polite">
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
              <div className="mt-6 grid gap-2">
                {current.answers.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => setAnswers((l) => [...l, a])}
                    className="flex items-baseline justify-between gap-4 rounded-[var(--radius-control)] border border-panel-2 px-5 py-4 text-left text-lg transition-colors hover:border-accent hover:bg-panel"
                  >
                    {a.label}
                    {a.hint && <span className="text-sm text-muted">{a.hint}</span>}
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
              <p className="mt-3 text-xs text-muted">Match berekend uit je antwoorden en de specificaties. Het echte gevoel test je op de baan.</p>
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
                  Test deze drie
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
