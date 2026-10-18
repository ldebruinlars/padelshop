// Racket-test boeken: vaste tijden, coaches en de koppeling met Supabase (eigen Racket Lab-project).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const TIMES = ["09:00", "09:45", "10:30", "11:15", "13:00", "13:45", "14:30", "17:00", "17:45", "18:30", "19:15", "20:00"];

// Voorbeeldnamen: vervang ze door de echte coaches van het testcenter.
export const COACHES = [
  { id: "any", name: "Eerste beschikbare coach" },
  { id: "c1", name: "Coach Sanne" },
  { id: "c2", name: "Coach Daan" },
];

// Poort Padel op Playtomic: hier boek je de baan nadat een test binnenkomt.
export const PLAYTOMIC_URL = "https://playtomic.com/clubs/poort-padel";

// De publieke sleutel mag in de browser staan; de database laat bezoekers alleen boeken en bezette tijden zien.
// Eigen Racket Lab-project (los van andere projecten in dezelfde Supabase-organisatie).
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://pprmrrhiprchhxwkaocx.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_KefKZ6wZjzeG3WJClyhuDQ_BOkiUu8w";

let client: SupabaseClient | null = null;
export function supabase() {
  if (!URL || !KEY) return null;
  client ??= createClient(URL, KEY, { auth: { persistSession: true, detectSessionInUrl: true, flowType: "pkce" } });
  return client;
}

export type Taken = { slot_date: string; slot_time: string; whole_day: boolean };

/** Bezette en geblokkeerde momenten tussen twee datums (yyyy-mm-dd). */
export async function takenSlots(from: string, to: string): Promise<Taken[]> {
  const db = supabase();
  if (!db) return [];
  const { data, error } = await db.rpc("taken_slots", { p_from: from, p_to: to });
  if (error) throw error;
  return (data ?? []) as Taken[];
}

/** Boek een test. Gooit "moment_bezet" als iemand anders net dezelfde tijd nam. */
export async function bookTest(input: { date: string; time: string; coach: string; name: string; email: string }) {
  const db = supabase();
  if (!db) throw new Error("niet_gekoppeld");
  const { data, error } = await db.rpc("book_test", { p_date: input.date, p_time: input.time, p_coach: input.coach, p_name: input.name, p_email: input.email });
  if (error) throw new Error(error.message.includes("moment_bezet") ? "moment_bezet" : error.message);
  return data as string;
}

export const hhmm = (t: string) => t.slice(0, 5);
