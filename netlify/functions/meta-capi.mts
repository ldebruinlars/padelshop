// Conversions API voor de events uit de browser (quiz_complete, waitlist, booking). Alleen na toestemming voor marketingcookies;
// de browser stuurt dan hetzelfde event-id mee als de pixel, zodat Meta dubbele events samenvoegt.
import { capi, json } from "../lib/shared.mts";

const EVENTS = new Set(["quiz_complete", "waitlist", "booking", "purchase"]);

export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const e = (await req.json().catch(() => ({}))) as { name?: string; id?: string; url?: string; email?: string; phone?: string; value?: number };
  if (!e.name || !EVENTS.has(e.name) || !e.id || e.id.length > 80) return json({ error: "input" }, 400);
  const ok = await capi({
    name: e.name,
    id: e.id,
    url: typeof e.url === "string" ? e.url.slice(0, 300) : "",
    ip: req.headers.get("x-nf-client-connection-ip"),
    ua: req.headers.get("user-agent"),
    email: typeof e.email === "string" ? e.email.slice(0, 200) : undefined,
    phone: typeof e.phone === "string" ? e.phone.slice(0, 30) : undefined,
    value: typeof e.value === "number" ? e.value : undefined,
  });
  return json({ ok });
};
