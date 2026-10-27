"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { CATALOG_RACKETS, brandName } from "@/lib/catalog";
import { supabase } from "@/lib/supabase-client";
import { EXTRAS } from "@/lib/extras";
import { SITE, euro } from "@/lib/site";

type Order = {
  id: string;
  created_at: string;
  racket_id: string;
  racket_label: string;
  list_price: number | null;
  accessories: string[];
  name: string;
  email: string;
  phone: string | null;
  coach_code: string | null;
  source: string;
  wants_lesson: boolean;
  status: "nieuw" | "klaar" | "opgehaald" | "geannuleerd";
  sold_price: number | null;
};
type Coach = { code: string; coach_name: string; discount_pct: number; commission_eur: number; active: boolean };

const STATUS: Record<Order["status"], string> = { nieuw: "Nieuw", klaar: "Ligt klaar", opgehaald: "Opgehaald", geannuleerd: "Geannuleerd" };
const dateFmt = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const extraName = (id: string) => EXTRAS.find((x) => x.id === id)?.name ?? id;

function useTable<T>(table: string, order: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const db = supabase();
    if (!db) return;
    const { data, error: err } = await db.from(table).select("*").order(order, { ascending: false });
    if (err) return setError("Ophalen lukte niet.");
    setError("");
    setRows(data as T[]);
  }, [table, order]);
  useEffect(() => {
    load();
  }, [load]);
  return { rows, error, load };
}

/** Bestellingen: aanvragen van de racketpagina's (web, QR aan de wand, balie, testdag). */
export function OrdersTab() {
  const { rows, error, load } = useTable<Order>("orders", "created_at");
  const update = async (o: Order, patch: Partial<Order>) => {
    await supabase()!.from("orders").update(patch).eq("id", o.id);
    load();
  };
  return (
    <section aria-labelledby="orders-titel">
      <h2 id="orders-titel" className="text-2xl font-bold">
        Bestellingen <span className="text-muted tabular-nums">({rows.filter((o) => o.status === "nieuw").length} nieuw)</span>
      </h2>
      {error && <p className="mt-2 text-accent">{error}</p>}
      {rows.length === 0 ? (
        <p className="mt-3 text-fg/70">Nog geen bestellingen. Ze verschijnen hier zodra iemand een racket reserveert.</p>
      ) : (
        <ul className="mt-3 grid border-t border-panel-2">
          {rows.map((o) => (
            <li key={o.id} className="grid gap-3 border-b border-panel-2 py-4 md:grid-cols-[1.4fr_1fr_auto]">
              <div>
                <p className="font-semibold">{o.racket_label}</p>
                <p className="text-sm text-muted">
                  {dateFmt.format(new Date(o.created_at))} · via {o.source}
                  {o.coach_code && ` · code ${o.coach_code}`}
                  {o.wants_lesson && " · wil lesvoordeel"}
                </p>
                {o.accessories.length > 0 && <p className="mt-1 text-sm">Erbij: {o.accessories.map(extraName).join(", ")}</p>}
              </div>
              <div className="text-sm">
                <p>{o.name}</p>
                <a className="link" href={`mailto:${o.email}`}>
                  {o.email}
                </a>
                {o.phone && <p className="text-muted">{o.phone}</p>}
              </div>
              <div className="flex flex-wrap items-start gap-2">
                <select className="field min-h-[36px] w-auto py-1 text-sm" value={o.status} onChange={(e) => update(o, { status: e.target.value as Order["status"] })} aria-label="Status">
                  {Object.entries(STATUS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-sm">
                  <span className="text-muted">Verkocht €</span>
                  <input
                    type="number"
                    step="0.01"
                    className="field min-h-[36px] w-24 py-1 text-sm"
                    defaultValue={o.sold_price ?? o.list_price ?? ""}
                    onBlur={(e) => e.target.value && update(o, { sold_price: Number(e.target.value) })}
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Coaches: codes voor tracking, korting voor de klant en commissie per verkocht racket. */
export function CoachesTab() {
  const coaches = useTable<Coach>("coach_codes", "created_at");
  const orders = useTable<Order>("orders", "created_at");
  const [msg, setMsg] = useState("");
  const sold = (code: string) => orders.rows.filter((o) => o.coach_code === code && o.status === "opgehaald");
  return (
    <section aria-labelledby="coaches-titel" className="grid gap-6">
      <div>
        <h2 id="coaches-titel" className="text-2xl font-bold">
          Coaches en codes
        </h2>
        <p className="mt-1 text-sm text-muted">
          Elke coach krijgt een eigen code en QR. Verkopen met die code tellen mee voor zijn of haar commissie (alleen opgehaalde bestellingen). Link voor een coach: {SITE.url}/rackets/?code=CODE
        </p>
      </div>
      <table className="w-full text-sm">
        <thead className="text-left text-muted">
          <tr>
            <th className="py-2 font-normal">Code</th>
            <th className="font-normal">Coach</th>
            <th className="font-normal">Korting klant</th>
            <th className="font-normal">Commissie per racket</th>
            <th className="font-normal">Verkocht</th>
            <th className="font-normal">Te betalen</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {coaches.rows.map((c) => {
            const s = sold(c.code);
            return (
              <tr key={c.code} className={`border-t border-panel-2 ${c.active ? "" : "opacity-50"}`}>
                <td className="py-2 font-semibold">{c.code}</td>
                <td>{c.coach_name}</td>
                <td className="tabular-nums">{c.discount_pct}%</td>
                <td className="tabular-nums">{euro(c.commission_eur)}</td>
                <td className="tabular-nums">{s.length}</td>
                <td className="tabular-nums">{euro(s.length * c.commission_eur)}</td>
                <td>
                  <button
                    type="button"
                    className="text-xs text-muted underline"
                    onClick={async () => {
                      await supabase()!.from("coach_codes").update({ active: !c.active }).eq("code", c.code);
                      coaches.load();
                    }}
                  >
                    {c.active ? "Uitzetten" : "Aanzetten"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <form
        className="grid gap-3 rounded-[var(--radius-card)] border border-panel-2 p-4 sm:grid-cols-[1fr_1.4fr_auto_auto_auto] sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          const { error } = await supabase()!.from("coach_codes").insert({
            code: String(d.get("code")).toUpperCase().replace(/[^A-Z0-9]/g, ""),
            coach_name: String(d.get("naam")),
            discount_pct: Number(d.get("korting") || 0),
            commission_eur: Number(d.get("commissie") || 0),
          });
          setMsg(error ? "Opslaan lukte niet: code bestaat al of is ongeldig (3-16 letters/cijfers)." : "Coach toegevoegd.");
          if (!error) {
            (e.target as HTMLFormElement).reset();
            coaches.load();
          }
        }}
      >
        <label className="grid gap-1 text-sm">
          <span className="text-muted">Code</span>
          <input name="code" required pattern="[A-Za-z0-9]{3,16}" className="field uppercase" placeholder="SANNE" />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted">Naam coach</span>
          <input name="naam" required className="field" />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted">Korting %</span>
          <input name="korting" type="number" min="0" max="25" defaultValue="0" className="field w-20" />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted">Commissie €</span>
          <input name="commissie" type="number" min="0" step="0.5" defaultValue="10" className="field w-24" />
        </label>
        <button type="submit" className="btn btn-primary btn-sm">
          Toevoegen
        </button>
        {msg && <p className="text-sm text-muted sm:col-span-5">{msg}</p>}
      </form>
    </section>
  );
}

/** Marge: inkoop per racket invullen, dan zie je marge, ruimte voor korting en commissie bij een doel van € 50. */
export function MarginTab() {
  const [costs, setCosts] = useState<Record<string, number>>({});
  const [target, setTarget] = useState(50);
  const [commission, setCommission] = useState(10);
  const [discount, setDiscount] = useState(5);
  const load = useCallback(async () => {
    const { data } = await supabase()!.from("racket_costs").select("*");
    setCosts(Object.fromEntries((data ?? []).map((r: { racket_id: string; purchase_price: number }) => [r.racket_id, Number(r.purchase_price)])));
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const save = async (id: string, value: string) => {
    if (value === "") return;
    await supabase()!.from("racket_costs").upsert({ racket_id: id, purchase_price: Number(value), updated_at: new Date().toISOString() });
    load();
  };
  const rows = CATALOG_RACKETS.map((r) => {
    const cost = costs[r.id];
    const price = r.price ?? 0;
    const gross = cost != null ? price - cost : null;
    const net = gross != null ? gross - commission - price * (discount / 100) : null;
    return { r, cost, price, gross, net, room: gross != null ? gross - target : null };
  });
  const filled = rows.filter((x) => x.net != null);
  return (
    <section aria-labelledby="marge-titel" className="grid gap-5">
      <div>
        <h2 id="marge-titel" className="text-2xl font-bold">
          Marge per racket
        </h2>
        <p className="mt-1 text-sm text-muted">
          Vul de inkoopprijs in (wordt opgeslagen). Netto = verkoopprijs − inkoop − commissie coach − korting met coachcode. Rood: netto onder je doel.
        </p>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="grid gap-1">
          <span className="text-muted">Doelmarge €</span>
          <input type="number" className="field w-24" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
        </label>
        <label className="grid gap-1">
          <span className="text-muted">Commissie coach €</span>
          <input type="number" className="field w-24" value={commission} onChange={(e) => setCommission(Number(e.target.value))} />
        </label>
        <label className="grid gap-1">
          <span className="text-muted">Korting klant %</span>
          <input type="number" className="field w-24" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
        </label>
        {filled.length > 0 && (
          <p className="self-end text-fg/80">
            Gemiddeld netto: <strong className="tabular-nums">{euro(filled.reduce((n, x) => n + (x.net ?? 0), 0) / filled.length)}</strong> over {filled.length} rackets
          </p>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="py-2 font-normal">Racket</th>
              <th className="font-normal">Verkoop</th>
              <th className="font-normal">Inkoop</th>
              <th className="font-normal">Bruto marge</th>
              <th className="font-normal">Netto na coach + korting</th>
              <th className="font-normal">Ruimte boven doel</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ r, cost, price, gross, net, room }) => (
              <tr key={r.id} className="border-t border-panel-2">
                <td className="py-2">
                  <span className="text-muted">{brandName(r.brand)}</span> {r.model}
                </td>
                <td className="tabular-nums">{price ? euro(price) : "–"}</td>
                <td>
                  <input type="number" step="0.01" className="field min-h-[34px] w-24 py-1" defaultValue={cost ?? ""} onBlur={(e) => save(r.id, e.target.value)} aria-label={`Inkoop ${r.model}`} />
                </td>
                <td className="tabular-nums">{gross != null ? euro(gross) : "–"}</td>
                <td className={`tabular-nums ${net != null && net < target ? "font-semibold text-accent" : ""}`}>{net != null ? euro(net) : "–"}</td>
                <td className="tabular-nums">{room != null ? euro(room) : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** QR-labels om te printen: per racket merk, model, prijs en een QR naar de racketpagina (bron: wand). */
export function QrTab() {
  const [svgs, setSvgs] = useState<Record<string, string>>({});
  const list = useMemo(() => CATALOG_RACKETS, []);
  useEffect(() => {
    Promise.all(
      list.map(async (r) => [r.id, await QRCode.toString(`${SITE.url}/rackets/${r.id}/?bron=wand`, { type: "svg", margin: 0, color: { dark: "#14110f", light: "#00000000" } })] as const),
    ).then((pairs) => setSvgs(Object.fromEntries(pairs)));
  }, [list]);
  return (
    <section aria-labelledby="qr-titel">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 id="qr-titel" className="text-2xl font-bold">
            QR-labels voor de wand
          </h2>
          <p className="mt-1 text-sm text-muted">Print op A4 en knip uit. De QR opent de racketpagina waar klanten kunnen reserveren; bestellingen krijgen als bron &quot;wand&quot;.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
          Printen
        </button>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-3 print:gap-2">
        {list.map((r) => (
          <li key={r.id} className="grid grid-cols-[1fr_72px] items-center gap-3 rounded-[4px] bg-paper p-3 text-on-accent break-inside-avoid">
            <span>
              <span className="block text-[10px] font-semibold tracking-[0.04em] uppercase opacity-70">{brandName(r.brand)}</span>
              <span className="mt-0.5 block text-sm leading-tight font-semibold">{r.model}</span>
              {r.price != null && <span className="mt-1 block font-display text-lg font-bold tabular-nums">{euro(r.price)}</span>}
              <span className="block text-[10px] opacity-70">Scan voor specs en reserveren</span>
            </span>
            <span className="block size-[72px]" dangerouslySetInnerHTML={{ __html: svgs[r.id] ?? "" }} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Aanmeldingen voor de maandelijkse testdag. */
export function SignupsTab() {
  const { rows } = useTable<{ id: string; created_at: string; name: string; email: string; level: string | null; wants_tournament: boolean }>("event_signups", "created_at");
  return (
    <section aria-labelledby="testdag-beheer">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="testdag-beheer" className="text-2xl font-bold">
          Aanmeldingen Racket Test Avond <span className="text-muted tabular-nums">({rows.length})</span>
        </h2>
        {rows.length > 0 && (
          <a className="link text-sm" href={`mailto:?bcc=${rows.map((r) => r.email).join(",")}&subject=${encodeURIComponent("Racket Lab Test Avond")}`}>
            Mail iedereen
          </a>
        )}
      </div>
      <ul className="mt-3 grid border-t border-panel-2 text-sm">
        {rows.map((r) => (
          <li key={r.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 border-b border-panel-2 py-2.5">
            <span>{r.name}</span>
            <span className="text-muted">{r.email}</span>
            <span className="text-muted">
              {r.level}
              {r.wants_tournament && " · toernooi"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

type WaitRow = { id: string; created_at: string; name: string; phone: string; daypart: string | null; persons: number; preference: string | null; wish_slot: string | null; status: "nieuw" | "gebeld" | "geplaatst" | "vervallen" };

/** Wachtlijst: iedereen die geen passend slot vond. Bel of app ze zodra er een plek vrijkomt. */
export function WaitlistTab() {
  const { rows, error, load } = useTable<WaitRow>("waitlist", "created_at");
  const setStatus = async (r: WaitRow, status: WaitRow["status"]) => {
    await supabase()!.from("waitlist").update({ status }).eq("id", r.id);
    load();
  };
  const open = rows.filter((r) => r.status === "nieuw" || r.status === "gebeld");
  return (
    <section aria-labelledby="wachtlijst-beheer">
      <h2 id="wachtlijst-beheer" className="text-2xl font-bold">
        Wachtlijst <span className="text-muted tabular-nums">({open.length} open)</span>
      </h2>
      {error && <p className="mt-2 text-sm text-accent">{error}</p>}
      <ul className="mt-3 grid border-t border-panel-2 text-sm">
        {rows.map((r) => (
          <li key={r.id} className={`grid gap-2 border-b border-panel-2 py-3 sm:grid-cols-[1.2fr_1.6fr_auto] ${r.status === "geplaatst" || r.status === "vervallen" ? "opacity-50" : ""}`}>
            <span>
              <span className="font-semibold">{r.name}</span>
              <a className="link block" href={`tel:${r.phone}`}>
                {r.phone}
              </a>
            </span>
            <span className="text-muted">
              {r.persons} {r.persons === 1 ? "persoon" : "personen"}
              {r.daypart && ` · ${r.daypart}`}
              {r.wish_slot && ` · wilde ${r.wish_slot}`}
              {r.preference && <span className="block text-fg/80">{r.preference}</span>}
            </span>
            <span className="flex flex-wrap gap-1.5">
              {(["gebeld", "geplaatst", "vervallen"] as const).map((st) => (
                <button key={st} type="button" className="chip" aria-pressed={r.status === st} onClick={() => setStatus(r, st)}>
                  {st}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
