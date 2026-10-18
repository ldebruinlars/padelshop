# Racket Lab

Padel webshop met een racket-testcenter bij Poort Padel in Almere, samen met All Court Academy.

Gebouwd met Next.js, Tailwind, GSAP (ScrollTrigger, MotionPath) en Lenis, in de eigen Gravel Night-stijl: espresso `#14110F`, krijt `#F6EFE6`, gravel-oranje `#F06A30` en zand `#E8D3A8`, met Inter Tight en Fraunces, donker en filmisch. De kleuren staan als betekenis-tokens in `src/app/globals.css` (`bg`, `panel`, `panel-2`, `ink`, `fg`, `muted`, `accent`, `accent-2`, `on-accent`); de speelstijlkleuren in `src/lib/site.ts`.

## Starten

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Waar staat wat

| Bestand | Inhoud |
|---|---|
| `src/lib/site.ts` | Naam, adres, winkelvoorwaarden (`SHOP`), beelden, speelstijlen, rackets, categorieën, merken en reviews |
| `src/components/nav.tsx` | Aankondigingsbalk, header, megamenu per speelstijl, mobiel menu |
| `src/components/hero-letters.tsx` | Header: foto of video in de letters, groeit tijdens scrollen |
| `src/components/usp-strip.tsx` | Vier beloftes onder de hero, iconen tekenen zich bij binnenkomst |
| `src/components/collection.tsx` | Rackets: filters op niveau en speelstijl, veegbare productkaarten, vergelijker |
| `src/components/categories.tsx` | Shop per categorie |
| `src/components/ball-path.tsx` | Zo werkt het: padelbaan op schaal met een rally langs Kies, Test en Koop |
| `src/components/testcenter.tsx` | Testsessie boeken en thuistest (nog niet gekoppeld aan een agenda) |
| `src/components/finder.tsx` | Racketfinder-quiz (vier vragen, met budget) |
| `src/components/exploded.tsx` | Racket in lagen met klikbare uitleg |
| `src/components/reviews.tsx` | Reviews; verschijnt pas als `REVIEWS` in `site.ts` gevuld is |
| `src/components/advice.tsx` | Advies van de coaches en veelgestelde vragen |
| `src/components/visit.tsx` | Bezoek de winkel en nieuwsbrief (Netlify Forms) |

## Placeholders die nog vervangen moeten worden

Alles staat in `src/lib/site.ts`, gemarkeerd met `PLACEHOLDER`:

- **Winkelvoorwaarden (`SHOP`)**: gratis bezorging vanaf, bedenktijd, achteraf betalen, garantie. Deze waarden staan in de aankondigingsbalk, de USP-strook, de FAQ en de footer.
- **Rackets (`RACKETS`)**: namen, specs, prijzen en coachscores zijn voorbeelden.
- **Productfoto's** in `public/media/shop`: met Higgsfield gemaakte placeholders op een zandkleurige achtergrond. Vervang ze door eigen foto's in dezelfde stijl: racket rechtop, vooraanzicht, effen lichte achtergrond, verhouding 4:5. Categoriefoto's: 4:3.
- **Reviews (`REVIEWS`, `RATING`)**: leeg tot er echte reviews zijn.

## Beelden

De beelden zijn met Higgsfield gemaakt en staan in `public/media`. `scripts/fetch-media.sh` haalt de originelen opnieuw op en maakt de webp-bestanden en `public/og.jpg`.

## Nog te doen

- Echte rackets, prijzen en voorraad (bijvoorbeeld via Shopify)
- Boekingen koppelen aan een agenda
- Productpagina's, winkelwagen en afrekenen
