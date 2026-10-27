// Mollie meldt hier elke statuswijziging. We vragen de betaling zelf op bij Mollie, dus een nep-verzoek doet niets.
import { SITE_URL, bookingText, capi, json, notify, rest, type BookingRow } from "../lib/shared.mts";

export default async (req: Request) => {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) return json({ ok: false }, 501);
  const id = new URLSearchParams(await req.text()).get("id");
  if (!id) return json({ ok: false }, 400);

  const res = await fetch(`https://api.mollie.com/v2/payments/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) return json({ ok: false }, 502);
  const p = (await res.json()) as { id: string; status: string; metadata?: { booking?: string } };
  const bookingId = p.metadata?.booking;
  if (!bookingId) return json({ ok: true });

  const [b] = (await rest(`bookings?id=eq.${bookingId}&payment_id=eq.${p.id}&select=*`)) as BookingRow[];
  if (!b) return json({ ok: true });

  if (p.status === "paid" && b.payment !== "betaald") {
    await rest(`bookings?id=eq.${b.id}`, { method: "PATCH", body: JSON.stringify({ payment: "betaald", paid_at: new Date().toISOString(), hold_until: null }) });
    await notify("booking_paid", bookingText(b, "Betaald"), { id: b.id });
    // Zelfde event-id als de pixel in de browser, zodat Meta ze samenvoegt
    await capi({ name: "purchase", id: `purchase-${b.id}`, url: `${SITE_URL}/#testcenter`, email: b.email, phone: b.phone ?? undefined, value: Number(b.amount) });
  }
  if (["failed", "canceled", "expired"].includes(p.status) && b.payment !== "betaald") {
    await rest(`bookings?id=eq.${b.id}`, { method: "PATCH", body: JSON.stringify({ payment: "mislukt" }) });
  }
  return json({ ok: true });
};
