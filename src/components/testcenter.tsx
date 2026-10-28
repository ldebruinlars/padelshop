"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BOOK_AHEAD_DAYS,
  COACHES,
  DAYPARTS,
  FIT_KINDS,
  SCHEDULE,
  SCHEDULE_TEXT,
  bookFit,
  bookingState,
  eur,
  hhmm,
  joinWaitlist,
  notifyTeam,
  quote,
  startPayment,
  takenSlots,
  type BookingState,
  type FitKind,
  type Taken,
} from "@/lib/booking";
import { CONFIG, COACH_PROFILES } from "@/lib/config";
import { brandName } from "@/lib/catalog";
import { QUESTIONS, recommend, type Answer } from "@/lib/finder-logic";
import { INTAKE_EVENT, loadIntake, type Intake } from "@/lib/intake";
import { track } from "@/lib/track";
import { ChevronIcon } from "./icons";
import { RevealPanel } from "./reveal-panel";

/** Datum als yyyy-mm-dd in lokale tijd (niet UTC, anders schuift de dag 's avonds op). */
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const longDate = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" });
const shortDate = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short" });
const monthName = new Intl.DateTimeFormat("nl-NL", { month: "long", year: "numeric" });
const WEEKDAYS = ["ma", "di", "wo", "do", "vr", "za", "zo"];
const plus30 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const n = h * 60 + m + 30;
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
};

// De korte intake: vijf vragen uit de racketfinder, plus je huidige racket
const INTAKE_IDS = ["niveau", "vaak", "kant", "arm", "budget"];
const INTAKE_QUESTIONS = QUESTIONS.filter((q) => INTAKE_IDS.includes(q.id));

const PRICE_LIST = [
  "Racket Fit met coach, 30 minuten, 3 rackets op maat, oordeel per racket: €30 per persoon, €52,50 voor twee.",
  "Balmachine-uur, 60 minuten, 1 speler, 5 rackets, zonder coach: €60.",
  "Met 3 of 4 personen? Boek twee slots achter elkaar.",
  ...(CONFIG.academy.show ? [`Leerlingen van ${CONFIG.academy.name}: gratis tijdens je eigen les. Op een los testslot €15.`] : []),
  "Alleen gekomen? Kies \"koppel mij\" en we zetten je bij een andere tester van jouw niveau. Je betaalt dan het duo-tarief van €26,25.",
  "Bestel je direct op de baan? Gratis grip-pakket (overgrip, bumper, ter plekke opgezet). Bij rackets vanaf €250 een gratis inspeel-les van 30 minuten.",
  "Alle rackets voor de adviesprijs. 30 dagen omruilgarantie: past het racket na 30 dagen spelen toch niet, ruil je hem één keer om voor een ander model uit de testrange.",
];

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

function Radio({ on, onClick, title, text, aside }: { on: boolean; onClick: () => void; title: string; text?: string; aside?: string }) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className={`rounded-[var(--radius-control)] border px-4 py-3 text-left transition-colors ${on ? "border-accent bg-panel" : "border-panel-2 hover:border-fg/40"}`}>
      <span className="flex flex-wrap items-center gap-x-2.5 font-semibold">
        <span className={`grid size-4 shrink-0 place-items-center rounded-full border-2 ${on ? "border-accent" : "border-fg/40"}`}>{on && <span className="size-1.5 rounded-full bg-accent" />}</span>
        <span className="flex-1">{title}</span>
        {aside && <span className="shrink-0 text-sm font-semibold text-accent tabular-nums max-sm:basis-full max-sm:pl-[26px]">{aside}</span>}
      </span>
      {text && <span className="mt-1 block pl-[26px] text-sm text-fg/65">{text}</span>}
    </button>
  );
}

/** Wachtlijst: niemand gaat weg zonder zijn nummer achter te laten. */
function Waitlist({ wish, onClearWish }: { wish: string; onClearWish: () => void }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [daypart, setDaypart] = useState<string>("");
  const [persons, setPersons] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (wish) box.current?.querySelector<HTMLInputElement>("input[name=naam]")?.focus({ preventScroll: true });
  }, [wish]);

  if (state === "done")
    return (
      <div id="wachtlijst" className="scroll-mt-28 rounded-[var(--radius-card)] bg-accent p-6 text-on-accent" role="status">
        <p className="text-xl font-bold">Je staat op de wachtlijst</p>
        <p className="mt-1">We bellen of appen je zodra er een plek vrijkomt.</p>
      </div>
    );

  return (
    <div id="wachtlijst" ref={box} className="scroll-mt-28 rounded-[var(--radius-card)] border border-panel-2 p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold">Past geen enkel slot?</h3>
        {wish && (
          <p className="text-sm text-fg/75">
            Je wilde graag: <strong className="font-semibold text-fg">{wish}</strong>{" "}
            <button type="button" className="link text-muted" onClick={onClearWish}>
              wissen
            </button>
          </p>
        )}
      </div>
      <p className="mt-1 max-w-[70ch] text-fg/75">Zet je op de wachtlijst, dan bellen of appen we je zodra er een plek vrijkomt.</p>
      <form
        className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1.3fr_auto] lg:items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          setState("sending");
          try {
            const input = { name: String(d.get("naam") ?? ""), phone: String(d.get("telefoon") ?? ""), daypart, persons, preference: String(d.get("voorkeur") ?? ""), wishSlot: wish };
            const id = await joinWaitlist(input);
            notifyTeam("waitlist", id);
            track("waitlist", { id: `waitlist-${id}`, phone: input.phone });
            fetch("/__forms.html", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ "form-name": "wachtlijst", naam: input.name, telefoon: input.phone, dagdeel: daypart, personen: String(persons), voorkeur: input.preference, slot: wish }).toString(),
            }).catch(() => null);
            setState("done");
          } catch {
            setState("error");
          }
        }}
      >
        <label className="grid gap-2">
          <span className="label text-muted">Naam</span>
          <input name="naam" required minLength={2} autoComplete="name" className="field" />
        </label>
        <label className="grid gap-2">
          <span className="label text-muted">Telefoon</span>
          <input name="telefoon" type="tel" required pattern="[0-9 +()\-]{8,20}" autoComplete="tel" className="field" placeholder="06 12345678" />
        </label>
        <label className="grid gap-2">
          <span className="label text-muted">Welke tijd zou jou passen?</span>
          <input name="voorkeur" maxLength={300} className="field" placeholder="Bijv. woensdagavond na 19:00" />
        </label>
        <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
          {state === "sending" ? "Versturen…" : "Zet me op de wachtlijst"}
        </button>
        <div className="flex flex-wrap gap-x-6 gap-y-3 lg:col-span-4">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Voorkeur dagdeel">
            <span className="label text-muted">Dagdeel</span>
            {DAYPARTS.map((p) => (
              <button key={p} type="button" className="chip capitalize" aria-pressed={daypart === p} onClick={() => setDaypart(daypart === p ? "" : p)}>
                {p}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Aantal personen">
            <span className="label text-muted">Personen</span>
            {[1, 2].map((n) => (
              <button key={n} type="button" className="chip tabular-nums" aria-pressed={persons === n} onClick={() => setPersons(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>
        {state === "error" && (
          <p className="rounded-[var(--radius-control)] bg-accent-2 px-4 py-3 text-sm text-on-accent lg:col-span-4" role="alert">
            Versturen lukte niet. Controleer je nummer en je verbinding en probeer het opnieuw.
          </p>
        )}
      </form>
    </div>
  );
}

/** Na de betaalpagina van Mollie: toon of de plek vaststaat. */
function PaymentReturn({ id, onDone }: { id: string; onDone: () => void }) {
  const [s, setS] = useState<BookingState | null | "laden">("laden");
  useEffect(() => {
    let tries = 0;
    const check = async () => {
      const st = await bookingState(id);
      setS(st);
      // De webhook van Mollie kan een paar seconden achterlopen
      if (st?.payment === "open" && tries++ < 5) setTimeout(check, 2500);
      if (st?.payment === "betaald") track("purchase", { id: `purchase-${id}`, value: Number(st.amount) });
    };
    check();
  }, [id]);
  if (s === "laden") return <p className="mt-8 text-fg/70">Je betaling controleren…</p>;
  const paid = s?.payment === "betaald";
  return (
    <div className={`mt-8 max-w-xl rounded-[var(--radius-card)] p-6 ${paid ? "bg-accent text-on-accent" : "border border-panel-2"}`} role="status">
      <p className="label">{paid ? "Betaald, je plek staat vast" : s?.payment === "mislukt" ? "Betaling niet gelukt" : "We wachten nog op je betaling"}</p>
      {s && (
        <p className="mt-2 text-2xl font-semibold first-letter:uppercase">
          {longDate.format(fromYmd(s.slot_date))} om {hhmm(s.slot_time)}
        </p>
      )}
      <p className="mt-2">
        {paid
          ? "We bevestigen per mail. Neem je huidige racket en je padelschoenen mee; we kijken eerst naar het racket waar je nu mee speelt. Testrackets en ballen liggen klaar."
          : s?.payment === "mislukt"
            ? "Je plek is weer vrijgegeven. Probeer het opnieuw of kies een ander moment."
            : "Zodra de betaling binnen is, staat je plek vast en krijg je bericht."}
      </p>
      <button type="button" className="mt-4 text-sm underline" onClick={onDone}>
        {paid ? "Nog een moment boeken" : "Terug naar het rooster"}
      </button>
    </div>
  );
}

/**
 * Racket Fit boeken: eerst de intake (of het advies uit de racketfinder), dan de vorm en het aantal personen,
 * dan een open slot (di, do, za), dan je gegevens en betalen. Vol? Dan de wachtlijst.
 */
export function Testcenter() {
  // Datums pas in de browser berekenen, zodat server en client hetzelfde renderen.
  const [range, setRange] = useState<{ min: string; max: string } | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [taken, setTaken] = useState<Taken[]>([]);
  const [intake, setIntake] = useState<Intake | null>(null);
  const [editIntake, setEditIntake] = useState(false);
  const [short, setShort] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState("");
  const [kind, setKind] = useState<FitKind>("duo");
  const [persons, setPersons] = useState(1);
  const [student, setStudent] = useState(false);
  const [coach, setCoach] = useState("any");
  const [day, setDay] = useState("");
  const [time, setTime] = useState<string | null>(null);
  const [wish, setWish] = useState("");
  const [booked, setBooked] = useState<{ amount: number } | null>(null);
  const [returned, setReturned] = useState("");
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
    setIntake(loadIntake());
    const onIntake = (e: Event) => {
      setIntake((e as CustomEvent<Intake>).detail);
      setEditIntake(false);
    };
    window.addEventListener(INTAKE_EVENT, onIntake);
    const back = new URLSearchParams(window.location.search).get("boeking");
    if (back && /^[0-9a-f-]{36}$/.test(back)) setReturned(back);
    return () => window.removeEventListener(INTAKE_EVENT, onIntake);
  }, []);

  useEffect(() => {
    if (booked) confirmRef.current?.focus();
  }, [booked]);

  // Advies uit de korte intake, als er (nog) geen finder-advies is of je het aanpast
  const shortAnswers = useMemo(
    () => INTAKE_QUESTIONS.map((q) => q.answers.find((a) => a.label === short[q.id])).filter((a): a is Answer => Boolean(a)),
    [short],
  );
  const shortPicks = useMemo(() => (shortAnswers.length ? recommend(shortAnswers).picks : []), [shortAnswers]);
  const useFinder = Boolean(intake?.rackets.length) && !editIntake;
  const rackets = useFinder ? intake!.rackets : shortPicks.map((p) => ({ id: p.r.id, label: `${brandName(p.r.brand)} ${p.r.model}` }));
  const intakeDone = useFinder || shortAnswers.length >= 3;

  const q = quote(kind, persons, student);
  const isTaken = (d: string, t: string) => taken.some((x) => x.slot_date === d && (x.whole_day || (x.slot_time && hhmm(x.slot_time) === t)));
  const timesFor = (d: string) => SCHEDULE[fromYmd(d).getDay()] ?? [];
  // Een slot is vrij als het (en bij twee slots ook het volgende) in het rooster staat en niet bezet is
  const slotFree = (d: string, t: string) => !isTaken(d, t) && (q.slots === 1 || (timesFor(d).includes(plus30(t)) && !isTaken(d, plus30(t))));
  const freeCount = (d: string) => timesFor(d).filter((t) => slotFree(d, t)).length;
  const cells = useMemo(() => (view ? monthGrid(view.y, view.m) : []), [view]);
  const inRange = (d: string) => !!range && d >= range.min && d <= range.max;
  const canPrev = !!(view && range && view.y * 12 + view.m > fromYmd(range.min).getFullYear() * 12 + fromYmd(range.min).getMonth());
  const canNext = !!(view && range && view.y * 12 + view.m < fromYmd(range.max).getFullYear() * 12 + fromYmd(range.max).getMonth());
  const moveMonth = (dir: 1 | -1) => setView((v) => (v ? { y: v.m + dir < 0 ? v.y - 1 : v.m + dir > 11 ? v.y + 1 : v.y, m: (v.m + dir + 12) % 12 } : v));

  // Een gekozen tijd die door een andere vorm of een volle baan niet meer past, valt weg
  const timeStillFree = !day || !time || slotFree(day, time);
  useEffect(() => {
    if (!timeStillFree) setTime(null);
  }, [timeStillFree]);

  const who = kind === "machine" ? "Balmachine" : (COACHES.find((c) => c.id === coach)?.name ?? COACHES[0].name);
  const dayLabel = day ? longDate.format(fromYmd(day)) : "";
  const kindTitle = FIT_KINDS.find((k) => k.id === kind)!.title;
  const toWaitlist = (label: string) => {
    setWish(label);
    document.getElementById("wachtlijst")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <RevealPanel id="testcenter" className="bg-bg">
      <div className="p-6 md:p-12">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-panel-2 pb-6">
          <div>
            <h2 className="text-[clamp(34px,4vw,56px)] leading-[0.95] font-bold">Boek een racket-test</h2>
            <p className="mt-3 max-w-[62ch] text-fg/75">
              Voor €30 sla je een half uur met drie rackets die ik voor jouw spel uitkies, en je krijgt per racket een eerlijk oordeel. Daarna weet je zeker welk racket je moet kopen, in plaats van €200 te gokken op een review.
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl font-bold text-accent tabular-nums">€30</p>
            <p className="text-sm text-muted">30 minuten met een coach</p>
          </div>
        </div>

        {returned ? (
          <PaymentReturn
            id={returned}
            onDone={() => {
              setReturned("");
              window.history.replaceState(null, "", window.location.pathname + "#testcenter");
              if (range) loadTaken(range);
            }}
          />
        ) : booked ? (
          <div ref={confirmRef} tabIndex={-1} className="mt-8 max-w-xl rounded-[var(--radius-card)] bg-accent p-6 text-on-accent outline-none" role="status">
            <p className="label">Je plek is gereserveerd</p>
            <p className="mt-2 text-2xl font-semibold first-letter:uppercase">
              {dayLabel} om {time}
            </p>
            <p className="mt-1">
              {kindTitle} · {eur(booked.amount)}
            </p>
            <p className="mt-3">Je krijgt de betaallink per mail. Je plek staat pas vast na betaling.</p>
            <p className="mt-3">We bevestigen per mail. Neem je huidige racket en je padelschoenen mee; we kijken eerst naar het racket waar je nu mee speelt. Testrackets en ballen liggen klaar.</p>
            <button
              type="button"
              className="mt-4 text-sm underline"
              onClick={() => {
                setBooked(null);
                setTime(null);
              }}
            >
              Nog een moment boeken
            </button>
          </div>
        ) : (
          <form
            className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-12"
            name="racket-test"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!day || !time || sending || !intakeDone) return;
              const data = new FormData(e.currentTarget);
              setSending(true);
              setError("");
              try {
                const contact = { name: String(data.get("naam") ?? ""), phone: String(data.get("telefoon") ?? ""), email: String(data.get("email") ?? "") };
                const answers = useFinder ? intake!.answers : Object.fromEntries(INTAKE_QUESTIONS.map((x) => [x.id, short[x.id] ?? ""]));
                const { id, amount } = await bookFit({
                  kind,
                  persons: q.persons,
                  student: kind === "duo" && student && q.persons === 1,
                  date: day,
                  time,
                  coach: who,
                  ...contact,
                  intake: { answers, rackets: rackets.map((r) => r.label), current: current.trim() || undefined },
                });
                notifyTeam("booking", id);
                track("booking", { id: `booking-${id}`, value: amount, email: contact.email, phone: contact.phone });
                // Netlify Forms als extra melding per mail
                fetch("/__forms.html", {
                  method: "POST",
                  headers: { "Content-Type": "application/x-www-form-urlencoded" },
                  body: new URLSearchParams({
                    "form-name": "racket-test",
                    naam: contact.name,
                    telefoon: contact.phone,
                    email: contact.email,
                    dag: dayLabel,
                    tijd: time,
                    vorm: `${kindTitle}, ${q.persons} p.`,
                    bedrag: eur(amount),
                    coach: who,
                    rackets: rackets.map((r) => r.label).join(", "),
                    huidig: current,
                  }).toString(),
                }).catch(() => null);
                // Betalen bij boeken; staat online betalen nog niet aan, dan komt de betaallink per mail
                const checkout = await startPayment(id);
                if (checkout) {
                  window.location.href = checkout;
                  return;
                }
                setBooked({ amount });
                if (range) loadTaken(range);
              } catch (err) {
                if (err instanceof Error && err.message === "moment_bezet") {
                  setError("Net iemand anders je voor: deze tijd is zojuist geboekt. Kies een andere tijd of zet je op de wachtlijst.");
                  setTime(null);
                  if (range) loadTaken(range);
                } else {
                  setError("Versturen lukte niet. Controleer je telefoonnummer en je verbinding en probeer het opnieuw.");
                }
              } finally {
                setSending(false);
              }
            }}
          >
            {/* 1. Je spel */}
            <div className="grid content-start gap-8">
              <Step n={1} title="Je spel" done={intakeDone}>
                {useFinder ? (
                  <div className="rounded-[var(--radius-card)] bg-panel p-4">
                    <p className="text-sm text-fg/75">Uit de racketfinder. Deze drie leggen we klaar:</p>
                    <ol className="mt-2 grid gap-1 font-semibold">
                      {intake!.rackets.map((r, i) => (
                        <li key={r.id} className="flex gap-2">
                          <span className="text-accent tabular-nums">{i + 1}</span> {r.label}
                        </li>
                      ))}
                    </ol>
                    <button type="button" className="link mt-3 text-sm text-muted" onClick={() => setEditIntake(true)}>
                      Anders invullen
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <p className="-mt-1 text-sm text-fg/70">
                      Vijf korte vragen, dan kiezen we je rackets voordat je komt. Liever alle negen?{" "}
                      <a href="#finder" className="link">
                        Doe de racketfinder
                      </a>
                      .
                    </p>
                    {INTAKE_QUESTIONS.map((x) => (
                      <label key={x.id} className="grid gap-1.5">
                        <span className="label text-muted">{x.q}</span>
                        <select className="field" value={short[x.id] ?? ""} onChange={(e) => setShort((s) => ({ ...s, [x.id]: e.target.value }))}>
                          <option value="">Kies…</option>
                          {x.answers.map((a) => (
                            <option key={a.label}>{a.label}</option>
                          ))}
                        </select>
                      </label>
                    ))}
                    {rackets.length > 0 && (
                      <p className="rounded-[var(--radius-control)] bg-panel px-3 py-2 text-sm">
                        <span className="text-muted">We leggen klaar: </span>
                        {rackets.map((r) => r.label).join(", ")}
                      </p>
                    )}
                  </div>
                )}
                <label className="mt-3 grid gap-1.5">
                  <span className="label text-muted">Met welk racket speel je nu?</span>
                  <input className="field" value={current} maxLength={120} onChange={(e) => setCurrent(e.target.value)} placeholder="Merk en model, of 'weet ik niet'" />
                </label>
              </Step>
            </div>

            <div className="grid content-start gap-8">
              <Step n={2} title="Hoe wil je testen?" done={intakeDone}>
                <div className="grid gap-2" role="radiogroup" aria-label="Vorm van de test">
                  {FIT_KINDS.map((k) => (
                    <Radio key={k.id} on={kind === k.id} onClick={() => setKind(k.id)} title={k.title} text={k.text} aside={k.price} />
                  ))}
                </div>
                {kind === "duo" && (
                  <>
                    <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Aantal personen">
                      <span className="label mr-1 text-muted">Personen</span>
                      {[1, 2, 3, 4].map((n) => (
                        <button key={n} type="button" className="chip tabular-nums" aria-pressed={persons === n} onClick={() => setPersons(n)}>
                          {n}
                        </button>
                      ))}
                    </div>
                    {persons > 2 && <p className="mt-2 text-sm text-fg/70">Met {persons} personen boek je twee slots achter elkaar: een uur op de baan.</p>}
                    {CONFIG.academy.show && persons === 1 && (
                      <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm">
                        <input type="checkbox" className="mt-0.5 size-4 accent-[var(--color-accent)]" checked={student} onChange={(e) => setStudent(e.target.checked)} />
                        <span>Train je bij {CONFIG.academy.name}? Dan test je gratis tijdens je les. Op een los testslot betaal je €15.</span>
                      </label>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Kies een coach">
                      <span className="label mr-1 self-center text-muted">Coach</span>
                      {COACHES.map((c) => (
                        <button key={c.id} type="button" className="chip" aria-pressed={coach === c.id} onClick={() => setCoach(c.id)}>
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </Step>
            </div>

            {/* 3. Datum en tijd: alleen de dagen met testslots */}
            <div className="grid content-start gap-8">
              <Step n={3} title="Kies een moment" done={!!time}>
                <div className="rounded-[var(--radius-card)] border border-panel-2 p-4 xl:max-w-[480px]">
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
                      const open = inRange(k) && timesFor(k).length > 0;
                      const free = open ? freeCount(k) : 0;
                      const picked = day === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          disabled={!open}
                          aria-pressed={picked}
                          aria-label={`${longDate.format(c)}${!open ? ", geen testslots" : free === 0 ? ", vol, wachtlijst mogelijk" : `, ${free} slots vrij`}`}
                          onClick={() => {
                            setDay(k);
                            setTime(null);
                            if (window.matchMedia("(max-width: 1023px)").matches) timesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className={`relative flex aspect-square flex-col items-center justify-center rounded-[var(--radius-control)] text-sm tabular-nums transition-colors ${
                            picked ? "bg-accent font-bold text-on-accent" : !open ? "text-fg/20" : free === 0 ? "text-fg/45 line-through hover:bg-panel" : "font-medium hover:bg-panel"
                          }`}
                        >
                          {c.getDate()}
                          {open && free > 0 && !picked && <span className={`absolute bottom-1.5 size-1 rounded-full ${free <= 2 ? "bg-accent-2" : "bg-accent"}`} aria-hidden="true" />}
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
                    <span>Testslots op {SCHEDULE_TEXT}</span>
                  </p>
                </div>

                <div ref={timesRef} className="mt-5 scroll-mt-28">
                  {day ? (
                    <>
                      <p className="mb-3 text-sm text-fg/70 first-letter:uppercase">
                        {dayLabel} · {q.slots === 2 ? "60 minuten" : "30 minuten"}
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {timesFor(day).map((t) =>
                          slotFree(day, t) ? (
                            <button key={t} type="button" onClick={() => setTime(t)} aria-pressed={time === t} className="chip justify-center tabular-nums">
                              {q.slots === 2 ? `${t}-${plus30(plus30(t))}` : t}
                            </button>
                          ) : (
                            <button
                              key={t}
                              type="button"
                              onClick={() => toWaitlist(`${shortDate.format(fromYmd(day))} ${t}`)}
                              className="chip justify-center gap-1.5 border-dashed text-fg/55 tabular-nums"
                              aria-label={`${t} is vol, zet je op de wachtlijst`}
                            >
                              <span className="line-through">{t}</span>
                              <span className="text-xs">wachtlijst</span>
                            </button>
                          ),
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="rounded-[var(--radius-card)] border border-dashed border-panel-2 px-5 py-8 text-center text-fg/60">Kies eerst een dag in het rooster.</p>
                  )}
                </div>
              </Step>
            </div>

            {/* 4. Gegevens en betalen */}
            <div className="grid content-start gap-8">
              <Step n={4} title="Je gegevens">
                <div className="grid gap-3">
                  <label className="grid gap-2">
                    <span className="label text-muted">Naam</span>
                    <input name="naam" required minLength={2} autoComplete="name" className="field" placeholder="Voor- en achternaam" />
                  </label>
                  <label className="grid gap-2">
                    <span className="label text-muted">Telefoon</span>
                    <input name="telefoon" type="tel" required pattern="[0-9 +()\-]{8,20}" autoComplete="tel" className="field" placeholder="06 12345678" />
                  </label>
                  <label className="grid gap-2">
                    <span className="label text-muted">E-mail</span>
                    <input name="email" type="email" required autoComplete="email" className="field" placeholder="naam@voorbeeld.nl" />
                  </label>
                </div>
              </Step>

              {error && (
                <p className="rounded-[var(--radius-card)] bg-accent-2 px-4 py-3 text-sm text-on-accent" role="alert">
                  {error}
                </p>
              )}

              <div className="rounded-[var(--radius-card)] bg-panel p-4">
                <p className="text-sm text-fg/80">
                  <strong className="font-semibold text-fg">{kindTitle}</strong>
                  {kind === "duo" && ` · ${q.persons} ${q.persons === 1 ? "persoon" : "personen"}`}
                  <br />
                  {day && time ? (
                    <span className="first-letter:uppercase">
                      {dayLabel} om {time} · {who}
                    </span>
                  ) : (
                    "Kies een dag en een tijd."
                  )}
                </p>
                <p className="mt-2 font-display text-3xl font-bold tabular-nums">{eur(q.amount)}</p>
                {kind === "duo" && student && q.persons === 1 && <p className="text-xs text-muted">Leerlingentarief; we checken dit bij je coach.</p>}
                <button type="submit" disabled={!day || !time || sending || !intakeDone} className="btn btn-primary mt-3 w-full justify-center">
                  {sending ? "Versturen…" : !intakeDone ? "Vul eerst stap 1 in" : day && time ? `Boek en betaal ${eur(q.amount)}` : "Kies eerst een tijd"}
                </button>
                <p className="mt-3 text-xs text-muted">Je betaalt bij het boeken met iDEAL; je plek staat pas vast na betaling. Gratis annuleren tot 24 uur vooraf.</p>
                <p className="mt-2 text-xs text-muted">We bevestigen per mail. Neem je huidige racket en je padelschoenen mee; we kijken eerst naar het racket waar je nu mee speelt. Testrackets en ballen liggen klaar.</p>
              </div>
            </div>
          </form>
        )}

        {!returned && !booked && (
          <div className="mt-10">
            <Waitlist wish={wish} onClearWish={() => setWish("")} />
          </div>
        )}

        {/* Prijzen, de coaches en de testkast */}
        <div className="mt-12 grid gap-10 border-t border-panel-2 pt-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h3 className="text-xl font-bold">Prijzen</h3>
            <ul className="mt-4 grid gap-2.5 text-fg/80">
              {PRICE_LIST.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">Het testgeld betaal je voor de test zelf. Het wordt niet verrekend als je daarna een racket koopt.</p>
          </div>
          <div className="grid content-start gap-6">
            <div>
              <h3 className="text-xl font-bold">Je coaches</h3>
              <ul className="mt-3 grid gap-2">
                {COACH_PROFILES.map((c) => (
                  <li key={c.id}>
                    <strong className="font-semibold">{c.name}</strong>
                    {c.bio && <span className="text-fg/75">. {c.bio}</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[var(--radius-card)] border border-dashed border-panel-2 p-4">
              <p className="label text-accent">Testkast, binnenkort</p>
              <p className="mt-2 text-fg/80">Vanaf begin 2027 staat bij Poort Padel een testkast: pinpas tikken, racket pakken, na je potje terugzetten. €10 per test, borg komt automatisch terug.</p>
            </div>
          </div>
        </div>
      </div>
    </RevealPanel>
  );
}
