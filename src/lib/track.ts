// Meta Pixel en Conversions API. Er gebeurt niets zonder pixel-ID in de config én toestemming van de bezoeker:
// in Nederland mag een marketingpixel pas laden na een "ja" in de cookiemelding.
import { CONFIG } from "./config";

export type TrackEvent = "quiz_complete" | "waitlist" | "booking" | "purchase";

const KEY = "racketlab-consent";
type Consent = "ja" | "nee";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown; callMethod?: (...a: unknown[]) => void };
    _fbq?: unknown;
  }
}

export function consent(): Consent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "ja" || v === "nee" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: Consent) {
  try {
    localStorage.setItem(KEY, v);
  } catch {}
  if (v === "ja") loadPixel();
}

/** Het standaard pixelscript van Meta, pas na toestemming. */
export function loadPixel() {
  if (!CONFIG.metaPixelId || consent() !== "ja" || window.fbq) return;
  const q: unknown[] = [];
  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else q.push(args);
  }) as NonNullable<Window["fbq"]>;
  fbq.queue = q;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  window._fbq = fbq;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  fbq("init", CONFIG.metaPixelId);
  fbq("track", "PageView");
}

/**
 * Een event naar de pixel én naar de Conversions API, met hetzelfde event-id zodat Meta ze samenvoegt.
 * Telefoon en e-mail gaan alleen naar de server, die ze gehasht doorstuurt.
 */
export function track(name: TrackEvent, opts: { id?: string; value?: number; email?: string; phone?: string } = {}) {
  if (!CONFIG.metaPixelId || consent() !== "ja") return;
  const id = opts.id ?? `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  loadPixel();
  window.fbq?.("trackCustom", name, opts.value != null ? { value: opts.value, currency: "EUR" } : {}, { eventID: id });
  fetch("/.netlify/functions/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, id, url: window.location.href, value: opts.value, email: opts.email, phone: opts.phone }),
    keepalive: true,
  }).catch(() => null);
}
