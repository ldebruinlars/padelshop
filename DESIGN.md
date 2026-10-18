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
  rail: "#3a312b"
  playstyle-power: "#ff4a4a"
  playstyle-control: "#d9a48f"
  playstyle-allround: "#e3bf78"
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
  shelf-label:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.shelf-label}"
    padding: "10px 12px"
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

The site is the back wall of a padel pro shop after closing: an espresso slatwall with warm light pooling from two spots at the top, rackets hanging on steel pegs, and a sand-coloured shelf label under each one. Everything is read the way you read a shop: brand, model, shape, price, then a decision to take it off the wall or book it on court. Density is retail-high, not editorial: many products in view at once, few words per item.

The material vocabulary is physical and warm. Grounds are dark brown-black, never neutral grey and never blue; text is chalk; the one loud colour is gravel orange, the colour of a clay court and of the ball. Corners are square-cut like printed shop labels. Type is Archivo slightly condensed for anything that names or prices a thing, Inter Tight for the sentences around it. Headings are plain sentence-case statements with no decoration around them.

Motion is the wall behaving like a wall: rackets drop onto their pegs and settle, swing from the hook when touched, and lift off into the quick view. Transform and opacity only, exponential ease-out, and everything stands still under reduced motion.

**Key Characteristics:**
- Espresso slatwall ground with warm top light; tonal depth, sparing physical shadows.
- One accent (gravel orange) for primary action, live state and price; sand for secondary action and labels.
- Square-cut corners on every control (4px); no pill buttons, no arrow glyphs.
- Archivo at 90% width for display, labels and prices; Inter Tight for body.
- Physical motion grammar: drop, settle, swing, lift; expo.out.

## Colors

A warm, low-light shop palette: espresso grounds, chalk text, one gravel-orange voice and a sand secondary, with no blue anywhere.

### Primary
- **Gravel Orange** (accent): primary buttons, focus outline, text caret, selection, active nav underline, the ball and trail in the court diagram, active step titles, link hover in the footer, brand names on product cards. Hover lifts to **Hot Gravel** (accent-hover).

### Secondary
- **Court Sand** (accent-2): the secondary button ("Boek een test" in the nav, "Kies je testrackets"), inline error notice, the default racket illustration colour.
- **Label Paper** (paper): shelf labels on the wall, the background behind every racket illustration, and the sand button hover.

### Tertiary
- **Playstyle colours** (playstyle-power, playstyle-control, playstyle-allround): data colours only. They fill the racket illustrations, the playstyle tag on cards, the dot in the megamenu and the power/control profile bars. Text on them is always dark ink.

### Neutral
- **Espresso** (bg): the slatwall, nav bar, section grounds. Also the theme-color.
- **Groove Brown** (panel): cards, fields, megamenu columns, hover fill on brand cells.
- **Deep Groove** (panel-2): hairline borders, chip outlines, inner hover, scrollbar thumb, bar tracks.
- **Wall Shadow** (ink): page background behind sections, price rail, announcement bar, advice section.
- **Chalk** (fg): primary text; reduced with opacity (70 to 85%) for supporting copy.
- **Dust** (muted): meta text, field labels, placeholders, counts.
- **Print Ink** (on-accent): all text on orange, sand, paper, chalk and playstyle colours.
- **Peg Steel** (rail): pegs and the top edge of the price rail on the wall.

### Named Rules
**The Dark Print Rule.** Text on Gravel Orange, Court Sand, Label Paper or a playstyle colour is Print Ink, never white. White on orange fails AA.

**The Ink Price Rule.** On the sand shelf labels the price prints in Print Ink, not orange: orange on Label Paper fails contrast. Orange prices belong only on dark grounds.

**The No Blue Rule.** The palette has no blue or cool grey, including in photography. The testcenter court photo carries a warm CSS grade (`sepia(0.55) saturate(0.7) hue-rotate(-8deg) brightness(0.92)`) to pull the court blue into the palette; any new photo gets the same treatment.

## Typography

**Display Font:** Archivo, variable width axis, set at 90% width (with Inter Tight, system-ui)
**Body Font:** Inter Tight (with system-ui)
**Label/Price Font:** Archivo

**Character:** A slightly condensed, bold grotesque that reads like printed shop signage, paired with a compact, neutral body face for the sentences in between.

### Hierarchy
- **Display** (700, clamp(40px, 5.4vw, 76px), 0.92): the one page title per page, e.g. "De racketwand".
- **Headline** (700, clamp(30px, 3.2vw, 44px), 1): section headings. Smaller variants at clamp(26px, 2.6vw, 36px) and 24px for compact sections; testcenter at clamp(34px, 4vw, 56px).
- **Title** (700, 20 to 30px): guide titles, the thuistest heading, product names at 600 weight. Step titles in the test explainer drop to 80% width at clamp(28px, 2.6vw, 40px).
- **Body** (400, 16px, 18px for lead copy at md, 1.5): measure 48 to 62ch.
- **Label** (600, 12px, 0.04em, uppercase): brand on a shelf label or card, field and group names, footer column heads. 11px with 0.1em on profile bars.
- **Price** (Archivo 700, 18px, tabular figures): on shelf labels; on cards Inter Tight 600 tabular.

### Named Rules
**The Plain Heading Rule.** Headings are sentence-case statements with nothing above or inside them: no eyebrow or kicker label over a section heading, no italic or coloured accent word inside it.

**The Label Is Data Rule.** The uppercase label names a field, a group or a product attribute. It never introduces a section.

## Layout

A single 1400px container, padded 16px on phones and 32px from md. Sections stack full-bleed with 96px vertical padding (py-24) and change ground between Espresso and Wall Shadow rather than using dividers; hairline Deep Groove borders separate rows inside a section. The fixed header is a 32px announcement bar plus a 64px nav bar; the first section offsets by 96px plus the safe-area inset.

The wall is a six-column grid from md with 12px gaps, two rows on the homepage, each row over a price rail. Below md each row becomes a horizontal scroll-snap strip with racket slots at 40vw (44vw on small phones). Title rows put the heading left and copy or filters right from lg, bottom-aligned. Spacing steps are 8, 12, 20 and 32px, with 96px between sections.

## Elevation & Depth

Mostly tonal: depth comes from stepping the ground between Wall Shadow, Espresso, Groove Brown and Deep Groove, and from the slatwall's grooves and two warm radial spotlights. Real shadows exist only on things that physically hang or float off the wall.

### Shadow Vocabulary
- **Peg cast** (`box-shadow: 0 2px 3px rgb(0 0 0 / 0.5)`): the hook in the wall.
- **Shelf label drop** (`box-shadow: 0 6px 14px -6px rgb(0 0 0 / 0.7)`): the paper label under each racket.
- **Rail drop** (`box-shadow: 0 6px 10px -4px rgb(0 0 0 / 0.7)`): the price rail under each row.
- **Megamenu** (`box-shadow: 0 24px 40px -12px rgb(0 0 0 / 0.6)`): the dropdown panel under the nav.

### Named Rules
**The Hung Object Rule.** A shadow means the object hangs or floats in front of the wall. Cards, buttons and fields stay flat; their hover is a border or fill change, or a small lift (translateY -4px).

## Shapes

Square-cut, like printed retail labels: 4px on controls (buttons, chips, fields, tags, icon buttons), 6px on cards and menu tiles, 8px on large panels, 3px on shelf labels and 2px on pegs. Full rounding is reserved for things that are round in the world or for data: the ball, playstyle dots, progress steps and profile bar tracks. Racket heads use their own organic head shape. Borders are 1px hairlines in Deep Groove or Chalk at 5 to 28% opacity.

## Components

### Buttons
Labelled, square-cut and direct; the label says what happens.
- **Shape:** square-cut (4px), 44px tall, 20px side padding, Archivo 15px 600.
- **Primary:** Gravel Orange with Print Ink; hover to Hot Gravel. One primary per view: book a test.
- **Sand:** Court Sand with Print Ink; hover to Label Paper. The nav "Boek een test" and secondary offers.
- **Line:** transparent with a 1px Chalk border at 28%; hover to full Chalk. Catalog and "see all" routes.
- **Small:** 36px tall, 14px padding, 14px text, used in the nav.
- **Focus / Disabled:** 2px Gravel Orange outline at 2px offset; disabled at 45% opacity. Transitions are 150ms on colour only.

### Chips
- **Style:** 36px, 12px padding, 1px Deep Groove border, square-cut, Chalk at 85%.
- **State:** hover raises the border to Chalk at 45%; pressed fills Chalk with Print Ink at 600. Used for shape filters, booking days and time slots (tabular figures).

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** Groove Brown, with the racket illustration on Label Paper in a square media well.
- **Shadow Strategy:** flat (see Hung Object Rule); hover lifts 4px and the border goes from Chalk 5% to 15%.
- **Border:** 1px Chalk at 5%.
- **Internal Padding:** 12px on phones, 16px from sm. Brand label in Gravel Orange, model name, price, a meta line, then power and control bars.

### Inputs / Fields
- **Style:** 46px, Groove Brown fill, 1px Deep Groove border, 4px corners, 14px padding; placeholder in Dust; label above in the uppercase label style.
- **Focus:** border turns Gravel Orange; no glow.
- **Error:** an inline Court Sand notice with Print Ink, 6px corners.

### Navigation
A 64px Espresso bar under a 32px Wall Shadow announcement strip, both fixed. Logo in Archivo 19px bold at 90% width. Links in 15px Chalk at 80%, full on hover; an open megamenu trigger gets a 2px Gravel Orange underline at the bar's bottom edge. Right side: line "Alle rackets" and sand "Boek een test", both small. Megamenus are Groove Brown columns on Espresso; the last column is a Gravel Orange tile. On phones a two-bar toggle opens a sheet with shape tiles, brand tags and plain links.

### Shelf Label (signature)
A Label Paper tag 12px narrower than its slot with 3px corners and the shelf-label drop: brand in the 11px label style at 70% ink, model in 15px 600 (two lines max), then shape on the left and price in Archivo 18px bold on the right, all in Print Ink. Hovering the slot lifts it 2px.

### Racket Peg (signature)
A Peg Steel hook (36 by 10px plus a 3px stem) holds the racket illustration, which pivots from its top edge. On load the rackets drop 48px with a 7 degree alternating tilt (power3.out, 0.5s, 45ms stagger), then settle to level on expo.out over 1.1s; labels follow 300ms later. Hover swings the racket 4, -2.5, 1 degrees over 0.9s. Click opens the quick view from the slot (expo.out, 0.55s). Racket illustrations are generated SVG/raster art per shape and playstyle colour, labelled as stand-ins until product photos exist.

## Do's and Don'ts

### Do:
- **Do** set text on Gravel Orange, Court Sand, Label Paper and playstyle colours in Print Ink (#14110f).
- **Do** print shelf-label prices in Print Ink; keep orange prices on dark grounds only.
- **Do** keep controls square-cut at 4px, cards at 6px, panels at 8px.
- **Do** settle motion on expo.out and animate only transform and opacity; stop everything under prefers-reduced-motion.
- **Do** warm-grade any photograph (`sepia(0.55) saturate(0.7) hue-rotate(-8deg) brightness(0.92)`) so no blue enters the palette.
- **Do** use Archivo at 90% width for headings, labels and prices, Inter Tight for body.

### Don't:
- **Don't** use pill-shaped buttons, chips or tags.
- **Don't** put arrow glyphs in buttons or links; the label carries the action.
- **Don't** place an eyebrow or kicker label above a section heading.
- **Don't** set an italic or coloured accent word inside a heading.
- **Don't** introduce blue or cool grey, in UI or in imagery.
- **Don't** put white text on Gravel Orange.
- **Don't** add shadows to cards, buttons or fields; shadows are for objects hanging off the wall.
