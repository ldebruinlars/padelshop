"use client";

import { useEffect, useRef, useState } from "react";
import { MEDIA } from "@/lib/site";
import { RevealPanel } from "./reveal-panel";
import { COACHES, TIMES, bookTest, hhmm, supabase, takenSlots, type Taken } from "@/lib/booking";

const PRICE = 29.95;
const DAYS = 14;

/** Datum als yyyy-mm-dd in lokale tijd (niet UTC, anders schuift de dag 's avonds op). */
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function nextDays(n: number) {
  const fmt = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short" });
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return { key: ymd(d), label: fmt.format(d) };
  });
}

/** Testcenter: vast tijdslot met coach boeken, plus het thuistest-pakket. */
export function Testcenter() {
  // Datums pas in de browser berekenen, zodat server en client hetzelfde renderen.
  const [days, setDays] = useState<{ key: string; label: string }[]>([]);
  const [day, setDay] = useState("");
  const [taken, setTaken] = useState<Taken[]>([]);
  const loadTaken = (d: { key: string }[]) =>
    takenSlots(d[0].key, d[d.length - 1].key)
      .then(setTaken)
      .catch(() => setTaken([]));
  useEffect(() => {
    const d = nextDays(DAYS);
    setDays(d);
    setDay(d[0].key);
    loadTaken(d);
  }, []);
  const isTaken = (dayKey: string, t: string) => taken.some((x) => x.slot_date === dayKey && (x.whole_day || (x.slot_time && hhmm(x.slot_time) === t)));
  const dayClosed = (dayKey: string) => taken.some((x) => x.slot_date === dayKey && x.whole_day) || TIMES.every((t) => isTaken(dayKey, t));
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
          <img
            loading="lazy"
            decoding="async"
            src={MEDIA.hero1600}
            srcSet={MEDIA.heroSrcSet}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Speler slaat een bal op een baan bij Poort Padel"
            className="absolute inset-0 size-full object-cover object-[62%_center] [filter:sepia(0.55)_saturate(0.7)_hue-rotate(-8deg)_brightness(0.92)]"
          />
                  </div>

        <div className="p-8 md:p-12">
          <h2 className="text-[clamp(34px,4vw,56px)] leading-[0.95] font-bold">
            Boek een racket-test
          </h2>
          <p className="mt-4 max-w-md text-fg/70">
            Een coach kijkt naar je slagen en legt rackets klaar die bij je spel passen. Koop je daarna een racket, dan krijg je de € {PRICE.toFixed(2).replace(".", ",")} terug.
          </p>

          {booked ? (
            <div ref={confirmRef} tabIndex={-1} className="mt-8 rounded-[var(--radius-card)] bg-accent p-6 text-on-accent outline-none" role="status">
              <p className="label">Aanvraag ontvangen</p>
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
                  const input = {
                    date: day,
                    time,
                    coach: COACHES.find((c) => c.id === coach)?.name ?? "Eerste beschikbare coach",
                    name: String(data.get("naam") ?? ""),
                    email: String(data.get("email") ?? ""),
                  };
                  if (supabase()) {
                    // Opslaan in de database; die blokkeert het moment meteen voor anderen
                    await bookTest(input);
                  }
                  // Netlify Forms als extra melding (en als enige route zolang Supabase niet gekoppeld is)
                  const res = await fetch("/__forms.html", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
                  }).catch(() => null);
                  if (!supabase() && !res?.ok) throw new Error("versturen");
                  setEmail(input.email);
                  setBooked(true);
                  loadTaken(days);
                } catch (err) {
                  if (err instanceof Error && err.message === "moment_bezet") {
                    setError("Net iemand anders je voor: deze tijd is zojuist geboekt. Kies een andere tijd.");
                    setTime(null);
                    loadTaken(days);
                  } else {
                    setError("Versturen lukte niet. Controleer je verbinding en probeer het opnieuw.");
                  }
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
                <legend className="mb-2 label text-muted">Dag</legend>
                {/* Twee weken vooruit, opzij te scrollen; volle of gesloten dagen staan uit */}
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
                  {days.map((d) => {
                    const closed = dayClosed(d.key);
                    return (
                      <button
                        key={d.key}
                        type="button"
                        disabled={closed}
                        onClick={() => {
                          setDay(d.key);
                          setTime(null);
                        }}
                        aria-pressed={day === d.key}
                        className={`chip shrink-0 capitalize ${closed ? "cursor-not-allowed text-fg/35 line-through" : ""}`}
                      >
                        {d.label}
                        {closed && <span className="sr-only">, vol</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 label text-muted">Tijd</legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {TIMES.map((t) => {
                    const busy = isTaken(day, t);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={busy}
                        onClick={() => setTime(t)}
                        aria-pressed={time === t}
                        aria-label={busy ? `${t}, bezet` : t}
                        className={`chip justify-center tabular-nums ${busy ? "cursor-not-allowed border-transparent text-fg/35 line-through" : ""}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="grid gap-2">
                <span className="label text-muted">Coach</span>
                <select
                  id="coach"
                  name="coach"
                  value={coach}
                  onChange={(e) => setCoach(e.target.value)}
                  className="field"
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
                  <span className="label text-muted">Naam</span>
                  <input
                    id="naam"
                    name="naam"
                    required
                    autoComplete="name"
                    className="field"
                    placeholder="Voor- en achternaam"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="label text-muted">E-mail</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="field"
                    placeholder="naam@voorbeeld.nl"
                  />
                </label>
              </div>
              <p className="text-sm text-muted">
                Je kiest een voorkeurstijd; we bevestigen de afspraak per mail. Gratis annuleren tot 48 uur van tevoren. Neem je padelschoenen mee; rackets en ballen liggen klaar. We gebruiken je gegevens alleen om deze afspraak te bevestigen.
              </p>
              {error && (
                <p className="rounded-[var(--radius-card)] bg-accent-2 px-4 py-3 text-sm text-on-accent" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!time || sending}
                className="btn btn-primary"
              >
                {sending ? "Versturen…" : time ? `Boek ${time} · € ${PRICE.toFixed(2).replace(".", ",")}` : "Kies eerst een tijd"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div id="thuistest" className="grid gap-6 border-t border-fg/5 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
        <div>
          <h3 className="text-3xl font-bold">
            Thuistest: drie rackets, veertien dagen.
          </h3>
          <p className="mt-2 max-w-xl text-fg/70">We sturen tot drie testrackets naar je toe. Speel er twee weken mee op je eigen club en stuur terug wat je niet houdt.</p>
        </div>
        <a href="#finder" className="btn btn-sand self-start md:self-center">
          Kies je testrackets
        </a>
      </div>
    </RevealPanel>
  );
}
