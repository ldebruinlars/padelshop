// Assortiment: echte merken en modellen met specificaties van de merk- en winkelsites (bronnen per racket).
// Prijzen zijn adviesprijzen of gangbare winkelprijzen op het moment van onderzoek; controleer ze voor verkoop.
import { CATALOG } from "./catalog-data";
import { OWN_BRAND } from "./own-line";

export type Shape = "rond" | "druppel" | "diamant";
export type Feel = "zacht" | "medium" | "hard";
export type Playstyle = "power" | "control" | "allround";
export type Level = "Beginner" | "Gemiddeld" | "Gevorderd";

export type Brand = { slug: string; name: string; about: string; source?: string };

export type CatalogRacket = {
  id: string;
  brand: string; // slug
  model: string;
  shape: Shape | null;
  weight: string | null;
  balance: "laag" | "midden" | "hoog" | null;
  core: string | null;
  face: string | null;
  frame: string | null;
  feel: Feel | null;
  level: Level | null;
  playstyle: Playstyle | null;
  price: number | null;
  priceNote: string | null; // bijv. "adviesprijs" of "gangbare winkelprijs"
  description: string | null;
  sources: string[];
};

export const BRAND_LIST: Brand[] = CATALOG.brands;
export const CATALOG_RACKETS: CatalogRacket[] = CATALOG.rackets;

export const SHAPES: { id: Shape; label: string; text: string }[] = [
  { id: "rond", label: "Rond", text: "Grote sweet spot laag in de kop: controle en vergevingsgezind" },
  { id: "druppel", label: "Druppel", text: "Het midden tussen controle en kracht, voor de meeste spelers" },
  { id: "diamant", label: "Diamant", text: "Gewicht hoog in de kop: maximale kracht bij de smash" },
];
export const FEELS: { id: Feel; label: string }[] = [
  { id: "zacht", label: "Zacht" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];
export const PLAYSTYLES: { id: Playstyle; label: string; color: string }[] = [
  { id: "power", label: "Power", color: "#ff4a4a" },
  { id: "control", label: "Control", color: "#d9a48f" },
  { id: "allround", label: "Allround", color: "#e3bf78" },
];
export const LEVELS: Level[] = ["Beginner", "Gemiddeld", "Gevorderd"];

export const brandName = (slug: string) => (slug === OWN_BRAND.slug ? OWN_BRAND.name : BRAND_LIST.find((b) => b.slug === slug)?.name ?? slug);
export const styleColor = (p: Playstyle | null) => PLAYSTYLES.find((s) => s.id === p)?.color ?? "#e8d3a8";

/**
 * Kracht/controle-profiel (0-10), berekend uit vorm, balans en hardheid.
 * Geen meting of coachscore: een vergelijkingshulp op basis van de specificaties.
 */
export function profile(r: CatalogRacket) {
  const shape = { diamant: 3, druppel: 1.5, rond: 0 }[r.shape ?? "druppel"];
  const bal = { hoog: 2, midden: 1, laag: 0 }[r.balance ?? "midden"];
  const feel = { hard: 2, medium: 1, zacht: 0 }[r.feel ?? "medium"];
  const power = Math.min(10, 3 + shape + bal + feel);
  const control = Math.min(10, 3 + (3 - shape) + (2 - bal) + (2 - feel) * 0.75);
  return { power: Math.round(power * 2) / 2, control: Math.round(control * 2) / 2 };
}

/** Specs als getallen tussen 0 en 1, voor de schattingen en de racketfinder. */
export function encode(r: CatalogRacket) {
  const s = { rond: 0, druppel: 0.5, diamant: 1 }[r.shape ?? "druppel"];
  const b = { laag: 0, midden: 0.5, hoog: 1 }[r.balance ?? "midden"];
  let h = { zacht: 0, medium: 0.5, hard: 1 }[r.feel ?? "medium"];
  const core = (r.core ?? "").toLowerCase();
  if (/medium\/soft|medium-soft|middelzacht/.test(core)) h = 0.25;
  if (/super soft/.test(core)) h = 0;
  const face = (r.face ?? "").toLowerCase();
  const k = Number(face.match(/(\d+)k/)?.[1] ?? 0);
  const glass = /fibre|fiber|glas/.test(face);
  const carbon = /carbon/.test(face);
  const f = glass && carbon ? 0.35 : glass ? 0 : !carbon ? 0.5 : k >= 18 ? 0.8 : k >= 12 ? 0.7 : 0.6;
  const grams = (r.weight ?? "").match(/\d+/g)?.map(Number) ?? [];
  const mid = grams.length ? grams.reduce((a, n) => a + n, 0) / grams.length : 365;
  const w = Math.min(1, Math.max(0, (mid - 350) / 30));
  return { s, b, h, f, w, grams: mid };
}

const clamp10 = (n: number) => Math.round(Math.min(10, Math.max(1, n)) * 2) / 2;

/**
 * Zes eigenschappen (1-10) zoals veel padelshops ze tonen. Racket Lab-schatting op basis van de specificaties,
 * met de vuistregels uit racketgidsen (o.a. padelful.com/en/how-we-score, Tennis Warehouse, LTA). Geen labtest.
 */
export function ratings(r: CatalogRacket) {
  const { s, b, h, f, w } = encode(r);
  const p = profile(r);
  return [
    { id: "power", label: "Kracht", value: p.power, color: "#ff4a4a", hint: "Snelheid bij harde slagen en de smash" },
    { id: "control", label: "Controle", value: p.control, color: "#d9a48f", hint: "Hoe precies je de bal plaatst" },
    { id: "handling", label: "Wendbaarheid", value: clamp10(10 - 2.5 * w - 2 * b - 1 * s), color: "#e3bf78", hint: "Hoe snel het racket voelt aan het net" },
    { id: "sweetspot", label: "Sweet spot", value: clamp10(9 - 1.5 * s - 1 * h - 0.5 * b - 0.5 * f), color: "#e3bf78", hint: "Hoe vergevingsgezind bij slagen buiten het midden" },
    { id: "exit", label: "Balafgifte", value: clamp10(5 + 2.5 * (1 - h) + 1.5 * (1 - f) + 0.5 * (1 - s) + 0.5 * b), color: "#f2e6d6", hint: "Hoe makkelijk de bal wegkomt bij rustige slagen" },
    { id: "comfort", label: "Comfort", value: clamp10(5 + 2.5 * (1 - h) + 1.5 * (1 - f) + 1 * (1 - b) + 0.5 * (1 - s) - 1 * w), color: "#f2e6d6", hint: "Hoe vriendelijk voor je arm en elleboog" },
  ];
}
