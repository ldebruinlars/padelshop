// Merkrackets en de eigen lijn samen, plus de productfoto van een racket als die er is (alleen de eigen lijn).
import { CATALOG_RACKETS, type CatalogRacket } from "./catalog";
import { OWN_RACKETS } from "./own-line";

export const ALL_RACKETS: CatalogRacket[] = [...CATALOG_RACKETS, ...OWN_RACKETS];

const own = new Map(OWN_RACKETS.map((r) => [r.id, r]));
export const ownRacket = (id: string) => own.get(id);

/** Vrijstaande foto voor de wand (klein) of de snelle weergave (groot); undefined voor merkrackets zonder foto. */
export const photoOf = (r: CatalogRacket, size: "wand" | "groot" = "wand") => {
  const o = own.get(r.id);
  if (!o) return undefined;
  return size === "wand" ? o.images.cutout.replace("-vrij.webp", "-wand.webp") : o.images.cutout;
};
