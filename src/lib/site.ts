// Werktitel: vervang door de echte bedrijfsnaam.
export const SITE = {
  name: "Racket Lab",
  location: "Poort Padel, Neonweg 62, Almere",
  routeUrl: "https://www.google.com/maps/search/?api=1&query=Poort+Padel+Neonweg+62+Almere",
  url: "https://racket-lab.netlify.app", // vervang door het eigen domein zodra dat er is
};

// PLACEHOLDER: winkelvoorwaarden. Vervang door de echte waarden; ze worden overal op de site gebruikt
// (aankondigingsbalk, USP-strook, FAQ, footer).
export const SHOP = {
  freeShippingFrom: 100, // euro
  returnDays: 30,
  payLater: "Klarna", // laat leeg ("") als je geen achteraf betalen aanbiedt
  warranty: "2 jaar fabrieksgarantie",
  testPrice: 29.95,
  homeTestDays: 14,
};

// Alle beelden op één plek. De shopfoto's zijn Higgsfield-placeholders tot de echte productfoto's er zijn.
export const MEDIA = {
  hero: "/media/hero-hal.webp",
  heroVideo: "" as string, // bijv. "/media/hero-hal.mp4" zodra er een video is
  coach: "/media/coach-testcenter.webp",
};

export type Style = "power" | "control" | "allround" | "licht";
export type Tag = "bestseller" | "nieuw" | "outlet";

export type Racket = {
  id: string;
  name: string;
  style: Style;
  shape: "diamant" | "rond" | "druppel";
  weight: string;
  balance: "hoog" | "midden" | "laag";
  core: string;
  face: string;
  level: "Beginner" | "Gemiddeld" | "Gevorderd";
  price: number;
  oldPrice?: number; // doorgestreepte prijs (outlet)
  tags: Tag[];
  power: number; // 0-10, score van de coaches
  control: number;
  image: string;
  testable: boolean;
};

export const STYLES: { id: Style; label: string; tagline: string; color: string }[] = [
  { id: "power", label: "Power", tagline: "Voor de smash die het glas raakt", color: "#ff4a4a" },
  { id: "control", label: "Control", tagline: "Voor wie de bal wil plaatsen", color: "#d9a48f" },
  { id: "allround", label: "Allround", tagline: "Van alles een beetje, goed in balans", color: "#e3bf78" },
  { id: "licht", label: "Licht", tagline: "Voor beginners en een zachte arm", color: "#f2e6d6" },
];

const img = (id: string) => `/media/shop/racket-${id}.webp`;

// PLACEHOLDER: voorbeeldrackets. Vervang door het echte assortiment, prijzen en foto's.
export const RACKETS: Racket[] = [
  { id: "volt-x", name: "Volt X", style: "power", shape: "diamant", weight: "365 g", balance: "hoog", core: "EVA hard", face: "Carbon 18K", level: "Gevorderd", price: 289, tags: ["bestseller"], power: 9.5, control: 6.5, image: img("volt-x"), testable: true },
  { id: "blaze-d", name: "Blaze D", style: "power", shape: "diamant", weight: "370 g", balance: "hoog", core: "EVA hard", face: "Carbon 24K", level: "Gevorderd", price: 319, tags: ["nieuw"], power: 9.8, control: 6, image: img("blaze-d"), testable: true },
  { id: "aim-r", name: "Aim R", style: "control", shape: "rond", weight: "355 g", balance: "laag", core: "EVA soft", face: "Carbon 3K", level: "Gemiddeld", price: 219, tags: ["bestseller"], power: 6, control: 9.5, image: img("aim-r"), testable: true },
  { id: "edge-c", name: "Edge C", style: "control", shape: "druppel", weight: "360 g", balance: "midden", core: "EVA medium", face: "Carbon 12K", level: "Gevorderd", price: 179, oldPrice: 239, tags: ["outlet"], power: 7, control: 9, image: img("edge-c"), testable: false },
  { id: "flow-t", name: "Flow T", style: "allround", shape: "druppel", weight: "360 g", balance: "midden", core: "EVA medium", face: "Carbon 12K", level: "Gemiddeld", price: 249, tags: ["bestseller", "nieuw"], power: 8, control: 8, image: img("flow-t"), testable: true },
  { id: "mix-a", name: "Mix A", style: "allround", shape: "druppel", weight: "355 g", balance: "midden", core: "EVA soft", face: "Glasvezel en carbon", level: "Gemiddeld", price: 159, oldPrice: 199, tags: ["outlet"], power: 7.5, control: 8, image: img("mix-a"), testable: true },
  { id: "air-s", name: "Air S", style: "licht", shape: "rond", weight: "340 g", balance: "laag", core: "Foam", face: "Glasvezel", level: "Beginner", price: 129, tags: ["bestseller"], power: 5.5, control: 8.5, image: img("air-s"), testable: true },
  { id: "lite-k", name: "Lite K", style: "licht", shape: "rond", weight: "330 g", balance: "laag", core: "Foam", face: "Glasvezel", level: "Beginner", price: 99, tags: ["nieuw"], power: 5, control: 8, image: img("lite-k"), testable: false },
];

// online: false = nog geen eigen shoppagina; de tegel verwijst dan naar de winkel (#bezoek).
export const CATEGORIES = [
  { id: "rackets", label: "Rackets", text: "Voor elk niveau en elke speelstijl", image: img("flow-t"), online: true },
  { id: "schoenen", label: "Schoenen", text: "Grip op kunstgras en gravel", image: "/media/shop/cat-schoenen.webp", online: false },
  { id: "tassen", label: "Tassen", text: "Racketbags en rugzakken", image: "/media/shop/cat-tassen.webp", online: false },
  { id: "ballen", label: "Ballen", text: "Losse blikken en voordeelpakken", image: "/media/shop/cat-ballen.webp", online: false },
  { id: "accessoires", label: "Grips en accessoires", text: "Overgrips, protectors, polsbanden", image: "/media/shop/cat-accessoires.webp", online: false },
  { id: "kleding", label: "Kleding", text: "Shirts, shorts en caps", image: "/media/shop/cat-kleding.webp", online: false },
];

export const BRANDS = ["Bullpadel", "Nox", "Adidas", "Head", "Babolat", "Siux", "StarVie", "Wilson"];

// Echte reviews (bijv. uit Google). De sectie verschijnt pas als hier minstens één review staat;
// verzin geen reviews.
export const REVIEWS: { name: string; text: string; stars: 1 | 2 | 3 | 4 | 5; source: string }[] = [];
export const RATING: { score: number; count: number; source: string } | null = null;

export const euro = (n: number) => `€ ${n.toFixed(n % 1 ? 2 : 0).replace(".", ",")}`;
