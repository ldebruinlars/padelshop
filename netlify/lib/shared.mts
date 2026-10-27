// Gedeelde helpers voor de Netlify-functies. Geheimen komen uit de omgevingsvariabelen in Netlify, nooit uit de code.
import { CONFIG } from "../../src/lib/config.ts";

export const SITE_URL = process.env.URL ?? "https://racket-lab.netlify.app";
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://pprmrrhiprchhxwkaocx.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** Rechtstreeks naar de database met de service-sleutel (alleen op de server). */
export async function rest(path: string, init: RequestInit = {}) {
  if (!SERVICE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY ontbreekt");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation", ...init.headers },
  });
  if (!res.ok) throw new Error(`supabase ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

/**
 * Melding naar het WhatsApp-nummer van Racket Lab via een webhook (bijv. een Make-scenario dat WhatsApp of Twilio aanstuurt).
 * NOTIFY_WEBHOOK_URL krijgt { to, text, kind, record }. Zonder webhook gebeurt er niets.
 */
export async function notify(kind: string, text: string, record: Record<string, unknown>) {
  const hook = process.env.NOTIFY_WEBHOOK_URL;
  if (!hook) return false;
  const res = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: CONFIG.whatsappNumber, text, kind, record }) });
  return res.ok;
}

const sha256 = async (s: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s.trim().toLowerCase()));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

/** Meta Conversions API. Pixel-ID uit de config, de token uit META_CAPI_TOKEN. Zonder een van beide gebeurt er niets. */
export async function capi(event: {
  name: string;
  id: string;
  url: string;
  ip?: string | null;
  ua?: string | null;
  email?: string;
  phone?: string;
  value?: number;
}) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token || !CONFIG.metaPixelId) return false;
  const user_data: Record<string, unknown> = { client_ip_address: event.ip ?? undefined, client_user_agent: event.ua ?? undefined };
  if (event.email) user_data.em = [await sha256(event.email)];
  if (event.phone) user_data.ph = [await sha256(event.phone.replace(/\D/g, "").replace(/^0/, "31"))];
  const body = {
    data: [
      {
        event_name: event.name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.id,
        action_source: "website",
        event_source_url: event.url,
        user_data,
        ...(event.value != null ? { custom_data: { currency: "EUR", value: event.value } } : {}),
      },
    ],
  };
  const res = await fetch(`https://graph.facebook.com/v21.0/${CONFIG.metaPixelId}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}

export type BookingRow = {
  id: string;
  slot_date: string;
  slot_time: string;
  kind: "duo" | "match" | "machine";
  persons: number;
  slot_count: number;
  student: boolean;
  amount: number;
  name: string;
  email: string;
  phone: string | null;
  coach: string;
  intake: { rackets?: string[]; answers?: Record<string, string>; current?: string };
  payment: string;
  payment_id: string | null;
  notified_at: string | null;
};

export const KIND_LABEL = { duo: "Racket Fit met coach", match: "Koppel mij", machine: "Balmachine-uur" } as const;

export const bookingText = (b: BookingRow, prefix: string) =>
  [
    `${prefix}: ${KIND_LABEL[b.kind]}, ${b.persons} ${b.persons === 1 ? "persoon" : "personen"}${b.student ? " (leerling)" : ""}`,
    `${b.slot_date} om ${b.slot_time.slice(0, 5)} (${b.slot_count * 30} min), €${Number(b.amount).toFixed(2).replace(".", ",")}`,
    `${b.name} · ${b.phone ?? "-"} · ${b.email}`,
    `Coach: ${b.coach}`,
    b.intake?.rackets?.length ? `Rackets: ${b.intake.rackets.join(", ")}` : "",
    b.intake?.current ? `Speelt nu met: ${b.intake.current}` : "",
    b.intake?.answers ? Object.entries(b.intake.answers).map(([k, v]) => `${k}: ${v}`).join(" · ") : "",
  ]
    .filter(Boolean)
    .join("\n");
