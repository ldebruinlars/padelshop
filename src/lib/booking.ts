// Racket Fit boeken: vaste testslots, drie vormen, de wachtlijst en de koppeling met Supabase (eigen Racket Lab-project).
// De prijzen en het rooster staan ook in supabase/migrations/0004_racket_fit.sql; pas ze daar mee aan.
import type { SupabaseClient } from "@supabase/supabase-js";
import { COACH_PROFILES } from "./config";

/** Startrooster: per weekdag (0 = zondag) de starttijden van slots van 30 minuten. */
export const SCHEDULE: Record<number, string[]> = {
  2: ["09:00", "09:30", "10:00", "10:30", "11:00"], // dinsdag 09:00-11:30
  4: ["12:00", "12:30", "13:00", "13:30", "14:00"], // donderdag 12:00-14:30
  6: ["09:00", "09:30", "10:00", "10:30", "11:00"], // zaterdag 09:00-11:30
};
export const SCHEDULE_TEXT = "dinsdag 09:00-11:30, donderdag 12:00-14:30 en zaterdag 09:00-11:30";
/** Alle tijden die ergens in het rooster voorkomen (voor de beheeragenda). */
export const TIMES = [...new Set(Object.values(SCHEDULE).flat())].sort();

/** Zo ver vooruit kun je boeken. */
export const BOOK_AHEAD_DAYS = 42;

export const PRICES = {
  fit1: 30,
  fit2: 52.5,
  match: 26.25,
  machine: 60,
  student: 15,
};

export const FIT_KINDS = [
  {
    id: "duo",
    title: "Met coach, alleen of met eigen partner",
    text: "30 minuten, 3 rackets op maat in de hand en per racket een eerlijk oordeel.",
    price: "€30 p.p. · €52,50 voor twee",
  },
  {
    id: "match",
    title: "Koppel mij",
    text: "Alleen gekomen? We zetten je bij een andere tester van jouw niveau. Voorlopig geboekt tot er een match is.",
    price: "€26,25",
  },
  {
    id: "machine",
    title: "Balmachine-uur",
    text: "60 minuten, 1 speler, 5 rackets, zonder coach. Je laat een ID achter.",
    price: "€60",
  },
] as const;
export type FitKind = (typeof FIT_KINDS)[number]["id"];

/** Hoeveel slots van 30 minuten een boeking vraagt en wat hij kost. Gelijk aan book_fit in de database. */
export function quote(kind: FitKind, persons: number, student: boolean) {
  if (kind === "machine") return { slots: 2, amount: PRICES.machine, persons: 1 };
  if (kind === "match") return { slots: 1, amount: PRICES.match, persons: 1 };
  if (student && persons === 1) return { slots: 1, amount: PRICES.student, persons: 1 };
  // Met 3 of 4 personen boek je twee slots achter elkaar
  const amount = persons === 1 ? PRICES.fit1 : persons === 2 ? PRICES.fit2 : persons === 3 ? PRICES.fit2 + PRICES.fit1 : PRICES.fit2 * 2;
  return { slots: persons > 2 ? 2 : 1, amount, persons };
}

export const COACHES = [{ id: "any", name: "Maakt niet uit" }, ...COACH_PROFILES.map((c) => ({ id: c.id, name: c.name }))];

export const DAYPARTS = ["ochtend", "lunch", "middag", "avond"] as const;

// Poort Padel op Playtomic: hier boek je de baan nadat een test binnenkomt.
export const PLAYTOMIC_URL = "https://playtomic.com/clubs/poort-padel";

/** De client pas laden bij het eerste verzoek, zodat supabase-js niet in de eerste download van de homepage zit. */
export async function db(): Promise<SupabaseClient | null> {
  const { supabase } = await import("./supabase-client");
  return supabase();
}

export type Taken = { slot_date: string; slot_time: string; whole_day: boolean };

/** Bezette en geblokkeerde momenten tussen twee datums (yyyy-mm-dd). Een boeking van twee slots geeft twee regels. */
export async function takenSlots(from: string, to: string): Promise<Taken[]> {
  const client = await db();
  if (!client) return [];
  const { data, error } = await client.rpc("taken_slots", { p_from: from, p_to: to });
  if (error) throw error;
  return (data ?? []) as Taken[];
}

export type FitInput = {
  kind: FitKind;
  persons: number;
  student: boolean;
  date: string;
  time: string;
  coach: string;
  name: string;
  phone: string;
  email: string;
  intake: Record<string, unknown>;
};

/** Boek een Racket Fit. Gooit "moment_bezet" als iemand anders net dezelfde tijd nam. */
export async function bookFit(input: FitInput): Promise<{ id: string; amount: number }> {
  const client = await db();
  if (!client) throw new Error("niet_gekoppeld");
  const { data, error } = await client.rpc("book_fit", {
    p_kind: input.kind,
    p_persons: input.persons,
    p_student: input.student,
    p_date: input.date,
    p_time: input.time,
    p_coach: input.coach,
    p_name: input.name,
    p_phone: input.phone,
    p_email: input.email,
    p_intake: input.intake,
  });
  if (error) throw new Error(error.message.includes("moment_bezet") ? "moment_bezet" : error.message);
  const row = (Array.isArray(data) ? data[0] : data) as { id: string; amount: number };
  return { id: row.id, amount: Number(row.amount) };
}

/** Op de wachtlijst: telefoonnummer verplicht, de rest helpt bij het plannen. */
export async function joinWaitlist(input: { name: string; phone: string; daypart: string; persons: number; preference: string; wishSlot: string }) {
  const client = await db();
  if (!client) throw new Error("niet_gekoppeld");
  const { data, error } = await client.rpc("join_waitlist", {
    p_name: input.name,
    p_phone: input.phone,
    p_daypart: input.daypart,
    p_persons: input.persons,
    p_preference: input.preference,
    p_wish_slot: input.wishSlot,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export type BookingState = { slot_date: string; slot_time: string; kind: FitKind; amount: number; payment: "open" | "betaald" | "mislukt" };

/** Status van een boeking na terugkomst van de betaalpagina. */
export async function bookingState(id: string): Promise<BookingState | null> {
  const client = await db();
  if (!client) return null;
  const { data, error } = await client.rpc("booking_state", { p_id: id });
  if (error) return null;
  return ((Array.isArray(data) ? data[0] : data) as BookingState | undefined) ?? null;
}

/** Betaling starten via de Netlify-functie (Mollie, iDEAL). null = online betalen staat nog niet aan. */
export async function startPayment(id: string): Promise<string | null> {
  try {
    const res = await fetch("/.netlify/functions/booking-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!res.ok) return null;
    const { checkoutUrl } = (await res.json()) as { checkoutUrl?: string };
    return checkoutUrl ?? null;
  } catch {
    return null;
  }
}

/** Melding naar het WhatsApp-nummer van Racket Lab. De functie zoekt de gegevens zelf op en stuurt elke melding één keer. */
export function notifyTeam(type: "booking" | "waitlist", id: string) {
  fetch("/.netlify/functions/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id }), keepalive: true }).catch(() => null);
}

export const hhmm = (t: string) => t.slice(0, 5);
export const eur = (n: number) => `€${n.toFixed(n % 1 ? 2 : 0).replace(".", ",")}`;
