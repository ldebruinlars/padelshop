"use client";

import { useState } from "react";
import { LEVELS } from "@/lib/catalog";
import { signupTestEvent } from "@/lib/shop-api";

// Het programma van een testmiddag. Tijden zijn een voorbeeld; de datum en het precieze schema komen per mail.
const PROGRAM = [
  { time: "13:00", title: "Testuur per niveau", text: "De hele wand ligt op de baan, ook de Racket Lab eigen lijn. Beginners en gevorderden testen apart, met een coach die rackets aanreikt." },
  { time: "14:00", title: "Americano met je testracket", text: "Rondes van 20 minuten met steeds een andere partner. Je scoort punten voor jezelf, dus je hoeft geen team mee te nemen." },
  { time: "15:30", title: "Finale", text: "De vier spelers met de meeste punten spelen de finale, op niveau ingedeeld zoals bij een Mexicano." },
  { time: "16:00", title: "Prijsuitreiking en loting", text: "De winnaar wint een racket. Daarna loten we onder alle deelnemers nog een racket." },
];

const FORMATS = [
  { id: "americano", name: "Americano", text: "Elke ronde een andere partner, punten per speler. Gezellig en eerlijk voor alle niveaus: zo spelen we de toernooironde." },
  { id: "mexicano", name: "Mexicano", text: "De eerste ronde is willekeurig, daarna speel je tegen spelers met evenveel punten. Zo blijven de wedstrijden spannend tot het eind." },
  { id: "king", name: "King of the Court", text: "Win je, dan schuif je een baan op; verlies je, dan zak je. Voor de avonden waarop we op niveau spelen." },
];

const LADDER = [
  ["Winnaar van de finale", 10],
  ["Tweede", 8],
  ["Derde en vierde", 6],
  ["Meegedaan aan het toernooi", 2],
  ["Racket beoordeeld na het testen", 1],
] as const;

/** Maandelijkse testdag met toernooi, loting en een seizoensklassement. Bezoekers melden zich aan en krijgen de datum per mail. */
export function TestEvent() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [format, setFormat] = useState<(typeof FORMATS)[number]["id"]>("americano");
  return (
    <section id="testdag" aria-labelledby="testdag-titel" className="border-y border-panel-2 bg-ink">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 id="testdag-titel" className="text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">
              Testdag en toernooi, elke maand
            </h2>
            <p className="mt-4 max-w-[56ch] text-fg/75">
              Eén zaterdagmiddag per maand ligt de hele wand op de baan bij Poort Padel. Je test zoveel rackets als je wilt, speelt een toernooi met je favoriet en maakt twee keer kans op een racket.
            </p>

            <h3 className="mt-10 label text-muted">Het programma</h3>
            <ol className="mt-3 grid border-t border-panel-2">
              {PROGRAM.map((p) => (
                <li key={p.title} className="grid gap-1 border-b border-panel-2 py-4 sm:grid-cols-[72px_1fr] sm:gap-5">
                  <span className="font-display text-xl font-bold text-accent tabular-nums">{p.time}</span>
                  <span>
                    <span className="block font-semibold">{p.title}</span>
                    <span className="mt-1 block text-fg/70">{p.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="self-start rounded-[var(--radius-panel)] border border-panel-2 bg-bg p-6 md:p-8">
            {state === "done" ? (
              <div role="status">
                <p className="text-2xl font-bold">Je staat op de lijst</p>
                <p className="mt-2 text-fg/75">Zodra de datum van de eerste testdag vaststaat, krijg je een mail om je plek te bevestigen.</p>
              </div>
            ) : (
              <form
                className="grid gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  setState("sending");
                  try {
                    await signupTestEvent({ name: String(d.get("naam") ?? ""), email: String(d.get("email") ?? ""), level: String(d.get("niveau") ?? ""), tournament: d.get("toernooi") === "on" });
                    setState("done");
                  } catch {
                    setState("error");
                  }
                }}
              >
                <p className="text-xl font-bold">Meld je aan voor de eerste testdag</p>
                <p className="-mt-2 text-sm text-muted">De datum volgt; aanmelden is gratis en je zit nergens aan vast. Je hoeft geen partner mee te nemen.</p>
                <label className="grid gap-2">
                  <span className="label text-muted">Naam</span>
                  <input name="naam" required autoComplete="name" className="field" />
                </label>
                <label className="grid gap-2">
                  <span className="label text-muted">E-mail</span>
                  <input name="email" type="email" required autoComplete="email" className="field" />
                </label>
                <label className="grid gap-2">
                  <span className="label text-muted">Niveau</span>
                  <select name="niveau" className="field" defaultValue="Gemiddeld">
                    {LEVELS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" name="toernooi" defaultChecked className="size-4 accent-[var(--color-accent)]" />
                  Ik doe ook mee aan het toernooi
                </label>
                {state === "error" && (
                  <p className="rounded-[var(--radius-control)] bg-accent-2 px-4 py-3 text-sm text-on-accent" role="alert">
                    Aanmelden lukte niet. Probeer het opnieuw.
                  </p>
                )}
                <button type="submit" className="btn btn-primary justify-self-start" disabled={state === "sending"}>
                  {state === "sending" ? "Versturen…" : "Aanmelden"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-14 grid gap-10 border-t border-panel-2 pt-10 lg:grid-cols-3">
          {/* Twee kansen op een racket */}
          <div>
            <h3 className="text-xl font-bold">Twee kansen op een racket</h3>
            <ul className="mt-4 grid gap-3 text-fg/75">
              <li>
                <strong className="font-semibold text-fg">Winnen:</strong> de winnaar van de finale wint een racket.
              </li>
              <li>
                <strong className="font-semibold text-fg">Loting:</strong> iedereen die meedoet krijgt een lot. Beoordeel je na het testen een racket, dan krijg je er een tweede lot bij.
              </li>
              <li>
                <strong className="font-semibold text-fg">Meteen mee:</strong> testen kost op de testdag niets, en koop je op de dag zelf, dan neem je je racket meteen mee naar huis.
              </li>
            </ul>
          </div>

          {/* Spelvormen */}
          <div>
            <h3 className="text-xl font-bold">Zo spelen we</h3>
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Spelvorm">
              {FORMATS.map((f) => (
                <button key={f.id} type="button" role="tab" aria-selected={format === f.id} className="chip" onClick={() => setFormat(f.id)}>
                  {f.name}
                </button>
              ))}
            </div>
            <p className="mt-3 min-h-[4lh] text-fg/75" role="tabpanel" aria-live="polite">
              {FORMATS.find((f) => f.id === format)!.text}
            </p>
          </div>

          {/* Seizoensklassement */}
          <div>
            <h3 className="text-xl font-bold">Het seizoensklassement</h3>
            <p className="mt-2 text-fg/75">Elke testdag levert punten op. Na het seizoen wint de nummer één van het klassement een racket naar keuze van de wand.</p>
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">Punten per testdag</caption>
              <tbody>
                {LADDER.map(([k, v]) => (
                  <tr key={k} className="border-b border-panel-2">
                    <th scope="row" className="py-2 text-left font-normal text-fg/80">
                      {k}
                    </th>
                    <td className="py-2 text-right font-semibold tabular-nums">{v} pt</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted">Het klassement start bij de eerste testdag.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
