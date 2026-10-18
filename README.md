# Racket Lab

Padel webshop met een racket-testcenter bij Poort Padel in Almere, samen met All Court Academy.

Gebouwd met Next.js, Tailwind, GSAP (ScrollTrigger, MotionPath) en Lenis, in de Night Court-stijl: de huisstijl van All Court Academy (navy `#0B1420`, lime `#CCFF00`, Inter Tight en Fraunces), donker en filmisch.

## Starten

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Waar staat wat

| Bestand | Inhoud |
|---|---|
| `src/lib/site.ts` | Naam, adres, beelden, speelstijlen, rackets (voorbeelddata) en merken |
| `src/components/hero-letters.tsx` | Header: video in de letters, groeit tijdens scrollen |
| `src/components/racket-360.tsx` | Racket draait 360° mee met scrollen (72 frames) |
| `src/components/collection.tsx` | Horizontale collectie per speelstijl, power/control-balken, vergelijker |
| `src/components/exploded.tsx` | Racket in lagen met klikbare uitleg |
| `src/components/ball-path.tsx` | Balbaan langs Kies, Test en Koop |
| `src/components/testcenter.tsx` | Testsessie boeken en thuistest (nog niet gekoppeld aan een agenda) |
| `src/components/finder.tsx` | Racketfinder-quiz |

## Beelden

De beelden en video's zijn met Higgsfield gemaakt en staan in `public/media`. `scripts/fetch-media.sh` haalt de originelen opnieuw op en maakt de webp-bestanden, de hero-video en de turntable-frames.

## Nog te doen

- Echte rackets, prijzen en voorraad (bijvoorbeeld via Shopify)
- Boekingen koppelen aan een agenda
- Productpagina's, winkelwagen en afrekenen
