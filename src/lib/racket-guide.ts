// Uitleg over vorm en opbouw van een padelracket, uit de regels van de FIP en racketgidsen (bron per onderdeel).
// Merkclaims over demping en spin zijn claims van het merk, niet onafhankelijk getest.
import type { Shape } from "./catalog";

export type ShapeGuide = {
  id: Shape;
  label: string;
  outline: string;
  sweetSpot: { label: string; cx: number; cy: number; rx: number; ry: number };
  balance: { label: string; mm: string; at: number }; // at = gemiddelde mm voor de markering
  power: string;
  control: string;
  handling: string;
  arm: string;
  suits: string;
};

// Balans in mm vanaf de onderkant van de grip. Bronnen verschillen tot zo'n 10 mm en merken labelen balans verschillend.
export const SHAPE_GUIDE: ShapeGuide[] = [
  {
    id: "rond",
    label: "Rond",
    outline: "Bijna cirkelronde kop met het breedste punt in het midden. Onderaan loopt hij rond naar de hals.",
    sweetSpot: { label: "Groot, in het midden", cx: 100, cy: 96, rx: 40, ry: 38 },
    balance: { label: "Laag (lichte kop)", mm: "± 250–260 mm", at: 255 },
    power: "Laag tot gemiddeld",
    control: "Het meest",
    handling: "Hoog: snel aan het net",
    arm: "Het laagst",
    suits: "Beginners, verdedigers en spelers achter in de baan",
  },
  {
    id: "druppel",
    label: "Druppel",
    outline: "Ronde, brede bovenkant met het breedste punt iets boven het midden. Het verschil zit onderin: daar loopt de kop geleidelijk smal toe naar de hals, als een druppel.",
    sweetSpot: { label: "Middelgroot, iets boven het midden", cx: 100, cy: 84, rx: 34, ry: 32 },
    balance: { label: "Midden (in balans)", mm: "± 265–270 mm", at: 268 },
    power: "In balans",
    control: "In balans",
    handling: "Gemiddeld",
    arm: "Gemiddeld",
    suits: "Gemiddelde spelers en allrounders",
  },
  {
    id: "diamant",
    label: "Diamant",
    outline: "Brede, bijna vlakke bovenkant met afgeronde schouders; het breedste punt zit hoog. Daaronder lopen de zijkanten bijna recht schuin naar een smalle hals. De top is dus niet puntig.",
    sweetSpot: { label: "Klein, hoog in de kop", cx: 100, cy: 66, rx: 30, ry: 26 },
    balance: { label: "Hoog (zware kop)", mm: "± 270–285 mm", at: 278 },
    power: "Het meest, vooral bij de smash",
    control: "Minder",
    handling: "Laag: trager aan het net",
    arm: "Het hoogst",
    suits: "Gevorderde, aanvallende spelers aan het net",
  },
];

export type Layer = { id: "surface" | "face" | "core" | "frame" | "heart"; name: string; text: string; options: string; source: string };

export const LAYERS: Layer[] = [
  {
    id: "surface",
    name: "Oppervlak",
    options: "Glad, zand of 3D-reliëf",
    text: "De afwerking bepaalt hoeveel grip je op de bal hebt. Zand geeft overal gelijke wrijving maar slijt sneller; 3D-reliëf grijpt de bal op vaste punten en gaat langer mee. Ruwheid geeft meer spin, nauwelijks meer kracht.",
    source: "https://www.padel.fyi/articles/roughness/",
  },
  {
    id: "face",
    name: "Slagvlak",
    options: "Glasvezel, carbon 3K–24K, hybride",
    text: "Het slagvlak zijn de vezellagen over de kern, aan beide kanten. Glasvezel buigt meer mee: zachter gevoel, minder trilling en de bal komt makkelijk weg bij rustige slagen. Carbon is stijver: preciezer, duurzamer en sneller bij harde slagen, maar je arm voelt meer trilling. Het K-getal is het aantal duizenden draden per bundel (12K = 12.000). Een groter getal geeft een bredere, vlakkere weving; de stijfheid hangt ook af van het aantal lagen, de richting en de hars. Hybride vlakken (glas met carbon) zitten ertussenin.",
    source: "https://www.tennis-warehouse.com/Learning_Center/padel/gear_guides/how-to-choose-a-padel-racket.html",
  },
  {
    id: "core",
    name: "Kern",
    options: "Foam, EVA zacht, medium of hard",
    text: "De kern is het rubber tussen de twee slagvlakken. Hij bepaalt hoe diep de bal wegzakt, hoe snel de energie terugkomt, hoe groot de sweet spot is en hoeveel schok je onderarm krijgt. Foam is het zachtst en het meest comfortabel; EVA veert sneller terug en gaat langer mee. Zacht rubber geeft makkelijke snelheid bij rustige ballen, hard EVA meer kracht en controle bij harde slagen, maar vergeeft minder. Een dubbele kern combineert een harde buitenlaag voor snelle ballen met een zachte binnenlaag voor rustige. Kou maakt elk rubber harder, en boven zo'n 50 °C verliest EVA zijn eigenschappen: laat je racket niet in een hete auto liggen.",
    source: "https://www.padelbrowser.com/blog/padel-racket-core-eva-vs-foam-explained",
  },
  {
    id: "frame",
    name: "Frame",
    options: "Buis van carbon of glasvezel, enkel of dubbel",
    text: "Een holle buis loopt rond de kop. Een dubbele buis of extra versteviging maakt het racket stabieler bij slagen buiten het midden en preciezer, maar kan harder aanvoelen voor je arm.",
    source: "https://www.tiendapadelpoint.com/en/guide-padel-racket-frames-structures-en",
  },
  {
    id: "heart",
    name: "Hart en grip",
    options: "Brug, gripmaat L1–L3, overgrip",
    text: "Het hart verbindt kop en grip en draagt de energie over. De grip is maximaal 20 cm lang; een overgrip weegt zo'n 5 gram en schuift de balans ongeveer 2 mm naar je hand.",
    source: "https://www.padelbrowser.com/blog/padel-racket-balance-explained",
  },
];

/** Regels van de FIP (Rules of Padel, vanaf 1 januari 2026). */
export const RULES = {
  source: "https://www.padelfip.com/wp-content/uploads/2025/12/FIP_Rules-of-Padel.pdf",
  items: [
    ["Lengte", "max. 45,5 cm"],
    ["Breedte", "max. 26 cm"],
    ["Dikte", "max. 38 mm"],
    ["Gaten", "9 tot 13 mm in het midden"],
    ["Polskoord", "verplicht, max. 35 cm"],
    ["Gewicht en balans", "vrij"],
  ] as [string, string][],
};

export const SHAPE_SOURCES = [
  { label: "vormen (Padelbrowser)", url: "https://www.padelbrowser.com/blog/padel-racket-shapes-explained" },
  { label: "sweet spot (Padelful)", url: "https://padelful.com/en/how-to-choose-a-padel-racket" },
  { label: "balans in mm (Padelbrowser)", url: "https://www.padelbrowser.com/blog/padel-racket-balance-explained" },
  { label: "balans per vorm (Tennis Warehouse)", url: "https://www.tennis-warehouse.com/Learning_Center/padel/gear_guides/how-to-choose-a-padel-racket.html" },
];
