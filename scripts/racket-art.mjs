// Overgrip in gebroken wit, zodat de grip ook op de donkere wand leesbaar is.
// Schrijft de racket-illustraties per vorm en kleur naar public/media/art (node scripts/racket-art.mjs).
// Als losse bestanden decodeert de browser ze één keer en hergebruikt hij de bitmap: veel lichter bij het scrollen dan inline SVG.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Kopvormen staan in src/lib/racket-heads.json, gedeeld met de vorm-animatie op de site.
const HEADS = JSON.parse(readFileSync("src/lib/racket-heads.json", "utf8"));
const COLORS = { power: "#ff4a4a", control: "#d9a48f", allround: "#e3bf78", neutraal: "#e8d3a8" };

mkdirSync("public/media/art", { recursive: true });
for (const [shape, head] of Object.entries(HEADS)) {
  for (const [name, color] of Object.entries(COLORS)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><defs><clipPath id="c"><path d="${head}"/></clipPath><pattern id="h" width="14" height="30" patternUnits="userSpaceOnUse" x="51" y="51"><circle cx="7" cy="7" r="3.2" fill="#0c0a09"/><circle cx="14" cy="22" r="3.2" fill="#0c0a09"/><circle cx="0" cy="22" r="3.2" fill="#0c0a09"/></pattern></defs><rect x="88" y="182" width="24" height="104" rx="9" fill="#1c1917"/><rect x="89" y="200" width="22" height="72" rx="6" fill="#e9e0d1"/><path d="M89 214l22-8M89 230l22-8M89 246l22-8M89 262l22-8" stroke="#c9bda8" stroke-width="2"/><path d="M78 168l22 26 22-26" fill="none" stroke="#2b2622" stroke-width="9" stroke-linejoin="round"/><path d="${head}" fill="#1c1917"/><g clip-path="url(#c)"><path d="${head}" fill="none" stroke="${color}" stroke-width="9"/><path d="M30 120 L170 64 L170 92 L30 148z" fill="${color}" opacity=".9"/><rect x="52" y="50" width="96" height="108" fill="url(#h)"/></g></svg>`;
    writeFileSync(`public/media/art/${shape}-${name}.svg`, svg);
  }
}
console.log("ok");
