// De testrange: de rackets die echt op de baan bij Poort Padel liggen (2026-modellen; Gravity Pro is de 2024-versie, Elite W 02 de 2027-versie), plus één vrij vak voor een wisselend model.
// Alleen deze rackets beveelt de racketfinder aan als testadvies; de rest van het assortiment blijft gewoon bestelbaar.
import { CATALOG_RACKETS, type CatalogRacket } from "./catalog";

export const TEST_RANGE_IDS = [
  "bullpadel-vertex-05-2026",
  "bullpadel-hack-04-2026",
  "bullpadel-neuron-02-2026",
  "nox-at10-genius-18k-alum-2026",
  "babolat-technical-viper-3-0-2026",
  "head-gravity-pro-2024",
  "nox-at10-pro-cup-soft-2026",
  "babolat-counter-veron-2026",
  "bullpadel-vertex-05-comfort-2026",
  "head-coello-motion-2026",
  "bullpadel-vertex-05-w-2026",
  "bullpadel-elite-w-02-2027",
  "nox-equation-hard-advanced-2026",
  "babolat-air-vertuo-2026",
  "bullpadel-indiga-ctr-26",
];

/** Het zestiende vak: een model dat wisselt. Vul een id in (uit catalog-data) zodra er een ligt, anders blijft het leeg. */
export const ROTATING_SLOT_ID = "";

export const TEST_RANGE: CatalogRacket[] = [...TEST_RANGE_IDS, ROTATING_SLOT_ID]
  .map((id) => CATALOG_RACKETS.find((r) => r.id === id))
  .filter((r): r is CatalogRacket => Boolean(r));

export const isTestRacket = (id: string) => id !== "" && (TEST_RANGE_IDS.includes(id) || id === ROTATING_SLOT_ID);

export const DELIVERY = "Meteen mee na je test, of binnen een week geleverd.";
