---
name: Racket Lab
description: Padel racket shop with its own test center at Poort Padel, Almere. The site is the racket wall of the shop.
colors:
  bg: "#14110f"
  panel: "#201a16"
  panel-2: "#2c241f"
  ink: "#0c0a09"
  fg: "#f6efe6"
  muted: "#b3a595"
  accent: "#f06a30"
  accent-hover: "#ff7b45"
  accent-2: "#e8d3a8"
  paper: "#ede4d3"
  on-accent: "#14110f"
  rail: "#2a221d"
  rail-lip: "#8d8072"
  wall: "#e7ddcc"
  wall-groove-face: "#ede5d6"
  wall-groove: "#e3d8c5"
  wall-groove-shadow: "#b9ab95"
  wall-groove-light: "#f6f0e6"
  wall-text: "#4a3f37"
  peg-light: "#9c9186"
  peg-dark: "#6f655c"
  playstyle-power: "#ff4a4a"
  playstyle-control: "#d9a48f"
  playstyle-allround: "#e3bf78"
  playstyle-light: "#f2e6d6"
typography:
  display:
    fontFamily: "Archivo, Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(40px, 5.4vw, 76px)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 90"
  headline:
    fontFamily: "Archivo, Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(30px, 3.2vw, 44px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 90"
  title:
    fontFamily: "Archivo, Inter Tight, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 90"
  price:
    fontFamily: "Archivo, Inter Tight, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "'tnum'"
  body:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, Inter Tight, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.04em"
  button:
    fontFamily: "Archivo, Inter Tight, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
rounded:
  hook: "2px"
  shelf-label: "3px"
  control: "4px"
  card: "6px"
  panel: "8px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "32px"
  section: "96px"
  container: "1400px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-sand:
    backgroundColor: "{colors.accent-2}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-sand-hover:
    backgroundColor: "{colors.paper}"
  button-line:
    textColor: "{colors.fg}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-sm:
    padding: "0 14px"
    height: "36px"
  chip:
    textColor: "{colors.fg}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "36px"
  chip-selected:
    backgroundColor: "{colors.fg}"
    textColor: "{colors.on-accent}"
  field:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.fg}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "46px"
  chip-wall:
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "36px"
  chip-wall-selected:
    backgroundColor: "{colors.on-accent}"
    textColor: "{colors.fg}"
  shelf-label:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    rounded: "{rounded.shelf-label}"
    padding: "10px 12px"
  wall-scroll-button:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    rounded: "{rounded.control}"
    size: "44px"
  racket-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.fg}"
    rounded: "{rounded.card}"
    padding: "16px"
  nav-bar:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    height: "64px"
---

# Design System: Racket Lab

## Overview

**Creative North Star: "The Racket Wall"**

The site is the back wall of a padel pro shop: a light, lit slatwall with three pools of white light at the top, dark rackets hanging on metal pegs, and a dark ink price ticket under each one on a dark price rail. Everything is read the way you read a shop: brand, model, shape, price, then a decision to take it off the wall or book it on court. Density is retail-high, not editorial: many products in view at once, few words per item.

The material vocabulary is physical and warm. The wall is a warm sand-white so the rackets stand out sharply against it; around it, the nav, the strip under the wall and the section grounds are espresso brown-black, never neutral grey and never blue; text on dark is chalk; the one loud colour is gravel orange, the colour of a clay court and of the ball. Corners are square-cut like printed shop labels. Type is Archivo slightly condensed for anything that names or prices a thing, Inter Tight for the sentences around it. Headings are plain sentence-case statements with no decoration around them.

Motion is the wall behaving like a wall: rackets drop onto their pegs and settle, swing from the hook when touched, zoom off the hook into the quick view and fly back when it closes. Rows slide sideways under a drag or a chevron press. Transform and opacity only, exponential ease-out, and everything stands still under reduced motion.

**Key Characteristics:**
- Light lit slatwall for the rackets; espresso for the nav, the strip under the wall and section grounds; tonal depth, sparing physical shadows.
- One accent (gravel orange) for primary action, live state and price; sand for secondary action.
- Square-cut corners on every control (4px); no pill buttons, no arrow glyphs on links; chevrons only for previous/next and disclosure.
- Archivo at 90% width for display, labels and prices; Inter Tight for body.
- Physical motion grammar: drop, settle, swing, zoom off the hook and back; expo.out.

## Colors

A warm shop palette: a lit sand-white wall inside espresso grounds, chalk text, one gravel-orange voice and a sand secondary, with no blue anywhere.

### Primary
- **Gravel Orange** (accent): primary buttons, focus outline, text caret, selection, active nav underline, prices on the wall's price tickets, the finder match percentage, the ball and trail in the court diagram, active step and layer titles, the dots in the brand marquee, the balance marker in the anatomy stage, link hover in the footer, brand names on product cards, finder rows and the quick view. Hover lifts to **Hot Gravel** (accent-hover).

### Secondary
- **Court Sand** (accent-2): the secondary button ("Boek een test" in the nav, "Kies je testrackets"), inline error notice, the default racket illustration colour.
- **Label Paper** (paper): the background behind every racket illustration off the wall (catalog cards, the quick view media side, finder result thumbnails) and the sand button hover.

### Tertiary
- **Playstyle colours** (playstyle-power, playstyle-control, playstyle-allround, playstyle-light): data colours only. They fill the racket illustrations, the playstyle tag on cards, the dot in the megamenu and the profile and rating bars. Text on them is always dark ink.

### Neutral
- **Lit Slatwall** (wall): the ground of the racket wall, carrying the groove stack **Slat Face** (wall-groove-face), **Slat** (wall-groove), **Groove Shadow** (wall-groove-shadow) and **Groove Light** (wall-groove-light). Text on the wall is Print Ink; supporting copy on the wall is **Cord Brown** (wall-text), which also draws the wrist-cord loop on each peg.
- **Espresso** (bg): nav bar, the strip under the wall with its two actions, section grounds, the price tickets, the wall's chevron buttons, the quick view panel. Also the theme-color.
- **Groove Brown** (panel): cards, fields, megamenu columns, hover fill on brand cells and finder rows, finder reason tags.
- **Deep Groove** (panel-2): hairline borders, chip outlines on dark, inner hover, scrollbar thumb, bar tracks.
- **Wall Shadow** (ink): page background behind sections, announcement bar, finder and advice sections, the quick view backdrop at 85%.
- **Chalk** (fg): primary text on dark, including the model name on price tickets; reduced with opacity (70 to 85%) for supporting copy.
- **Dust** (muted): meta text, field labels, placeholders, counts, the brand and shape on price tickets.
- **Print Ink** (on-accent): all text on orange, sand, paper, chalk, playstyle colours and the lit wall.
- **Rail Brown** (rail) with **Rail Lip** (rail-lip): the price rail under each wall row, a 30px band with a 2px lighter top edge.
- **Peg Metal** (peg-light to peg-dark): the top-to-bottom gradient on each hook.

### Named Rules
**The Dark Print Rule.** Text on Gravel Orange, Court Sand, Label Paper, the lit wall or a playstyle colour is Print Ink, never white. White on orange fails AA.

**The Ticket Price Rule.** Prices on the wall print in Gravel Orange on the Espresso price tickets (about 6:1), with the model name in Chalk and the brand in Dust. Orange never prints as text on the light wall, Label Paper or sand: there it fails contrast.

**The No Blue Rule.** The palette has no blue or cool grey, including in photography. The testcenter court photo carries a warm CSS grade (`sepia(0.55) saturate(0.7) hue-rotate(-8deg) brightness(0.92)`) to pull the court blue into the palette; any new photo gets the same treatment.

## Typography

**Display Font:** Archivo, variable width axis, set at 90% width (with Inter Tight, system-ui)
**Body Font:** Inter Tight (with system-ui)
**Label/Price Font:** Archivo

**Character:** A slightly condensed, bold grotesque that reads like printed shop signage, paired with a compact, neutral body face for the sentences in between.

### Hierarchy
- **Display** (700, clamp(40px, 5.4vw, 76px), 0.92): the one page title per page, e.g. "De racketwand" in Print Ink on the wall. The brand marquee uses the same face at clamp(34px, 4.4vw, 64px) and 85% width, Chalk at 45% rising to full on hover.
- **Headline** (700, clamp(30px, 3.2vw, 44px), 1): section headings. Smaller variants at clamp(26px, 2.6vw, 36px) and 24px for compact sections; testcenter at clamp(34px, 4vw, 56px).
- **Title** (700, 20 to 30px): guide titles, finder questions and result names, the quick view model name (30px), product names at 600 weight. Step titles in the test explainer drop to 80% width at clamp(28px, 2.6vw, 40px).
- **Body** (400, 16px, 18px for lead copy at md, 1.5): measure 48 to 62ch.
- **Label** (600, 12px, 0.04em, uppercase): brand on a price ticket or card, field and group names, spec terms, footer column heads. 10 to 11px on profile and rating bars.
- **Price** (Archivo 700, 18px, tabular figures): on price tickets; 30px in the quick view; on cards Inter Tight 600 tabular.

### Named Rules
**The Plain Heading Rule.** Headings are sentence-case statements with nothing above or inside them: no eyebrow or kicker label over a section heading, no italic or coloured accent word inside it.

**The Label Is Data Rule.** The uppercase label names a field, a group or a product attribute. It never introduces a section.

## Layout

A single 1400px container, padded 16px on phones and 32px from md. Sections stack full-bleed with 96px vertical padding (py-24) and change ground between Espresso and Wall Shadow rather than using dividers; hairline Deep Groove borders separate rows inside a section. The fixed header is a 32px announcement bar plus a 64px nav bar; the first section offsets by 96px plus the safe-area inset.

The wall is the lit slatwall section: the title row (heading and copy left, shape chips right from lg, bottom-aligned), then two horizontal rows in a 1600px frame, each over its price rail. Every row is a scroll-snap strip at every width: slots are clamp(150px, 15vw, 210px) wide (44vw on phones) with 12px gaps, 20px from md, and the racket hangs in a clamp(190px, 25vh, 260px) drop. Mouse users drag the row; touch and trackpad scroll natively; from md a chevron button sits at each end. Under the wall an Espresso strip carries the test pitch and the two actions. Spacing steps are 8, 12, 20 and 32px, with 96px between sections.

## Elevation & Depth

Mostly tonal: depth comes from stepping the ground between Wall Shadow, Espresso, Groove Brown and Deep Groove, and on the wall from the grooves, three white radial light pools along the top and a slight darkening towards the bottom. Real shadows exist only on things that physically hang or float off the wall; on and near the light wall they are tinted with Print Ink rather than black.

### Shadow Vocabulary
- **Peg cast** (`box-shadow: 0 2px 3px rgb(20 17 15 / 0.35)`): the hook in the wall.
- **Racket cast** (`filter: drop-shadow(10px 14px 10px rgb(20 17 15 / 0.32))`): the racket illustration hanging on the wall; the art itself carries no floor shadow.
- **Ticket drop** (`box-shadow: 0 8px 16px -8px rgb(20 17 15 / 0.6)`): the price ticket under each racket.
- **Rail drop** (`box-shadow: 0 8px 12px -6px rgb(20 17 15 / 0.5)`): the price rail under each row.
- **Wall button** (`box-shadow: 0 6px 16px -6px rgb(20 17 15 / 0.6)`): the chevron buttons floating at the ends of a wall row.
- **Megamenu** (`box-shadow: 0 24px 40px -12px rgb(0 0 0 / 0.6)`): the dropdown panel under the nav.

### Named Rules
**The Hung Object Rule.** A shadow means the object hangs or floats in front of the wall. Cards, buttons and fields stay flat; their hover is a border or fill change, or a small lift (translateY -4px).

## Shapes

Square-cut, like printed retail labels: 4px on controls (buttons, chips, fields, tags, icon buttons, finder thumbnails), 6px on cards, menu tiles and disclosures, 8px on large panels and the quick view, 3px on price tickets and 2px on pegs. Full rounding is reserved for things that are round in the world or for data: the ball, the wrist-cord loop, playstyle and marquee dots, progress steps and bar tracks. Racket heads use their own organic head shape. Borders are 1px hairlines in Deep Groove or Chalk at 5 to 28% opacity; on the wall, Print Ink at 22 to 60%.

## Components

### Buttons
Labelled, square-cut and direct; the label says what happens.
- **Shape:** square-cut (4px), 44px tall, 20px side padding, Archivo 15px 600.
- **Primary:** Gravel Orange with Print Ink; hover to Hot Gravel. One primary per view: book a test.
- **Sand:** Court Sand with Print Ink; hover to Label Paper. The nav "Boek een test" and secondary offers.
- **Line:** transparent with a 1px Chalk border at 28%; hover to full Chalk. Catalog, "see all" and "Bekijk de opbouw" routes.
- **Small:** 36px tall, 14px padding, 14px text, used in the nav.
- **Icon buttons:** square-cut (4px) with an inline chevron or close mark: 44px Espresso at 90% at the ends of the wall rows (full on hover, wall button shadow), 36px transparent on Label Paper in the quick view (Print Ink at 10% on hover), 40px with a Deep Groove border for close.
- **Focus / Disabled:** 2px Gravel Orange outline at 2px offset; disabled at 45% opacity. Transitions are 150ms on colour only.

### Chips
- **Style:** 36px, 12px padding, 1px Deep Groove border, square-cut, Chalk at 85%.
- **State:** hover raises the border to Chalk at 45%; pressed fills Chalk with Print Ink at 600. Used for shape filters, view toggles, booking days and time slots (tabular figures).
- **On the wall:** translucent white fill (35%), Print Ink text, border Print Ink at 22% rising to 60% on hover; pressed fills Print Ink with Chalk text.

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** Groove Brown, with the racket illustration on Label Paper in a square media well.
- **Shadow Strategy:** flat (see Hung Object Rule); hover lifts 4px and the border goes from Chalk 5% to 15%.
- **Border:** 1px Chalk at 5%.
- **Internal Padding:** 12px on phones, 16px from sm. Brand label in Gravel Orange, model name, price, a meta line, then power and control bars.

### Inputs / Fields
- **Style:** 46px, Groove Brown fill, 1px Deep Groove border, 4px corners, 14px padding; placeholder in Dust; label above in the uppercase label style. Selects use the same field.
- **Focus:** border turns Gravel Orange; no glow.
- **Error:** an inline Court Sand notice with Print Ink, 6px corners.

### Navigation
A 64px Espresso bar under a 32px Wall Shadow announcement strip, both fixed. Logo in Archivo 19px bold at 90% width. Links in 15px Chalk at 80%, full on hover; an open megamenu trigger gets a 2px Gravel Orange underline at the bar's bottom edge. Right side: line "Alle rackets" and sand "Boek een test", both small. Megamenus are Groove Brown columns on Espresso; the last column is a Gravel Orange tile. On phones a two-bar toggle opens a sheet with shape tiles, brand tags and plain links.

### Shelf Label (signature)
A dark price ticket sitting on the price rail: Espresso, 10px narrower than its slot, 3px corners and the ticket drop. Brand in the 11px label style in Dust, model in 15px 600 Chalk (two lines max), then shape in 12px Dust on the left and the price in Archivo 18px bold Gravel Orange on the right. Hovering the slot lifts it 2px.

### Racket Peg (signature)
A metal hook (36 by 10px, Peg Metal gradient, peg cast) with a small Cord Brown wrist-cord loop holds the racket illustration, which pivots from its top edge and throws the racket cast onto the wall. On load the first 18 rackets drop 48px with a 7 degree alternating tilt (power3.out, 0.5s, 35ms stagger), then settle to level on expo.out over 1.1s; tickets follow 300ms later. Hover grows the racket to 106% (500ms, cubic-bezier(0.16, 1, 0.3, 1)) and swings it 4, -2.5, 1 degrees over 0.9s. Racket illustrations are generated SVG/raster art per shape and playstyle colour, without a floor shadow, labelled as stand-ins until product photos exist.

### Wall Row
A horizontal strip of pegs over a price rail. A mouse drag engages after 4px so a plain click still opens a racket, and releases into a fling capped at one row width (power3.out, 0.9s); a click straight after a drag is swallowed. From md, chevron buttons at both ends scroll 80% of the row width, instantly under reduced motion.

### Quick View (signature)
The racket zooms off its hook. The backdrop (Wall Shadow at 85%) fades in over 0.35s; the image on the hook hides and the racket FLIPs from its place on the wall to the media side over 0.6s on power3.inOut, from -8 degrees to a slight overshoot (108%, 2 degrees), then settles on expo.out over 0.35s. The Espresso panel with its Label Paper media side fades in at 0.5s and the content staggers in from 16px at 0.62s (expo.out, 35ms). Previous/next by chevron buttons with a count, a horizontal swipe over the image or the arrow keys; the next racket slides in 70px with 4 degrees (expo.out, 0.45s). Closing fades the content, flies the racket back to its hook (expo.inOut, 0.45s) when it is still the one opened and on screen, then fades panel and backdrop. Under reduced motion it opens and closes without animation.

### Rating Bars
Six estimated ratings (Kracht, Controle, Wendbaarheid, Sweet spot, Balafgifte, Comfort) as profile bars in the quick view: label style in Dust, a 6px fully rounded Deep Groove track filled with a playstyle colour, and the value in tabular figures. Always followed by a note that they are a Racket Lab estimate from the specs, not a lab test.

### Brand Marquee
A full-width Espresso band between hairlines with every brand name in large condensed Archivo, separated by small Gravel Orange dots and faded out at both edges. It runs left to right (45s, linear), pauses on hover and offscreen, and stands still under reduced motion. Each name links to its brand page.

### Finder Result Row
A hairline-separated row: the racket drawing on a Label Paper thumbnail (4px), brand label in Gravel Orange, model in 20px bold, a Dust meta line, small Groove Brown reason tags, and the match percentage in Archivo 30px bold Gravel Orange on the right. Hover fills Groove Brown at 60%; a click opens the quick view.

### Anatomy Stage
On Espresso, one racket morphs between round, teardrop and diamond heads (MorphSVG, expo.out) while the dashed sweet-spot ellipse and the orange balance marker slide with it. In build mode the layer stack tilts (rotateX 60, rotateZ -28, 86%) and explodes into layers along z (0.9s expo.inOut, 50ms per layer after 150ms); picking a layer pushes it out 40px. Layer and rule details open in disclosures marked with a rotating chevron.

## Do's and Don'ts

### Do:
- **Do** set text on Gravel Orange, Court Sand, Label Paper, the lit wall and playstyle colours in Print Ink (#14110f).
- **Do** print wall prices in Gravel Orange on the Espresso price tickets; keep orange text off light grounds.
- **Do** keep the racket wall light (Lit Slatwall) so the dark rackets read, and keep Espresso for the nav, the strip under the wall and section grounds.
- **Do** keep controls square-cut at 4px, cards at 6px, panels at 8px.
- **Do** settle motion on expo.out and animate only transform and opacity; stop everything under prefers-reduced-motion.
- **Do** warm-grade any photograph (`sepia(0.55) saturate(0.7) hue-rotate(-8deg) brightness(0.92)`) so no blue enters the palette.
- **Do** use Archivo at 90% width for headings, labels and prices, Inter Tight for body.
- **Do** use a chevron only for previous/next, row scrolling and disclosure.

### Don't:
- **Don't** use pill-shaped buttons, chips or tags.
- **Don't** put arrow glyphs in buttons or links; the label carries the action.
- **Don't** place an eyebrow or kicker label above a section heading.
- **Don't** set an italic or coloured accent word inside a heading.
- **Don't** introduce blue or cool grey, in UI or in imagery.
- **Don't** put white text on Gravel Orange.
- **Don't** add shadows to cards, buttons or fields; shadows are for objects hanging off or floating on the wall.
- **Don't** draw a floor shadow under a racket illustration; on the wall the cast comes from the drop-shadow.
