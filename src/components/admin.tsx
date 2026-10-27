"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { PLAYTOMIC_URL, TIMES, hhmm } from "@/lib/booking";
import { supabase } from "@/lib/supabase-client";
import { CoachesTab, MarginTab, OrdersTab, QrTab, SignupsTab, WaitlistTab } from "./admin-shop";
import { ChevronIcon, Logo } from "./icons";

type Booking = {
  id: string;
  slot_date: string;
  slot_time: string;
  coach: string;
  name: string;
  email: string;
  phone: string | null;
  status: "nieuw" | "playtomic" | "geannuleerd";
  created_at: string;
  kind: "duo" | "match" | "machine";
  persons: number;
  slot_count: number;
  student: boolean;
  amount: number | null;
  payment: "open" | "betaald" | "mislukt";
  intake: { rackets?: string[]; current?: string; answers?: Record<string, string> } | null;
};
const KIND_LABEL = { duo: "Met coach", match: "Koppel mij", machine: "Balmachine-uur" } as const;
type Block = { id: string; slot_date: string; slot_time: string | null; reason: string | null };

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayFmt = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short" });
const longFmt = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" });
const fromKey = (k: string) => new Date(`${k}T12:00:00`);

/** Maandag van de week waarin `d` valt. */
function monday(d: Date) {
  const m = new Date(d);
  m.setHours(12, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

function Login() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  return (
    <form
      className="mx-auto mt-24 grid w-full max-w-sm gap-4 rounded-[var(--radius-panel)] border border-panel-2 bg-bg p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        const { error } = await supabase()!.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/beheer/` } });
        setState(error ? "error" : "sent");
      }}
    >
      <h1 className="text-3xl font-bold">Beheer</h1>
      {state === "sent" ? (
        <p className="text-fg/80" role="status">
          Check je mail: klik op de link om in te loggen.
        </p>
      ) : (
        <>
          <label className="grid gap-2">
            <span className="label text-muted">E-mail</span>
            <input className="field" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
            {state === "sending" ? "Versturen…" : "Stuur inloglink"}
          </button>
          {state === "error" && (
            <p className="text-sm text-accent" role="alert">
              Dat lukte niet. Probeer het opnieuw.
            </p>
          )}
        </>
      )}
    </form>
  );
}

/**
 * Beheerpagina: alle racket-tests in een weekagenda. Nieuwe boekingen staan bovenaan als taak "boek de baan in
 * Playtomic". Je kunt een moment of een hele dag blokkeren; die verdwijnen dan meteen uit de agenda op de site.
 */
export function Admin() {
  const db = supabase();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [week, setWeek] = useState(() => monday(new Date()));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [todo, setTodo] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"agenda" | "wachtlijst" | "bestellingen" | "coaches" | "marge" | "qr" | "testdag">("agenda");

  useEffect(() => {
    if (!db) return setReady(true);
    db.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = db.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [db]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => new Date(week.getFullYear(), week.getMonth(), week.getDate() + i, 12)), [week]);
  const from = ymd(days[0]);
  const to = ymd(days[6]);

  const load = useCallback(async () => {
    if (!db || !session) return;
    setError("");
    const [b, bl, t] = await Promise.all([
      db.from("bookings").select("*").gte("slot_date", from).lte("slot_date", to).neq("status", "geannuleerd"),
      db.from("blocked_slots").select("*").gte("slot_date", from).lte("slot_date", to),
      db.from("bookings").select("*").eq("status", "nieuw").gte("slot_date", ymd(new Date())).order("slot_date").order("slot_time"),
    ]);
    if (b.error || bl.error || t.error) return setError("Ophalen lukte niet. Ben je ingelogd met het beheerdersadres?");
    setBookings(b.data as Booking[]);
    setBlocks(bl.data as Block[]);
    setTodo(t.data as Booking[]);
  }, [db, session, from, to]);
  useEffect(() => {
    load();
  }, [load]);

  if (!ready) return null;
  if (!db)
    return (
      <main className="mx-auto max-w-xl p-8 pt-24">
        <h1 className="text-3xl font-bold">Beheer</h1>
        <p className="mt-3 text-fg/75">De database is nog niet gekoppeld.</p>
      </main>
    );
  if (!session)
    return (
      <main className="min-h-svh bg-ink px-4">
        <Login />
      </main>
    );

  // Een boeking van twee slots bezet ook het tweede slot
  const covers = (b: Booking, t: string) => {
    const [h, m] = hhmm(b.slot_time).split(":").map(Number);
    const [th, tm] = t.split(":").map(Number);
    const at = th * 60 + tm - (h * 60 + m);
    return at >= 0 && at < 30 * (b.slot_count ?? 1);
  };
  const bookingAt = (d: string, t: string) => bookings.find((b) => b.slot_date === d && covers(b, t));
  const blockAt = (d: string, t: string | null) => blocks.find((b) => b.slot_date === d && (t === null ? b.slot_time === null : b.slot_time && hhmm(b.slot_time) === t));
  const dayBlocked = (d: string) => Boolean(blockAt(d, null));

  const setStatus = async (b: Booking, status: Booking["status"]) => {
    const { error: err } = await db.from("bookings").update({ status }).eq("id", b.id);
    if (err) return setError("Opslaan lukte niet.");
    setSelected(null);
    load();
  };
  const toggleBlock = async (d: string, t: string | null) => {
    const existing = blockAt(d, t);
    const { error: err } = existing ? await db.from("blocked_slots").delete().eq("id", existing.id) : await db.from("blocked_slots").insert({ slot_date: d, slot_time: t });
    if (err) return setError("Opslaan lukte niet.");
    load();
  };

  return (
    <main className="min-h-svh bg-ink pb-24">
      <header className="border-b border-panel-2 bg-bg print:hidden">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
          <a href="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <Logo className="size-6" /> Racket Lab · Beheer
          </a>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted max-sm:hidden">{session.user.email}</span>
            <button type="button" className="btn btn-line btn-sm" onClick={() => db.auth.signOut()}>
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <nav aria-label="Beheer" className="border-b border-panel-2 bg-bg print:hidden">
        <div className="mx-auto flex max-w-[1400px] gap-6 overflow-x-auto px-4 text-sm md:px-8">
          {(
            [
              ["agenda", "Agenda"],
              ["wachtlijst", "Wachtlijst"],
              ["bestellingen", "Bestellingen"],
              ["coaches", "Coaches"],
              ["marge", "Marge"],
              ["qr", "QR-labels"],
              ["testdag", "Test Avond"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined} className={`border-b-2 py-3 whitespace-nowrap ${tab === id ? "border-accent text-fg" : "border-transparent text-fg/70 hover:text-fg"}`}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      {tab !== "agenda" && (
        <div className="mx-auto max-w-[1400px] px-4 pt-8 md:px-8">
          {tab === "wachtlijst" && <WaitlistTab />}
          {tab === "bestellingen" && <OrdersTab />}
          {tab === "coaches" && <CoachesTab />}
          {tab === "marge" && <MarginTab />}
          {tab === "qr" && <QrTab />}
          {tab === "testdag" && <SignupsTab />}
        </div>
      )}

      <div className={`mx-auto grid max-w-[1400px] gap-8 px-4 pt-8 md:px-8 ${tab === "agenda" ? "" : "hidden"}`}>
        {error && (
          <p className="rounded-[var(--radius-control)] bg-accent px-4 py-3 text-on-accent" role="alert">
            {error}
          </p>
        )}

        {/* Taken: nieuwe tests waarvoor nog een baan in Playtomic geboekt moet worden */}
        <section aria-labelledby="todo-titel">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h1 id="todo-titel" className="text-2xl font-bold">
              Nog boeken in Playtomic <span className="text-muted tabular-nums">({todo.length})</span>
            </h1>
            <a href={PLAYTOMIC_URL} target="_blank" rel="noopener noreferrer" className="link text-sm">
              Open Poort Padel in Playtomic
            </a>
          </div>
          {todo.length === 0 ? (
            <p className="mt-3 text-fg/70">Alles is geboekt. Nieuwe tests verschijnen hier vanzelf.</p>
          ) : (
            <ul className="mt-3 grid border-t border-panel-2">
              {todo.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-panel-2 py-3">
                  <span>
                    <span className="font-semibold capitalize">{longFmt.format(fromKey(b.slot_date))}</span> om <span className="font-semibold tabular-nums">{hhmm(b.slot_time)}</span>
                    <span className="block text-sm text-muted">
                      {b.name} · {b.phone ?? b.email} · {KIND_LABEL[b.kind] ?? "Met coach"} · {b.persons} p. · {b.payment === "betaald" ? "betaald" : "nog niet betaald"}
                    </span>
                  </span>
                  <span className="flex gap-2">
                    <a href={PLAYTOMIC_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line btn-sm">
                      Playtomic
                    </a>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setStatus(b, "playtomic")}>
                      Geboekt in Playtomic
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Weekagenda */}
        <section aria-labelledby="agenda-titel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="agenda-titel" className="text-2xl font-bold">
              Agenda
            </h2>
            <div className="flex items-center gap-2">
              <button type="button" className="btn btn-line btn-sm" aria-label="Vorige week" onClick={() => setWeek((w) => new Date(w.getFullYear(), w.getMonth(), w.getDate() - 7, 12))}>
                <ChevronIcon className="size-3 rotate-180" />
              </button>
              <span className="min-w-[180px] text-center text-sm tabular-nums">
                {dayFmt.format(days[0])} – {dayFmt.format(days[6])}
              </span>
              <button type="button" className="btn btn-line btn-sm" aria-label="Volgende week" onClick={() => setWeek((w) => new Date(w.getFullYear(), w.getMonth(), w.getDate() + 7, 12))}>
                <ChevronIcon className="size-3" />
              </button>
              <button type="button" className="btn btn-line btn-sm" onClick={() => setWeek(monday(new Date()))}>
                Vandaag
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted">Klik op een vrij moment om het te blokkeren, of op een boeking voor de details.</p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-16" />
                  {days.map((d) => {
                    const k = ymd(d);
                    return (
                      <th key={k} className="border-b border-panel-2 px-1 pb-2 text-left font-normal">
                        <span className="block font-semibold capitalize">{dayFmt.format(d)}</span>
                        <button type="button" className="mt-1 text-xs text-muted underline-offset-2 hover:text-fg hover:underline" onClick={() => toggleBlock(k, null)}>
                          {dayBlocked(k) ? "Dag vrijgeven" : "Hele dag dicht"}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {TIMES.map((t) => (
                  <tr key={t}>
                    <th className="pr-2 text-left font-normal text-muted tabular-nums">{t}</th>
                    {days.map((d) => {
                      const k = ymd(d);
                      const b = bookingAt(k, t);
                      const blocked = dayBlocked(k) || Boolean(blockAt(k, t));
                      return (
                        <td key={k} className="p-0.5">
                          {b ? (
                            <button
                              type="button"
                              onClick={() => setSelected(b)}
                              className={`w-full rounded-[var(--radius-control)] px-2 py-1.5 text-left ${b.status === "nieuw" ? "bg-accent text-on-accent" : "bg-paper text-on-accent"}`}
                            >
                              <span className="block truncate font-semibold">{b.name}</span>
                              <span className="block truncate text-xs opacity-80">{b.payment === "betaald" ? "Betaald" : "Niet betaald"} · {b.status === "nieuw" ? "Playtomic" : "Geboekt"}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => !dayBlocked(k) && toggleBlock(k, t)}
                              className={`h-[42px] w-full rounded-[var(--radius-control)] border text-xs ${
                                blocked ? "border-transparent bg-panel-2 text-muted line-through" : "border-panel-2 text-muted/0 hover:border-fg/30 hover:text-muted"
                              }`}
                              aria-label={blocked ? `${t} vrijgeven` : `${t} blokkeren`}
                            >
                              {blocked ? "Dicht" : "Blokkeer"}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Details van een boeking */}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4" role="dialog" aria-modal="true" aria-label="Boeking" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-[var(--radius-panel)] border border-panel-2 bg-bg p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold capitalize">{longFmt.format(fromKey(selected.slot_date))}</h3>
            <p className="text-muted tabular-nums">{hhmm(selected.slot_time)} · {30 * (selected.slot_count ?? 1)} minuten</p>
            <dl className="mt-4 grid gap-2 text-sm">
              {[
                ["Naam", selected.name],
                ["Telefoon", selected.phone ?? "-"],
                ["E-mail", selected.email],
                ["Vorm", `${KIND_LABEL[selected.kind] ?? "Met coach"}, ${selected.persons} ${selected.persons === 1 ? "persoon" : "personen"}${selected.student ? ", leerling" : ""}`],
                ["Bedrag", selected.amount != null ? `€${Number(selected.amount).toFixed(2).replace(".", ",")} · ${selected.payment}` : "-"],
                ["Coach", selected.coach],
                ["Rackets", selected.intake?.rackets?.join(", ") || "-"],
                ["Speelt nu", selected.intake?.current || "-"],
                ["Status", selected.status === "nieuw" ? "Nog boeken in Playtomic" : "Geboekt in Playtomic"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[90px_1fr] border-b border-panel-2 pb-2">
                  <dt className="text-muted">{k}</dt>
                  <dd>{k === "E-mail" ? <a className="link" href={`mailto:${v}`}>{v}</a> : v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              {selected.status === "nieuw" && (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setStatus(selected, "playtomic")}>
                  Geboekt in Playtomic
                </button>
              )}
              <a href={PLAYTOMIC_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line btn-sm">
                Open Playtomic
              </a>
              <button type="button" className="btn btn-line btn-sm" onClick={() => confirm("Deze test annuleren? Het moment komt weer vrij.") && setStatus(selected, "geannuleerd")}>
                Annuleren
              </button>
              <button type="button" className="btn btn-sm ml-auto text-muted" onClick={() => setSelected(null)}>
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
