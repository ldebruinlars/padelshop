"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BOOK_AHEAD_DAYS, COACHES, DAYPARTS, MACHINE, TEST_MODES, TIMES, bookTest, hhmm, takenSlots, type Taken, type TestMode } from "@/lib/booking";
import { ChevronIcon } from "./icons";
import { RevealPanel } from "./reveal-panel";

const PRICE = 29.95;
const price = `€ ${PRICE.toFixed(2).replace(".", ",")}`;

/** Datum als yyyy-mm-dd in lokale tijd (niet UTC, anders schuift de dag 's avonds op). */
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const longDate = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" });
const monthName = new Intl.DateTimeFormat("nl-NL", { month: "long", year: "numeric" });
const WEEKDAYS = ["ma", "di", "wo", "do", "vr", "za", "zo"];

/** Alle dagen van een maand in weken van maandag tot zondag; null vult de randen op. */
function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(year, month, i + 1))];
  while (cells.length % 7) cells.push(null);
  return cells;
}

function Step({ n, title, children, done }: { n: number; title: string; children: React.ReactNode; done?: boolean }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-4 flex items-center gap-3">
        <span className={`grid size-7 place-items-center rounded-full text-sm font-bold tabular-nums transition-colors ${done ? "bg-accent text-on-accent" : "border border-panel-2 text-fg/70"}`}>{n}</span>
        <span className="text-lg font-bold">{title}</span>
      </legend>
      {children}
    </fieldset>
  );
}

/** Racket-test boeken in vier stappen: datum in een maandrooster, tijd per dagdeel, coach of balmachine, gegevens. */
export function Testcenter() {
  // Datums pas in de browser berekenen, zodat server en client hetzelfde renderen.
  const [range, setRange] = useState<{ min: string; max: string } | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [taken, setTaken] = useState<Taken[]>([]);
  const [day, setDay] = useState("");
  const [time, setTime] = useState<string | null>(null);
  const [mode, setMode] = useState<TestMode>("coach");
  const [coach, setCoach] = useState("any");
  const [booked, setBooked] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const confirmRef = useRef<HTMLDivElement>(null);
  const timesRef = useRef<HTMLDivElement>(null);

  const loadTaken = (r: { min: string; max: string }) =>
    takenSlots(r.min, r.max)
      .then(setTaken)
      .catch(() => setTaken([]));

  useEffect(() => {
    const min = new Date();
    min.setDate(min.getDate() + 1);
    const max = new Date(min);
    max.setDate(max.getDate() + BOOK_AHEAD_DAYS - 1);
    const r = { min: ymd(min), max: ymd(max) };
    setRange(r);
    setView({ y: min.getFullYear(), m: min.getMonth() });
    loadTaken(r);
  }, []);

  useEffect(() => {
    if (booked) confirmRef.current?.focus();
  }, [booked]);

  const isTaken = (d: string, t: string) => taken.some((x) => x.slot_date === d && (x.whole_day || (x.slot_time && hhmm(x.slot_time) === t)));
  const freeCount = (d: string) => (taken.some((x) => x.slot_date === d && x.whole_day) ? 0 : TIMES.filter((t) => !isTaken(d, t)).length);
  const cells = useMemo(() => (view ? monthGrid(view.y, view.m) : []), [view]);
  const inRange = (d: string) => !!range && d >= range.min && d <= range.max;
  const canPrev = !!(view && range && (view.y * 12 + view.m) > fromYmd(range.min).getFullYear() * 12 + fromYmd(range.min).getMonth());
  const canNext = !!(view && range && (view.y * 12 + view.m) < fromYmd(range.max).getFullYear() * 12 + fromYmd(range.max).getMonth());
  const moveMonth = (dir: 1 | -1) => setView((v) => (v ? { y: v.m + dir < 0 ? v.y - 1 : v.m + dir > 11 ? v.y + 1 : v.y, m: (v.m + dir + 12) % 12 } : v));

  const who = mode === "machine" ? MACHINE : (COACHES.find((c) => c.id === coach)?.name ?? COACHES[0].name);
  const dayLabel = day ? longDate.format(fromYmd(day)) : "";

  return (
    <RevealPanel id="testcenter" className="bg-bg">
      <div className="p-6 md:p-12">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-panel-2 pb-6">
          <div>
            <h2 className="text-[clamp(34px,4vw,56px)] leading-[0.95] font-bold">Boek een racket-test</h2>
            <p className="mt-3 max-w-[58ch] text-fg/70">
              45 minuten op een baan bij Poort Padel met 3 tot 5 rackets die bij je spel passen. Koop je daarna een racket, dan krijg je de {price} terug.
            </p>
          </div>
          <p className="font-display text-4xl font-bold text-accent tabular-nums">{price}</p>
        </div>

        {booked ? (
          <div ref={confirmRef} tabIndex={-1} className="mt-8 max-w-xl rounded-[var(--radius-card)] bg-accent p-6 text-on-accent outline-none" role="status">
            <p className="label">Aanvraag ontvangen</p>
            <p className="mt-2 text-2xl font-semibold first-letter:uppercase">
              {dayLabel} om {time}
            </p>
            <p className="mt-1">
              {who}. De bevestiging gaat naar {email}.
            </p>
            <button
              type="button"
              className="mt-4 text-sm underline"
              onClick={() => {
                setBooked(false);
                setTime(null);
              }}
            >
              Nog een moment boeken
            </button>
          </div>
        ) : (
          <form
            className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_1fr_1.1fr] lg:gap-12"
            name="racket-test"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!day || !time || sending) return;
              const data = new FormData(e.currentTarget);
              setSending(true);
              setError("");
              try {
                const input = { date: day, time, coach: who, name: String(data.get("naam") ?? ""), email: String(data.get("email") ?? "") };
                // Opslaan in de database; die blokkeert het moment meteen voor anderen
                await bookTest(input);
                // Netlify Forms als extra melding
                fetch("/__forms.html", {
                  method: "POST",
                  headers: { "Content-Type": "application/x-www-form-urlencoded" },
                  body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
                }).catch(() => null);
                setEmail(input.email);
                setBooked(true);
                if (range) loadTaken(range);
              } catch (err) {
                if (err instanceof Error && err.message === "moment_bezet") {
                  setError("Net iemand anders je voor: deze tijd is zojuist geboekt. Kies een andere tijd.");
                  setTime(null);
                  if (range) loadTaken(range);
                } else {
                  setError("Versturen lukte niet. Controleer je verbinding en probeer het opnieuw.");
                }
              } finally {
                setSending(false);
              }
            }}
          >
            <input type="hidden" name="form-name" value="racket-test" />
            <input type="hidden" name="dag" value={dayLabel} />
            <input type="hidden" name="tijd" value={time ?? ""} />
            <input type="hidden" name="coach" value={who} />
            <p hidden>
              <label>
                Niet invullen: <input name="bot-field" tabIndex={-1} autoComplete="off" />
              </label>
            </p>

            {/* 1. Datum in een maandrooster */}
            <Step n={1} title="Kies een datum" done={!!day}>
              <div className="rounded-[var(--radius-card)] border border-panel-2 p-4">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => moveMonth(-1)} disabled={!canPrev} className="grid size-9 place-items-center rounded-[var(--radius-control)] hover:bg-panel disabled:opacity-30" aria-label="Vorige maand">
                    <ChevronIcon className="size-3.5 rotate-180" />
                  </button>
                  <p className="font-semibold capitalize" aria-live="polite">
                    {view ? monthName.format(new Date(view.y, view.m, 1)) : " "}
                  </p>
                  <button type="button" onClick={() => moveMonth(1)} disabled={!canNext} className="grid size-9 place-items-center rounded-[var(--radius-control)] hover:bg-panel disabled:opacity-30" aria-label="Volgende maand">
                    <ChevronIcon className="size-3.5" />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-7 text-center text-xs text-muted" aria-hidden="true">
                  {WEEKDAYS.map((w) => (
                    <span key={w} className="py-1">
                      {w}
                    </span>
                  ))}
                </div>
                <div className="grid min-h-[246px] grid-cols-7 gap-1">
                  {cells.map((c, i) => {
                    if (!c) return <span key={`leeg-${i}`} />;
                    const k = ymd(c);
                    const open = inRange(k);
                    const free = open ? freeCount(k) : 0;
                    const off = !open || free === 0;
                    const picked = day === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        disabled={off}
                        aria-pressed={picked}
                        aria-label={`${longDate.format(c)}${!open ? ", niet te boeken" : free === 0 ? ", vol" : `, ${free} tijden vrij`}`}
                        onClick={() => {
                          setDay(k);
                          setTime(null);
                          // Op telefoons door naar de tijden
                          if (window.matchMedia("(max-width: 1023px)").matches) timesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className={`relative flex aspect-square flex-col items-center justify-center rounded-[var(--radius-control)] text-sm tabular-nums transition-colors ${
                          picked ? "bg-accent font-bold text-on-accent" : off ? "text-fg/25" : "font-medium hover:bg-panel"
                        } ${open && free === 0 ? "line-through" : ""}`}
                      >
                        {c.getDate()}
                        {open && free > 0 && !picked && <span className={`absolute bottom-1.5 size-1 rounded-full ${free <= 3 ? "bg-accent-2" : "bg-accent"}`} aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-accent" /> Plek vrij
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-accent-2" /> Bijna vol
                  </span>
                  <span>Tot {BOOK_AHEAD_DAYS / 7} weken vooruit</span>
                </p>
              </div>
            </Step>

            {/* 2. Tijd per dagdeel */}
            <div ref={timesRef} className="scroll-mt-28">
              <Step n={2} title="Kies een tijd" done={!!time}>
                {day ? (
                  <>
                    <p className="-mt-1 mb-4 text-sm text-fg/70 first-letter:uppercase">{dayLabel}</p>
                    <div className="grid gap-5">
                      {DAYPARTS.map((part) => (
                        <div key={part.label}>
                          <p className="label mb-2 text-muted">{part.label}</p>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
                            {part.times.map((t) => {
                              const busy = isTaken(day, t);
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  disabled={busy}
                                  onClick={() => setTime(t)}
                                  aria-pressed={time === t}
                                  aria-label={busy ? `${t}, bezet` : t}
                                  className={`chip justify-center tabular-nums ${busy ? "cursor-not-allowed border-transparent text-fg/30 line-through" : ""}`}
                                >
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="rounded-[var(--radius-card)] border border-dashed border-panel-2 px-5 py-10 text-center text-fg/60">Kies eerst een datum in het rooster.</p>
                )}
              </Step>
            </div>

            {/* 3 en 4. Coach of balmachine, en je gegevens */}
            <div className="grid content-start gap-8">
              <Step n={3} title="Met een coach of de balmachine" done={!!time}>
                <div className="grid gap-2" role="radiogroup" aria-label="Hoe wil je testen?">
                  {TEST_MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={mode === m.id}
                      onClick={() => setMode(m.id)}
                      className={`rounded-[var(--radius-control)] border px-4 py-3 text-left transition-colors ${mode === m.id ? "border-accent bg-panel" : "border-panel-2 hover:border-fg/40"}`}
                    >
                      <span className="flex items-center gap-2.5 font-semibold">
                        <span className={`grid size-4 place-items-center rounded-full border-2 ${mode === m.id ? "border-accent" : "border-fg/40"}`}>{mode === m.id && <span className="size-1.5 rounded-full bg-accent" />}</span>
                        {m.title}
                      </span>
                      <span className="mt-1 block pl-[26px] text-sm text-fg/65">{m.text}</span>
                    </button>
                  ))}
                </div>
                {mode === "coach" && (
                  <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Kies een coach">
                    {COACHES.map((c) => (
                      <button key={c.id} type="button" className="chip" aria-pressed={coach === c.id} onClick={() => setCoach(c.id)}>
                        {c.id === "any" ? "Maakt niet uit" : c.name}
                      </button>
                    ))}
                  </div>
                )}
              </Step>

              <Step n={4} title="Je gegevens">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="label text-muted">Naam</span>
                    <input id="naam" name="naam" required autoComplete="name" className="field" placeholder="Voor- en achternaam" />
                  </label>
                  <label className="grid gap-2">
                    <span className="label text-muted">E-mail</span>
                    <input id="email" name="email" type="email" required autoComplete="email" className="field" placeholder="naam@voorbeeld.nl" />
                  </label>
                </div>
              </Step>

              {error && (
                <p className="rounded-[var(--radius-card)] bg-accent-2 px-4 py-3 text-sm text-on-accent" role="alert">
                  {error}
                </p>
              )}

              <div className="rounded-[var(--radius-card)] bg-panel p-4">
                <p className="text-sm text-fg/80 first-letter:uppercase">
                  {day && time ? (
                    <>
                      <strong className="font-semibold text-fg">
                        {dayLabel} om {time}
                      </strong>
                      <br />
                      {who}
                    </>
                  ) : (
                    "Kies een datum en een tijd."
                  )}
                </p>
                <button type="submit" disabled={!day || !time || sending} className="btn btn-primary mt-3 w-full justify-center">
                  {sending ? "Versturen…" : day && time ? `Boek ${time} · ${price}` : "Kies eerst een tijd"}
                </button>
                <p className="mt-3 text-xs text-muted">We bevestigen per mail. Gratis annuleren tot 48 uur van tevoren. Neem je padelschoenen mee; rackets en ballen liggen klaar.</p>
              </div>
            </div>
          </form>
        )}
      </div>
    </RevealPanel>
  );
}
