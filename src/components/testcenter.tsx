"use client";

import { useEffect, useRef, useState } from "react";
import { MEDIA, SITE } from "@/lib/site";
import { ArrowIcon } from "./icons";
import { RevealPanel } from "./reveal-panel";

// Voorbeelddata: later koppelen aan een echte agenda (bijv. Cal.com of Playtomic).
const COACHES = [
  { id: "any", name: "Eerste beschikbare coach" },
  { id: "c1", name: "Coach Sanne" },
  { id: "c2", name: "Coach Daan" },
];
const TIMES = ["09:00", "09:45", "10:30", "11:15", "13:00", "13:45", "14:30", "17:00", "17:45", "18:30", "19:15", "20:00"];
// Voorbeeld: per dag een paar bezette tijden, tot er een echte agenda gekoppeld is.
function takenFor(day: string) {
  const seed = [...day].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  return new Set(TIMES.filter((_, i) => (i * 7 + seed) % 5 === 0));
}
const PRICE = 29.95;

function nextDays(n: number) {
  const fmt = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short" });
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return { key: d.toISOString().slice(0, 10), label: fmt.format(d) };
  });
}

/** Testcenter: vast tijdslot met coach boeken, plus het thuistest-pakket. */
export function Testcenter() {
  // Datums pas in de browser berekenen, zodat server en client hetzelfde renderen.
  const [days, setDays] = useState<{ key: string; label: string }[]>([]);
  const [day, setDay] = useState("");
  useEffect(() => {
    const d = nextDays(6);
    setDays(d);
    setDay(d[0].key);
  }, []);
  const [time, setTime] = useState<string | null>(null);
  const [coach, setCoach] = useState("any");
  const [booked, setBooked] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const confirmRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const touched = useRef(false);
  // Focus naar de bevestiging na boeken, en terug naar het formulier bij "Ander moment kiezen".
  useEffect(() => {
    if (!touched.current) {
      touched.current = true;
      return;
    }
    if (booked) confirmRef.current?.focus();
    else formRef.current?.querySelector<HTMLButtonElement>("button[aria-pressed=true]")?.focus();
  }, [booked]);

  return (
    <RevealPanel id="testcenter" className="bg-bg">
      <div className="grid lg:grid-cols-[1fr_1.1fr]">
        <div className="relative min-h-[420px] bg-[radial-gradient(circle_at_40%_40%,var(--color-panel-2),var(--color-bg))]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" decoding="async" src={MEDIA.coach} alt="Coach geeft een testracket aan een speler bij Poort Padel" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-2 p-4 sm:p-8">
            {[
              ["45 min", "op de baan"],
              ["3 tot 5", "rackets voor jouw stijl"],
              ["€ 29,95", "terug bij aankoop"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-2xl border border-fg/10 bg-bg/85 p-3 sm:p-4">
                <div className="text-lg font-semibold tracking-tight sm:text-2xl">{a}</div>
                <div className="text-xs text-muted sm:text-sm">{b}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-12">
          <p className="eyebrow">Testcenter · {SITE.location}</p>
          <h2 className="mt-5 text-[clamp(34px,4vw,56px)] leading-[0.95] font-medium">
            Boek je <span className="accent">racket-test</span>.
          </h2>
          <p className="mt-4 max-w-md text-fg/70">
            Een coach van All Court Academy kijkt naar je slagen en legt rackets klaar die bij je passen. Koop je daarna een racket, dan krijg je de € {PRICE.toFixed(2).replace(".", ",")} terug.
          </p>

          {booked ? (
            <div ref={confirmRef} tabIndex={-1} className="mt-8 rounded-[var(--radius-card)] bg-accent p-6 text-on-accent outline-none" role="status">
              <p className="font-ui text-[11px] font-semibold tracking-[0.14em] uppercase">Aanvraag ontvangen</p>
              <p className="mt-2 text-2xl font-semibold">
                {days.find((d) => d.key === day)?.label} om {time}
              </p>
              <p className="mt-1">
                {COACHES.find((c) => c.id === coach)?.name}. De bevestiging gaat naar {email}.
              </p>
              <button type="button" className="mt-4 text-sm underline" onClick={() => setBooked(false)}>
                Ander moment kiezen
              </button>
            </div>
          ) : (
            <form
              ref={formRef}
              className="mt-8 grid gap-5"
              name="racket-test"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!time || sending) return;
                const data = new FormData(e.currentTarget);
                setSending(true);
                setError("");
                try {
                  // Netlify Forms: URL-encoded POST naar het statische skelet (public/__forms.html)
                  const res = await fetch("/__forms.html", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
                  });
                  if (!res.ok) throw new Error(String(res.status));
                  setEmail(String(data.get("email") ?? ""));
                  setBooked(true);
                } catch {
                  setError("Versturen lukte niet. Controleer je verbinding en probeer het opnieuw.");
                } finally {
                  setSending(false);
                }
              }}
            >
              <input type="hidden" name="form-name" value="racket-test" />
              <input type="hidden" name="dag" value={days.find((d) => d.key === day)?.label ?? day} />
              <input type="hidden" name="tijd" value={time ?? ""} />
              <p hidden>
                <label>
                  Niet invullen: <input name="bot-field" tabIndex={-1} autoComplete="off" />
                </label>
              </p>
              <fieldset>
                <legend className="mb-2 font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Dag</legend>
                <div className="flex flex-wrap gap-2">
                  {days.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => {
                        setDay(d.key);
                        setTime(null);
                      }}
                      aria-pressed={day === d.key}
                      className={`rounded-full border px-4 py-2 text-sm capitalize transition-colors ${day === d.key ? "border-fg bg-fg text-on-accent" : "border-panel-2 text-fg hover:border-fg/40"}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Tijd</legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {TIMES.map((t) => {
                    const taken = takenFor(day).has(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={taken}
                        onClick={() => setTime(t)}
                        aria-pressed={time === t}
                        className={`rounded-full border px-3 py-2 font-ui text-sm tabular-nums transition-colors ${
                          taken ? "cursor-not-allowed border-transparent text-fg/25 line-through" : time === t ? "border-accent bg-accent text-on-accent" : "border-panel-2 hover:border-accent"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="grid gap-2">
                <span className="font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Coach</span>
                <select
                  id="coach"
                  name="coach"
                  value={coach}
                  onChange={(e) => setCoach(e.target.value)}
                  className="rounded-full border border-panel-2 bg-panel px-4 py-3 text-fg"
                >
                  {COACHES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Naam</span>
                  <input
                    id="naam"
                    name="naam"
                    required
                    autoComplete="name"
                    className="rounded-full border border-panel-2 bg-panel px-4 py-3 text-fg placeholder:text-muted focus:border-accent focus:outline-none"
                    placeholder="Voor- en achternaam"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="font-ui text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">E-mail</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="rounded-full border border-panel-2 bg-panel px-4 py-3 text-fg placeholder:text-muted focus:border-accent focus:outline-none"
                    placeholder="naam@voorbeeld.nl"
                  />
                </label>
              </div>
              <p className="text-sm text-muted">
                Gratis annuleren tot 48 uur van tevoren. Neem je padelschoenen mee; rackets en ballen liggen klaar. We gebruiken je gegevens alleen om deze afspraak te bevestigen.
              </p>
              {error && (
                <p className="rounded-2xl bg-accent-2 px-4 py-3 text-sm text-on-accent" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!time || sending}
                className="flex items-center justify-between gap-3 rounded-full bg-accent py-2 pr-2 pl-6 font-semibold text-on-accent transition-opacity disabled:opacity-40"
              >
                {sending ? "Versturen…" : time ? `Boek ${time} · € ${PRICE.toFixed(2).replace(".", ",")}` : "Kies eerst een tijd"}
                <span className="grid size-9 place-items-center rounded-full bg-bg">
                  <ArrowIcon className="size-3 text-accent" />
                </span>
              </button>
            </form>
          )}
        </div>
      </div>

      <div id="thuistest" className="grid gap-6 border-t border-fg/5 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
        <div>
          <p className="eyebrow">Geen tijd om langs te komen?</p>
          <h3 className="mt-4 text-3xl font-medium">
            Thuistest: drie rackets, <span className="accent">veertien dagen</span>.
          </h3>
          <p className="mt-2 max-w-xl text-fg/70">We sturen tot drie testrackets naar je toe. Speel er twee weken mee op je eigen club en stuur terug wat je niet houdt.</p>
        </div>
        <a href="#finder" className="flex items-center gap-3 self-start rounded-full bg-accent-2 py-2 pr-2 pl-5 font-semibold text-on-accent md:self-center">
          Kies je testrackets
          <span className="grid size-8 place-items-center rounded-full bg-bg">
            <ArrowIcon className="size-3 text-accent" />
          </span>
        </a>
      </div>
    </RevealPanel>
  );
}
