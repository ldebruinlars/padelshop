// Racket-test boeken: vaste tijden, coaches of de balmachine, en de koppeling met Supabase (eigen Racket Lab-project).
import type { SupabaseClient } from "@supabase/supabase-js";

export const TIMES = ["09:00", "09:45", "10:30", "11:15", "13:00", "13:45", "14:30", "17:00", "17:45", "18:30", "19:15", "20:00"];

/** Tijden per dagdeel, voor het rooster. */
export const DAYPARTS = [
  { label: "Ochtend", times: TIMES.filter((t) => t < "12:00") },
  { label: "Middag", times: TIMES.filter((t) => t >= "12:00" && t < "17:00") },
  { label: "Avond", times: TIMES.filter((t) => t >= "17:00") },
];

/** Zo ver vooruit kun je boeken. */
export const BOOK_AHEAD_DAYS = 42;

// Voorbeeldnamen: vervang ze door de echte coaches van het testcenter.
export const COACHES = [
  { id: "any", name: "Eerste beschikbare coach" },
  { id: "c1", name: "Coach Sanne" },
  { id: "c2", name: "Coach Daan" },
];

/** Hoe je test: met een coach of zelf met de balmachine. De naam komt in de boeking (kolom coach). */
export const TEST_MODES = [
  { id: "coach", title: "Met een coach", text: "Een coach kijkt naar je slagen, legt rackets klaar en wisselt ze met je af." },
  { id: "machine", title: "Met de balmachine", text: "De machine speelt de ballen aan. Jij wisselt zelf van racket, in je eigen tempo." },
] as const;
export type TestMode = (typeof TEST_MODES)[number]["id"];
export const MACHINE = "Balmachine";

// Poort Padel op Playtomic: hier boek je de baan nadat een test binnenkomt.
export const PLAYTOMIC_URL = "https://playtomic.com/clubs/poort-padel";

/** De client pas laden bij het eerste verzoek, zodat supabase-js niet in de eerste download van de homepage zit. */
export async function db(): Promise<SupabaseClient | null> {
  const { supabase } = await import("./supabase-client");
  return supabase();
}

export type Taken = { slot_date: string; slot_time: string; whole_day: boolean };

/** Bezette en geblokkeerde momenten tussen twee datums (yyyy-mm-dd). */
export async function takenSlots(from: string, to: string): Promise<Taken[]> {
  const client = await db();
  if (!client) return [];
  const { data, error } = await client.rpc("taken_slots", { p_from: from, p_to: to });
  if (error) throw error;
  return (data ?? []) as Taken[];
}

/** Boek een test. Gooit "moment_bezet" als iemand anders net dezelfde tijd nam. */
export async function bookTest(input: { date: string; time: string; coach: string; name: string; email: string }) {
  const client = await db();
  if (!client) throw new Error("niet_gekoppeld");
  const { data, error } = await client.rpc("book_test", { p_date: input.date, p_time: input.time, p_coach: input.coach, p_name: input.name, p_email: input.email });
  if (error) throw new Error(error.message.includes("moment_bezet") ? "moment_bezet" : error.message);
  return data as string;
}

export const hhmm = (t: string) => t.slice(0, 5);
