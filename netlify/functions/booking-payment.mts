// Start een iDEAL-betaling bij Mollie voor een boeking. Het bedrag komt uit de database, niet uit de browser.
// Zonder MOLLIE_API_KEY antwoordt de functie 501: de site meldt dan dat de betaallink per WhatsApp komt.
import { SITE_URL, json, rest, KIND_LABEL, type BookingRow } from "../lib/shared.mts";

const HOLD_MINUTES = 30;

export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const key = process.env.MOLLIE_API_KEY;
  if (!key) return json({ error: "betalen_uit" }, 501);
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) return json({ error: "id" }, 400);

  const [b] = (await rest(`bookings?id=eq.${id}&select=*`)) as BookingRow[];
  if (!b || b.payment === "betaald") return json({ error: "onbekend_of_betaald" }, 409);

  const res = await fetch("https://api.mollie.com/v2/payments", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: { currency: "EUR", value: Number(b.amount).toFixed(2) },
      description: `Racket Lab ${KIND_LABEL[b.kind]} ${b.slot_date} ${b.slot_time.slice(0, 5)}`,
      redirectUrl: `${SITE_URL}/?boeking=${b.id}#testcenter`,
      webhookUrl: `${SITE_URL}/.netlify/functions/mollie-webhook`,
      method: "ideal",
      metadata: { booking: b.id },
    }),
  });
  if (!res.ok) return json({ error: "mollie" }, 502);
  const payment = (await res.json()) as { id: string; _links: { checkout: { href: string } } };

  // De plek blijft 30 minuten vast; daarna komt hij vrij als er niet betaald is
  await rest(`bookings?id=eq.${b.id}`, {
    method: "PATCH",
    body: JSON.stringify({ payment_id: payment.id, hold_until: new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString() }),
  });
  return json({ checkoutUrl: payment._links.checkout.href });
};
