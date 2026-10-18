"use client";

import { useEffect, useState } from "react";
import { MEDIA, SITE } from "@/lib/site";
import { ArrowIcon } from "./icons";
import { RevealPanel } from "./reveal-panel";

// Voorbeelddata: later koppelen aan een echte agenda (bijv. Cal.com of Playtomic).
const COACHES = [
  { id: "any", name: "Eerste beschikbare coach" },
  { id: "c1", name: "Coach Sanne" },
  { id: "c2", name: "Coach Daan" },
];
const TIMES = ["09:00", "09:45", "10:30", "11:15", "13:00", "13:45", "14:30", "17:00", "17:45", "18:30", "19:15", "20:00"];
const TAKEN = new Set(["09:45", "13:00", "17:45", "19:15"]);
const PRICE = 29.95;

function nextDays(n: number) {
  const fmt = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short" });
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return { key: d.toISOString().slice(0, 10), label: fmt.format(d) };
  });
}

/** Testcenter: vast tijdslot met coach boeken, plus het thuistest-pakket. */
export function Testcenter() {
  // Datums pas in de browser berekenen, zodat server en client hetzelfde renderen.
  const [days, setDays] = useState<{ key: string; label: string }[]>([]);
  const [day, setDay] = useState("");
  useEffect(() => {
    const d = nextDays(6);
    setDays(d);
    setDay(d[0].key);
  }, []);
  const [time, setTime] = useState<string | null>(null);
  const [coach, setCoach] = useState("any");
  const [booked, setBooked] = useState(false);

  return (
    <RevealPanel id="testcenter" className="bg-navy">
      <div className="grid lg:grid-cols-[1fr_1.1fr]">
        <div className="relative min-h-[420px] bg-[radial-gradient(circle_at_40%_40%,#1d2f47,#0b1420)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MEDIA.coach} alt="Coach geeft een testracket aan een speler bij Poort Padel" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 grid gap-2 p-8 sm:grid-cols-3">
            {[
              ["45 min", "op de baan"],
              ["3 tot 5", "rackets voor jouw stijl"],
              ["€ 29,95", "terug bij aankoop"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-2xl border border-white/10 bg-navy/70 p-4 backdrop-blur">
                <div className="text-2xl font-semibold tracking-tight">{a}</div>
                <div className="text-sm text-mist">{b}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-12">
          <p className="eyebrow">Testcenter · {SITE.location}</p>
          <h2 className="mt-5 text-[clamp(34px,4vw,56px)] leading-[0.95] font-medium">
            Boek je <span className="accent">racket-test</span>.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Een coach van All Court Academy kijkt naar je slagen en legt rackets klaar die bij je passen. Koop je daarna een racket, dan krijg je de € {PRICE.toFixed(2).replace(".", ",")} terug.
          </p>

          {booked ? (
            <div className="mt-8 rounded-[var(--radius-card)] bg-lime p-6 text-navy" role="status">
              <p className="font-ui text-[11px] font-semibold tracking-[0.14em] uppercase">Aanvraag ontvangen (voorbeeld)</p>
              <p className="mt-2 text-2xl font-semibold">
                {days.find((d) => d.key === day)?.label} om {time}
              </p>
              <p className="mt-1">{COACHES.find((c) => c.id === coach)?.name}. Je krijgt een bevestiging per mail.</p>
              <button type="button" className="mt-4 text-sm underline" onClick={() => setBooked(false)}>
                Ander moment kiezen
              </button>
            </div>
          ) : (
            <form
              className="mt-8 grid gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (time) setBooked(true);
              }}
            >
              <fieldset>
                <legend className="mb-2 font-ui text-[11px] font-semibold tracking-[0.14em] text-mist uppercase">Dag</legend>
                <div className="flex flex-wrap gap-2">
                  {days.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => {
                        setDay(d.key);
                        setTime(null);
                      }}
                      aria-pressed={day === d.key}
                      className={`rounded-full border px-4 py-2 text-sm capitalize transition-colors ${day === d.key ? "border-white bg-white text-navy" : "border-navy-3 text-white hover:border-white/40"}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 font-ui text-[11px] font-semibold tracking-[0.14em] text-mist uppercase">Tijd</legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {TIMES.map((t) => {
                    const taken = TAKEN.has(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={taken}
                        onClick={() => setTime(t)}
                        aria-pressed={time === t}
                        className={`rounded-full border px-3 py-2 font-ui text-sm tabular-nums transition-colors ${
                          taken ? "cursor-not-allowed border-transparent text-white/25 line-through" : time === t ? "border-lime bg-lime text-navy" : "border-navy-3 hover:border-lime"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="grid gap-2">
                <span className="font-ui text-[11px] font-semibold tracking-[0.14em] text-mist uppercase">Coach</span>
                <select
                  id="coach"
                  value={coach}
                  onChange={(e) => setCoach(e.target.value)}
                  className="rounded-full border border-navy-3 bg-navy-2 px-4 py-3 text-white"
                >
                  {COACHES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={!time}
                className="flex items-center justify-between gap-3 rounded-full bg-lime py-2 pr-2 pl-6 font-semibold text-navy transition-opacity disabled:opacity-40"
              >
                {time ? `Boek ${time} · € ${PRICE.toFixed(2).replace(".", ",")}` : "Kies eerst een tijd"}
                <span className="grid size-9 place-items-center rounded-full bg-navy">
                  <ArrowIcon className="size-3 text-lime" />
                </span>
              </button>
            </form>
          )}
        </div>
      </div>

      <div id="thuistest" className="grid gap-6 border-t border-white/5 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
        <div>
          <p className="eyebrow">Geen tijd om langs te komen?</p>
          <h3 className="mt-4 text-3xl font-medium">
            Thuistest: drie rackets, <span className="accent">veertien dagen</span>.
          </h3>
          <p className="mt-2 max-w-xl text-white/70">We sturen tot drie testrackets naar je toe. Speel er twee weken mee op je eigen club en stuur terug wat je niet houdt.</p>
        </div>
        <a href="#finder" className="flex items-center gap-3 self-start rounded-full bg-sand py-2 pr-2 pl-5 font-semibold text-navy md:self-center">
          Kies je testrackets
          <span className="grid size-8 place-items-center rounded-full bg-navy">
            <ArrowIcon className="size-3 text-lime" />
          </span>
        </a>
      </div>
    </RevealPanel>
  );
}
