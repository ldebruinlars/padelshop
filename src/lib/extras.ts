// Alles rondom het racket, aan te vinken bij een bestelling. Namen uit de Bullpadel-catalogus 2027 (p.132-145).
// Prijzen volgen zodra de inkoop rond is: zet `price` op een bedrag, dan verschijnt het op de site.
export type Extra = { id: string; name: string; why: string; price: number | null };

export const EXTRAS: Extra[] = [
  { id: "overgrip", name: "Overgrips (3 stuks)", why: "Meer grip en een iets dikkere greep. Bullpadel heeft absorberende, extra dunne (Senso) en extra plakkende (Fixogrip) varianten.", price: null },
  { id: "hesacore", name: "Hesacore Tour Grip", why: "Honingraatgrip die trilling dempt. Ook als Gel-versie voor beginners en mensen met armklachten.", price: null },
  { id: "protector", name: "Frame-protector", why: "Beschermt de rand tegen tikken tegen glas en vloer. Transparant of zwart.", price: null },
  { id: "gewicht", name: "CustomWeight-gewichtjes", why: "Gelplaatjes van 3 gram voor meer kracht in de kop, of een grip-dop van 5 gram voor meer controle.", price: null },
  { id: "dempers", name: "EasyVibe-dempers", why: "Dempertjes in de gaten tegen trillingen; de plek bepaalt of je kracht of controle wint.", price: null },
  { id: "polsband", name: "Polsbandjes (2 stuks)", why: "Houden zweet uit je hand, zodat de grip droog blijft.", price: null },
  { id: "cover", name: "Racketcover", why: "Beschermt je racket in je tas en tegen warmte en kou.", price: null },
];

// Extra bij aankoop: korting op een les. Het bedrag volgt; tot dan staat er alleen dat het er is.
export const LESSON_PERK = "Korting op een les met een coach bij aankoop van een racket";
