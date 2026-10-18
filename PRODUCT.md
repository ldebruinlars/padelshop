# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Padel players around Almere, from beginners to competition players, who want a new racket but are unsure which one fits. Their job: narrow 30+ models down to a few, feel them on court at Poort Padel, then buy. Online visitors from elsewhere in the Netherlands are a second audience.

## Product Purpose
Racket Lab is a padel racket shop with its own test center at Poort Padel in Almere. Visitors browse the range by brand, shape, feel, playstyle and level, book a 45-minute racket test (3 to 5 rackets), and buy the one that feels right. Success: a visitor finds two or three candidate rackets and books a test or buys.

## Positioning
Test before you buy: rackets from ten top brands that you can play on a real court in Almere before paying, with the test fee refunded on purchase.

## Operating Context
Players compare rackets by shape (round, teardrop, diamond), balance, core hardness, weight and price. They book court time and tests around their club schedule and usually decide after holding and hitting with the racket.

## Capabilities and Constraints
- Next.js static export on Netlify; Netlify Forms for the test booking and newsletter.
- Catalog: 10 brands (Bullpadel, Nox, Adidas, Head, Babolat, Siux, StarVie, Wilson, Black Crown, Drop Shot), 30 models, specs and prices from brand and shop sites with a source per racket.
- Online checkout is planned soon; design product and listing pages so a cart and "add to cart" fit later. Until then, no online ordering is claimed.
- Shop facts (free shipping threshold, return days, pay-later, home test, warranty, test price) are placeholders until the owner confirms them. The owner chose to keep them visible on the site in the meantime (decided 2026-10-18); replace them in `src/lib/site.ts` (SHOP) when the real values arrive.

## Brand Commitments
- Name: Racket Lab, with the existing "A" logo mark.
- Do not mention All Court Academy anywhere on the site.
- Colours: the approved Gravel Night palette (espresso grounds, chalk text, gravel orange accent, sand), no blue.
- The look must be its own: not a copy of allcourtacademy.com (no stripe eyebrows, italic accent words in every heading or pill buttons with arrows).

## Evidence on Hand
- Court photo at Poort Padel: `public/media/hero-poort-padel*.webp`; coach photo `public/media/coach-testcenter-1200.webp`.
- No real product photos yet (owner will shoot them in the shop); racket illustrations in `public/media/art/` stand in, labelled "productfoto volgt".
- No reviews, customers or ratings yet: never invent them. Power/control profiles are calculated from specs, not tested.

## Product Principles
1. Help people choose: every page should move a player closer to two or three rackets to try.
2. Feel before you buy: the test center is the reason to shop here.
3. Honest specs: show sources, label estimates and placeholder facts.
4. Fast on a phone at the club.
