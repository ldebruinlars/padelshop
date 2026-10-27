// Racket Lab eigen lijn: vier eigen ontwerpen (concept, in ontwikkeling). Beelden en 3D-modellen gemaakt met
// Higgsfield (ontwerp: GPT Image, 3D: Meshy). De specificaties zijn ontwerpdoelen, nog geen geproduceerd racket.
import type { Brand, CatalogRacket } from "./catalog";

export const OWN_BRAND: Brand = {
  slug: "racket-lab",
  name: "Racket Lab",
  about: "Onze eigen lijn, ontworpen in Almere: vier rackets, één per speelstijl. Nog in ontwikkeling; meld je aan en test ze als eerste.",
};

export type OwnRacket = CatalogRacket & {
  tagline: string;
  images: { front: string; angle: string; back: string; cutout: string };
  model3d: string | null; // pad naar het .glb-bestand, of null zolang het model er nog niet is
};

const img = (id: string) => ({
  front: `/media/eigen-lijn/${id}.webp`,
  angle: `/media/eigen-lijn/${id}-schuin.webp`,
  back: `/media/eigen-lijn/${id}-achter.webp`,
  cutout: `/media/eigen-lijn/${id}-vrij.webp`,
});

const base = { brand: OWN_BRAND.slug, price: null, priceNote: "Concept, prijs volgt", sources: [] as string[] };

export const OWN_RACKETS: OwnRacket[] = [
  {
    ...base,
    id: "racket-lab-lab-r-control",
    model: "LAB R Control",
    tagline: "Rond en vergevingsgezind, voor plaatsen en lange rally's",
    shape: "rond",
    weight: "350-365 g",
    balance: "laag",
    core: "EVA soft",
    face: "Fibreglass met zandruw oppervlak",
    frame: "Carbon buis",
    feel: "zacht",
    level: "Gemiddeld",
    playstyle: "control",
    description: "Ronde kop met de sweet spot laag en centraal. Zachte kern en glasvezel geven comfort en makkelijke snelheid, de lage balans houdt hem snel aan het net.",
    images: img("lab-r"),
    model3d: "/models/lab-r.glb",
  },
  {
    ...base,
    id: "racket-lab-lab-d-allround",
    model: "LAB D Allround",
    tagline: "Druppel in balans tussen kracht en controle",
    shape: "druppel",
    weight: "360-370 g",
    balance: "midden",
    core: "EVA medium",
    face: "Carbon 12K met 3D-reliëf",
    frame: "Carbon buis",
    feel: "medium",
    level: "Gemiddeld",
    playstyle: "allround",
    description: "Druppelvorm met middenbalans: genoeg kop voor een bandeja, genoeg controle voor de verdediging. 12K-carbon met reliëf voor effect.",
    images: img("lab-d"),
    model3d: "/models/lab-d.glb",
  },
  {
    ...base,
    id: "racket-lab-lab-x-power",
    model: "LAB X Power",
    tagline: "Diamant voor afmaken aan het net",
    shape: "diamant",
    weight: "365-375 g",
    balance: "hoog",
    core: "EVA hard",
    face: "Carbon 3K met ruw spinoppervlak",
    frame: "Dubbele carbon buis",
    feel: "hard",
    level: "Gevorderd",
    playstyle: "power",
    description: "Diamantvorm met het gewicht hoog in de kop. Hard rubber en 3K-carbon voor een directe, harde smash; voor spelers met techniek.",
    images: img("lab-x"),
    model3d: "/models/lab-x.glb",
  },
  {
    ...base,
    id: "racket-lab-lab-s-comfort",
    model: "LAB S Comfort",
    tagline: "Licht en zacht, voor je eerste racket of een gevoelige arm",
    shape: "rond",
    weight: "340-355 g",
    balance: "laag",
    core: "EVA super soft",
    face: "Fibreglass",
    frame: "Glasvezel met carbon versteviging",
    feel: "zacht",
    level: "Beginner",
    playstyle: "control",
    description: "Licht rond racket met een supersoft kern: de bal komt er makkelijk uit en je arm krijgt weinig te verduren. Gemaakt voor beginners en spelers met elleboogklachten.",
    images: img("lab-s"),
    model3d: "/models/lab-s.glb",
  },
];
