---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/rackets/page.tsx"]
---

Scope: homepage (/), Persuade. Shared atoms (nav, buttons, labels, section heads) reach /rackets/ and /merken/.

Audience and job: padel players around Almere picking a new racket; action is pick a racket off the wall (quick view) or book a racket test. Proof: 30 real models with sourced specs and prices, the test center at Poort Padel. No ACA mention, no invented reviews.

## Direction contract

THESIS: The homepage is the racket wall of a padel shop: rackets hang on pegs over a slatwall, each with a shelf label. Refuses the hero photo + headline + pill CTA and the eyebrow-over-heading section stack.

OWN-WORLD: A lit, light slatwall (#e7ddcc with grooves and white top light pools) carries the rackets; espresso (#14110f) is the nav, the strip under the wall and the section grounds. Dark ink price tickets with chalk names and gravel-orange prices sit on a dark price rail. Square-cut 4px corners, no pills, no arrow glyphs on links (chevrons only for previous/next). Archivo for display and labels, Inter Tight for body. Plain sentence-case headings, no italic accent words. (Changed from an espresso wall on 2026-10-19 because the user said the rackets were hard to see.)

STORY: The visitor sees the range at once, filters by shape, takes a racket off the wall to read its specs, then books a test or opens the full catalog.

FIRST VIEWPORT: Full-width nav bar (logo, Rackets, Merken, Testcenter, Racketfinder, sand "Boek een test"). Title row: "De racketwand" left at about 64px, one line of copy and shape tabs right. Below, the wall fills the rest: two rows of six rackets on pegs with shelf labels; on phones each row swipes sideways.

FORM: Racket wall (pro-shop slatwall), pick card, rank 1 of the grounded list, chosen by the user over the assigned hang-tag direction. seed:20426485f85c6d9b. Signature interaction: rackets drop onto their pegs and settle; hover swings a racket on its peg; click lifts it off into the quick view. Motion grammar: transform and opacity only, exponential ease-out.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
