"use client";

import { useState } from "react";
import { LEVELS } from "@/lib/catalog";
import { signupTestEvent } from "@/lib/shop-api";

const FORMAT = [
  { title: "Test", text: "Speel met zoveel rackets als je wilt, van alle tien merken, met een coach erbij." },
  { title: "Toernooi", text: "Een kort toernooi waarin je met je favoriete testracket speelt." },
  { title: "Win", text: "Onder de deelnemers verloten we een racket." },
];

/** Maandelijkse testdag met toernooi. Nog geen vaste datum: bezoekers melden zich aan en krijgen de eerste datum per mail. */
export function TestEvent() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  return (
    <section id="testdag" aria-labelledby="testdag-titel" className="border-y border-panel-2 bg-ink">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-20 md:px-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 id="testdag-titel" className="text-[clamp(30px,3.2vw,44px)] leading-[1] font-bold">
            Elke maand een testdag
          </h2>
          <p className="mt-4 max-w-[56ch] text-fg/75">Eén middag per maand ligt de hele wand op de baan. Je test, speelt een toernooitje en maakt kans op een racket.</p>
          <ol className="mt-8 grid gap-0 border-t border-panel-2">
            {FORMAT.map((f) => (
              <li key={f.title} className="grid gap-1 border-b border-panel-2 py-4 sm:grid-cols-[140px_1fr]">
                <span className="font-display text-2xl font-bold [font-stretch:85%]">{f.title}</span>
                <span className="text-fg/75">{f.text}</span>
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
              <p className="-mt-2 text-sm text-muted">De datum volgt; aanmelden is gratis en je zit nergens aan vast.</p>
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
    </section>
  );
}
