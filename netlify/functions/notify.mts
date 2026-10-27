// Melding naar Racket Lab bij een nieuwe boeking of wachtlijst-inschrijving. De browser stuurt alleen het id;
// de gegevens halen we zelf uit de database en elke melding gaat één keer (notified_at).
import { bookingText, json, notify, rest, type BookingRow } from "../lib/shared.mts";

type WaitRow = { id: string; name: string; phone: string; daypart: string | null; persons: number; preference: string | null; wish_slot: string | null; notified_at: string | null };

export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const { type, id } = (await req.json().catch(() => ({}))) as { type?: string; id?: string };
  if (!id || !/^[0-9a-f-]{36}$/.test(id) || (type !== "booking" && type !== "waitlist")) return json({ error: "input" }, 400);
  if (!process.env.NOTIFY_WEBHOOK_URL) return json({ ok: false, reason: "geen_webhook" });

  const table = type === "booking" ? "bookings" : "waitlist";
  const [row] = (await rest(`${table}?id=eq.${id}&notified_at=is.null&select=*`)) as (BookingRow & WaitRow)[];
  if (!row) return json({ ok: true });

  const text =
    type === "booking"
      ? bookingText(row, "Nieuwe boeking")
      : [
          `Wachtlijst: ${row.name} · ${row.phone}`,
          `${row.persons} ${row.persons === 1 ? "persoon" : "personen"}${row.daypart ? `, voorkeur ${row.daypart}` : ""}`,
          row.wish_slot ? `Wilde graag: ${row.wish_slot}` : "",
          row.preference ? `Past ook: ${row.preference}` : "",
        ]
          .filter(Boolean)
          .join("\n");

  const sent = await notify(type, text, { id });
  if (sent) await rest(`${table}?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ notified_at: new Date().toISOString() }) });
  return json({ ok: sent });
};
