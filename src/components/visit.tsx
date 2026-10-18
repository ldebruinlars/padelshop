"use client";

import { useState } from "react";
import { MEDIA, SITE } from "@/lib/site";

/** Bezoek de winkel bij Poort Padel, plus aanmelden voor de nieuwsbrief (Netlify Forms). */
export function Visit() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  return (
    <section id="bezoek" className="bg-bg py-24">
      <div className="mx-auto grid max-w-[1400px] gap-4 px-5 lg:grid-cols-2">
        <div className="relative min-h-[360px] overflow-hidden rounded-[var(--radius-card)] bg-panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" decoding="async" src={MEDIA.coach} alt="Coach met een testracket bij Poort Padel" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <h2 className="text-[clamp(26px,2.6vw,36px)] leading-[1.05] font-bold">
              Kom langs bij Poort Padel
            </h2>
            <p className="mt-3 max-w-md text-fg/85">{SITE.location}. Rackets, schoenen, tassen en ballen om vast te pakken, en een baan om meteen te testen.</p>
            <a href={SITE.routeUrl} target="_blank" rel="noopener noreferrer" className="mt-5 btn btn-sand">
              Plan je route
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-[var(--radius-card)] border border-fg/5 bg-panel p-6 sm:p-10">
          <h2 className="text-[clamp(26px,2.6vw,36px)] leading-[1.05] font-bold">
            Nieuwe rackets als eerste testen
          </h2>
          <p className="mt-3 max-w-md text-fg/70">Nieuwe modellen in het testcenter, outletdeals en tips van de coaches. Afmelden kan altijd.</p>
          {state === "done" ? (
            <p className="mt-6 rounded-[var(--radius-card)] bg-accent px-5 py-4 font-semibold text-on-accent" role="status">
              Gelukt. Je staat op de lijst.
            </p>
          ) : (
            <form
              name="nieuwsbrief"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              className="mt-6 flex flex-wrap gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (state === "sending") return;
                setState("sending");
                try {
                  const data = new FormData(e.currentTarget);
                  const res = await fetch("/__forms.html", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
                  });
                  if (!res.ok) throw new Error(String(res.status));
                  setState("done");
                } catch {
                  setState("error");
                }
              }}
            >
              <input type="hidden" name="form-name" value="nieuwsbrief" />
              <p hidden>
                <label>
                  Niet invullen <input name="bot-field" />
                </label>
              </p>
              <label htmlFor="nieuwsbrief-email" className="sr-only">
                E-mailadres
              </label>
              <input
                id="nieuwsbrief-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="naam@voorbeeld.nl"
                className="field min-w-0 flex-1 bg-bg"
              />
              <button type="submit" disabled={state === "sending"} className="btn btn-primary">
                {state === "sending" ? "Bezig..." : "Aanmelden"}
              </button>
              {state === "error" && (
                <p className="w-full text-sm text-accent-2" role="alert">
                  Aanmelden lukte niet. Controleer je verbinding en probeer het opnieuw.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
