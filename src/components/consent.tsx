"use client";

import { useEffect, useState } from "react";
import { CONFIG } from "@/lib/config";
import { consent, loadPixel, setConsent } from "@/lib/track";

/** Cookiemelding voor de Meta Pixel. Verschijnt alleen als er een pixel-ID in de config staat en de bezoeker nog niet koos. */
export function Consent() {
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    if (!CONFIG.metaPixelId) return;
    const c = consent();
    if (c === "ja") loadPixel();
    else if (c === null) setAsk(true);
  }, []);

  if (!ask) return null;
  return (
    <div role="dialog" aria-label="Cookies" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-[var(--radius-card)] border border-panel-2 bg-bg p-4 shadow-[0_12px_40px_rgb(0_0_0/0.45)] sm:p-5">
      <p className="text-sm text-fg/85">
        Mogen we een marketingcookie van Meta gebruiken? Dan zien we welke advertenties mensen naar een racket-test brengen. Zonder cookie werkt de site precies hetzelfde.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setConsent("ja");
            setAsk(false);
          }}
        >
          Ja, prima
        </button>
        <button
          type="button"
          className="btn btn-line btn-sm"
          onClick={() => {
            setConsent("nee");
            setAsk(false);
          }}
        >
          Liever niet
        </button>
      </div>
    </div>
  );
}
