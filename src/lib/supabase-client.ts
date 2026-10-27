// De Supabase-client zelf. Staat los van booking.ts, zodat de homepage hem pas laadt bij het eerste verzoek
// (dynamische import) en alleen de beheerpagina hem meteen meeneemt.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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
