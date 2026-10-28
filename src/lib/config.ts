// Alles wat Lars nog moet invullen op één plek. Leeg laten ("") = de knop of het blok blijft verborgen of toont "volgt".
// Geheime sleutels (Mollie, Meta, de meldingswebhook) staan NIET hier maar als omgevingsvariabelen in Netlify:
// MOLLIE_API_KEY, META_CAPI_TOKEN, NOTIFY_WEBHOOK_URL, SUPABASE_SERVICE_ROLE_KEY.
export const CONFIG = {
  // PLACEHOLDER: WhatsApp Business-nummer van Racket Lab, internationaal zonder + of spaties, bijv. "31612345678".
  // Wordt gebruikt voor de WhatsApp-knop en als ontvanger van de meldingen bij boekingen en de wachtlijst.
  whatsappNumber: "31621246509", // voorlopig het nummer van All Court Academy
  // PLACEHOLDER: link naar "Schrijf een review" op het Google Business-profiel (g.page/r/.../review).
  googleReviewUrl: "",
  // PLACEHOLDER: link naar het Google Business-profiel zelf (voor structured data en de reviewsectie).
  googleBusinessUrl: "",
  // PLACEHOLDER: Meta Pixel-ID (alleen cijfers). Leeg = geen pixel en geen cookiemelding.
  metaPixelId: "",
  // PLACEHOLDER: datum van de volgende Racket Test Avond als yyyy-mm-dd. Leeg = "datum per mail".
  nextTestEvening: "2026-11-28", // voorbeelddatum, pas aan zodra de echte vaststaat
  // Is er een fysieke winkel bij Poort Padel? false = accessoires zijn online te bestellen en liggen op de baan.
  hasShop: false,
  // Leerlingenregel tonen. Let op: eerder was de afspraak om All Court Academy niet op de site te noemen.
  academy: { show: true, name: "All Court Academy" },
};

// De coaches van het testcenter. PLACEHOLDER: één zin per coach, invullen door Lars.
export const COACH_PROFILES = [
  { id: "lars", name: "Lars", bio: "" },
  { id: "robin", name: "Robin", bio: "" },
];

export const whatsappUrl = (text?: string) =>
  CONFIG.whatsappNumber ? `https://wa.me/${CONFIG.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}` : "";
