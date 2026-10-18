// Werktitel: vervang door de echte bedrijfsnaam.
export const SITE = {
  name: "Racket Lab",
  location: "Poort Padel, Neonweg 62, Almere",
  url: "https://racket-lab.netlify.app", // vervang door het eigen domein zodra dat er is
};

// Alle beelden op één plek. Higgsfield-beelden komen in public/media.
export const MEDIA = {
  hero: "/media/hero-racket.webp",
  heroVideo: "/media/hero-loop.mp4",
  carbonMacro: "/media/carbon-macro.webp",
  exploded: "/media/exploded.webp",
  smash: "/media/player-smash.webp",
  coach: "/media/coach-testcenter.webp",
  wall: "/media/racket-wall.webp",
  // Draaiend racket: frames uit de turntable-video (public/media/turntable/f001.webp ...)
  turntable: { count: 72, path: (i: number) => `/media/turntable/f${String(i + 1).padStart(3, "0")}.webp` },
};

export type Style = "power" | "control" | "allround" | "licht";

export type Racket = {
  id: string;
  name: string;
  style: Style;
  shape: "diamant" | "rond" | "druppel";
  weight: string;
  balance: "hoog" | "midden" | "laag";
  core: string;
  face: string;
  level: string;
  price: number;
  power: number; // 0-10, score van de coaches
  control: number;
  image: string;
  testable: boolean;
};

export const STYLES: { id: Style; label: string; tagline: string; color: string }[] = [
  { id: "power", label: "Power", tagline: "Voor de smash die het glas raakt", color: "#ccff00" },
  { id: "control", label: "Control", tagline: "Voor wie de bal wil plaatsen", color: "#9fb6d6" },
  { id: "allround", label: "Allround", tagline: "Van alles een beetje, goed in balans", color: "#efd98a" },
  { id: "licht", label: "Licht", tagline: "Voor beginners en een zachte arm", color: "#edf4d1" },
];

// Voorbeeldrackets: vervang door het echte assortiment.
export const RACKETS: Racket[] = [
  { id: "volt-x", name: "Volt X", style: "power", shape: "diamant", weight: "365 g", balance: "hoog", core: "EVA hard", face: "Carbon 18K", level: "Gevorderd", price: 289, power: 9.5, control: 6.5, image: "/media/racket-power.webp", testable: true },
  { id: "aim-r", name: "Aim R", style: "control", shape: "rond", weight: "355 g", balance: "laag", core: "EVA soft", face: "Carbon 3K", level: "Gemiddeld", price: 219, power: 6, control: 9.5, image: "/media/racket-control.webp", testable: true },
  { id: "flow-t", name: "Flow T", style: "allround", shape: "druppel", weight: "360 g", balance: "midden", core: "EVA medium", face: "Carbon 12K", level: "Gemiddeld", price: 249, power: 8, control: 8, image: "/media/racket-allround.webp", testable: true },
  { id: "air-s", name: "Air S", style: "licht", shape: "rond", weight: "340 g", balance: "laag", core: "Foam", face: "Glasvezel", level: "Beginner", price: 129, power: 5.5, control: 8.5, image: "/media/racket-light.webp", testable: true },
];

export const BRANDS = ["Bullpadel", "Nox", "Adidas", "Head", "Babolat", "Siux", "StarVie", "Wilson"];
