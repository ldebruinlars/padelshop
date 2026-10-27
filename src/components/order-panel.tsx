"use client";

import { useEffect, useRef, useState } from "react";
import { EXTRAS, LESSON_FROM, LESSON_PERK, ON_COURT_PERK, UPSELLS, type Extra } from "@/lib/extras";
import { euro } from "@/lib/site";
import { SOURCES, checkCoachCode, requestOrder, type Source } from "@/lib/shop-api";
import { rememberedCode } from "./code-catcher";

/**
 * Reserveren of bestellen vanaf de racketpagina (ook via de QR-code aan de wand of de iPad op de balie).
 * ?bron=wand|balie|testdag en ?code=COACHCODE worden meegenomen, zodat elke verkoop te herleiden is.
 */
const priceOf = (x: Extra) => (x.price != null ? euro(x.price) : (x.priceText ?? "prijs volgt"));

export function OrderPanel({ racket, interest = false }: { racket: { id: string; label: string; price: number | null }; interest?: boolean }) {
  const [source, setSource] = useState<Source>("web");
  const [code, setCode] = useState("");
  const [coach, setCoach] = useState<{ coach_name: string; discount_pct: number } | null>(null);
  const [codeState, setCodeState] = useState<"idle" | "ok" | "unknown">("idle");
  const [extras, setExtras] = useState<string[]>([]);
  const [lesson, setLesson] = useState(true);
  const lessonOk = racket.price != null && racket.price >= LESSON_FROM;
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const done = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const bron = q.get("bron") as Source | null;
    if (bron && SOURCES.includes(bron)) setSource(bron);
    const c = q.get("code") ?? rememberedCode();
    if (c) {
      setCode(c.toUpperCase());
      verify(c);
    }
  }, []);

  useEffect(() => {
    if (state === "done") done.current?.focus();
  }, [state]);

  const toggle = (id: string) => setExtras((l) => (l.includes(id) ? l.filter((i) => i !== id) : [...l, id]));

  const verify = async (c: string) => {
    if (!c.trim()) {
      setCoach(null);
      return setCodeState("idle");
    }
    const found = await checkCoachCode(c);
    setCoach(found);
    setCodeState(found ? "ok" : "unknown");
  };

  if (state === "done")
    return (
      <div ref={done} tabIndex={-1} role="status" className="rounded-[var(--radius-card)] bg-accent p-6 text-on-accent outline-none">
        <p className="text-2xl font-bold">{interest ? "Je staat op de lijst" : "Hij ligt voor je klaar"}</p>
        <p className="mt-2">
          {interest
            ? `Zodra de ${racket.label} te testen is, hoor je het als eerste.`
            : `We hebben je aanvraag voor de ${racket.label} ontvangen. We nemen contact op om hem mee te geven na je test of te leveren, binnen een week.`}
        </p>
      </div>
    );

  return (
    <form
      className="grid gap-5 rounded-[var(--radius-card)] border border-panel-2 bg-bg p-5 sm:p-6"
      aria-labelledby="bestel-titel"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setState("sending");
        try {
          await requestOrder({
            racketId: racket.id,
            racketLabel: interest ? `${racket.label} (interesse)` : racket.label,
            listPrice: racket.price,
            accessories: extras,
            name: String(data.get("naam") ?? ""),
            email: String(data.get("email") ?? ""),
            phone: String(data.get("telefoon") ?? ""),
            coachCode: codeState === "ok" ? code : "",
            source,
            wantsLesson: interest || !lessonOk ? false : lesson,
          });
          setState("done");
        } catch {
          setState("error");
        }
      }}
    >
      <div>
        <h2 id="bestel-titel" className="text-2xl font-bold">
          {interest ? "Interesse in dit racket?" : "Reserveer dit racket"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {interest ? "Laat je gegevens achter; je hoort als eerste wanneer hij te testen en te bestellen is." : "Alle rackets voor de adviesprijs, met 30 dagen omruilgarantie."}
        </p>
      </div>

      <fieldset hidden={interest}>
        <legend className="label mb-2 text-muted">Erbij nemen?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {UPSELLS.map((x) => {
            const on = extras.includes(x.id);
            return (
              <label key={x.id} className={`flex cursor-pointer flex-col overflow-hidden rounded-[var(--radius-control)] border transition-colors ${on ? "border-accent bg-panel" : "border-panel-2 hover:border-fg/30"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {x.image && <img src={x.image} alt="" loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />}
                <span className="grid flex-1 content-start gap-1 p-3">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-semibold leading-snug">{x.name}</span>
                    <input type="checkbox" className="mt-1 size-4 shrink-0 accent-[var(--color-accent)]" checked={on} onChange={() => toggle(x.id)} />
                  </span>
                  <span className="text-xs text-muted">{x.why}</span>
                  <span className="mt-1 text-sm font-semibold tabular-nums">{priceOf(x)}</span>
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-fg/75">{ON_COURT_PERK}</p>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold">Meer extra&apos;s</summary>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {EXTRAS.map((x) => {
              const on = extras.includes(x.id);
              return (
                <label key={x.id} className={`flex cursor-pointer gap-3 rounded-[var(--radius-control)] border p-3 transition-colors ${on ? "border-accent bg-panel" : "border-panel-2 hover:border-fg/30"}`}>
                  <input type="checkbox" className="mt-1 size-4 accent-[var(--color-accent)]" checked={on} onChange={() => toggle(x.id)} />
                  <span>
                    <span className="flex items-baseline justify-between gap-2 font-semibold">
                      {x.name}
                      <span className="shrink-0 text-xs font-normal text-muted">{priceOf(x)}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">{x.why}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </details>
      </fieldset>

      <label className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] bg-panel p-3 ${interest || !lessonOk ? "hidden" : ""}`}>
        <input type="checkbox" className="mt-1 size-4 accent-[var(--color-accent)]" checked={lesson} onChange={(e) => setLesson(e.target.checked)} />
        <span>
          <span className="font-semibold">Ja, ik wil de inspeel-les</span>
          <span className="mt-0.5 block text-sm text-muted">{LESSON_PERK}. We nemen contact op om een moment te plannen.</span>
        </span>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="label text-muted">Naam</span>
          <input name="naam" required autoComplete="name" className="field" placeholder="Voor- en achternaam" />
        </label>
        <label className="grid gap-2">
          <span className="label text-muted">E-mail</span>
          <input name="email" type="email" required autoComplete="email" className="field" placeholder="naam@voorbeeld.nl" />
        </label>
        <label className="grid gap-2">
          <span className="label text-muted">Telefoon (optioneel)</span>
          <input name="telefoon" type="tel" autoComplete="tel" className="field" placeholder="06 12345678" />
        </label>
        <label className="grid gap-2">
          <span className="label text-muted">Coachcode (optioneel)</span>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setCodeState("idle");
            }}
            onBlur={() => verify(code)}
            className="field uppercase"
            placeholder="Van je coach"
            aria-describedby="code-status"
          />
          <span id="code-status" className="text-xs" aria-live="polite">
            {codeState === "ok" && coach && (
              <span className="text-accent">
                Code van {coach.coach_name}
              </span>
            )}
            {codeState === "unknown" && <span className="text-muted">Deze code kennen we niet. Je kunt gewoon zonder code reserveren.</span>}
          </span>
        </label>
      </div>

      {state === "error" && (
        <p className="rounded-[var(--radius-control)] bg-accent-2 px-4 py-3 text-sm text-on-accent" role="alert">
          Versturen lukte niet. Controleer je verbinding en probeer het opnieuw.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
          {state === "sending" ? "Versturen…" : interest ? "Zet me op de lijst" : racket.price != null ? `Reserveer voor ${euro(racket.price)}` : "Reserveer"}
        </button>
        <a href="/#testcenter" className="btn btn-line">
          Eerst testen
        </a>
      </div>
    </form>
  );
}
