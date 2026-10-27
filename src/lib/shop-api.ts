// Bestellen, coachcodes en testdag-aanmeldingen via de eigen Racket Lab-database (zie supabase/migrations).
import { db as getDb } from "./booking";

export type Source = "web" | "wand" | "balie" | "testdag";
export const SOURCES: Source[] = ["web", "wand", "balie", "testdag"];

export async function checkCoachCode(code: string): Promise<{ code: string; coach_name: string; discount_pct: number } | null> {
  const db = await getDb();
  if (!db || !code.trim()) return null;
  const { data, error } = await db.rpc("check_coach_code", { p_code: code });
  if (error) return null;
  return (data?.[0] as { code: string; coach_name: string; discount_pct: number }) ?? null;
}

export async function requestOrder(input: {
  racketId: string;
  racketLabel: string;
  listPrice: number | null;
  accessories: string[];
  name: string;
  email: string;
  phone: string;
  coachCode: string;
  source: Source;
  wantsLesson: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("niet_gekoppeld");
  const { data, error } = await db.rpc("request_order", {
    p_racket_id: input.racketId,
    p_racket_label: input.racketLabel,
    p_list_price: input.listPrice,
    p_accessories: input.accessories,
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_coach_code: input.coachCode,
    p_source: input.source,
    p_wants_lesson: input.wantsLesson,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function signupTestEvent(input: { name: string; email: string; level: string; tournament: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("niet_gekoppeld");
  const { error } = await db.rpc("signup_test_event", { p_name: input.name, p_email: input.email, p_level: input.level, p_tournament: input.tournament });
  if (error) throw new Error(error.message);
}
