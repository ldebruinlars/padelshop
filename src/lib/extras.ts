// Alles rondom het racket, aan te vinken bij een bestelling. Namen uit de Bullpadel-catalogus 2027 (p.132-145).
// Prijzen volgen zodra de inkoop rond is: zet `price` op een bedrag, dan verschijnt het op de site.
export type Extra = { id: string; name: string; why: string; price: number | null; priceText?: string; image?: string };

/** De drie upsells die als productkaart in de bestelstap staan. */
export const UPSELLS: Extra[] = [
  { id: "overgrip", name: "Overgrips (3 stuks)", why: "Meer grip en een iets dikkere greep. Absorberend, extra dun of extra plakkend.", price: null, image: "/media/shop/cat-accessoires.webp" },
  { id: "bumper", name: "Bumper", why: "Beschermt de rand van je racket tegen tikken tegen glas en vloer. Transparant of zwart.", price: null, image: "/media/shop/cat-accessoires.webp" },
  { id: "ballen", name: "Ballen (blik van 3)", why: "Nieuwe ballen voor je eerste potje met je nieuwe racket.", price: null, image: "/media/shop/cat-ballen.webp" },
];

export const EXTRAS: Extra[] = [
  { id: "grip-op-maat", name: "Grip op maat", why: "Overgrip of basisgrip op maat. Hesacore eraf en een normale grip erop kan ook. Gratis bij een racket dat je op de baan bestelt.", price: null, priceText: "€5 tot €10" },
  { id: "hesacore", name: "Hesacore Tour Grip", why: "Honingraatgrip die trilling dempt. Ook als Gel-versie voor beginners en mensen met armklachten.", price: null },
  { id: "gewicht", name: "CustomWeight-gewichtjes", why: "Gelplaatjes van 3 gram voor meer kracht in de kop, of een grip-dop van 5 gram voor meer controle.", price: null },
  { id: "dempers", name: "EasyVibe-dempers", why: "Dempertjes in de gaten tegen trillingen; de plek bepaalt of je kracht of controle wint.", price: null },
  { id: "polsband", name: "Polsbandjes (2 stuks)", why: "Houden zweet uit je hand, zodat de grip droog blijft.", price: null },
  { id: "cover", name: "Racketcover", why: "Beschermt je racket in je tas en tegen warmte en kou.", price: null },
];

/** Bij rackets vanaf dit bedrag hoort een gratis inspeel-les. Geen korting in euro's. */
export const LESSON_FROM = 250;
export const LESSON_PERK = "Gratis inspeel-les van 30 minuten bij een racket vanaf €250";
export const ON_COURT_PERK = "Bestel je direct op de baan? Dan krijg je een gratis grip-pakket: overgrip en bumper, ter plekke opgezet.";
