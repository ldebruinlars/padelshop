// Assortiment: echte merken en modellen met specificaties van de merk- en winkelsites (bronnen per racket).
// Prijzen zijn adviesprijzen of gangbare winkelprijzen op het moment van onderzoek; controleer ze voor verkoop.
import { CATALOG } from "./catalog-data";

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

export const brandName = (slug: string) => BRAND_LIST.find((b) => b.slug === slug)?.name ?? slug;
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
