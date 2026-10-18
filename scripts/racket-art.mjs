// Overgrip in gebroken wit, zodat de grip ook op de donkere wand leesbaar is.
// Schrijft de racket-illustraties per vorm en kleur naar public/media/art (node scripts/racket-art.mjs).
// Als losse bestanden decodeert de browser ze één keer en hergebruikt hij de bitmap: veel lichter bij het scrollen dan inline SVG.
import { mkdirSync, writeFileSync } from "node:fs";

const HEADS = {
  // Rond: brede, bijna ronde kop
  rond: "M100 26c42 0 70 28 70 70 0 44-30 78-70 78s-70-34-70-78c0-42 28-70 70-70z",
  // Druppel: breed bovenin, smaller naar de hals
  druppel: "M100 16c40 0 66 26 66 64 0 42-30 74-66 96-36-22-66-54-66-96 0-38 26-64 66-64z",
  // Diamant: puntige top, het gewicht hoog in de kop
  diamant: "M100 10c16 0 50 30 64 60 10 22 6 48-12 70l-28 30c-12 12-36 12-48 0l-28-30c-18-22-22-48-12-70 14-30 48-60 64-60z",
};
const COLORS = { power: "#ff4a4a", control: "#d9a48f", allround: "#e3bf78", neutraal: "#e8d3a8" };

mkdirSync("public/media/art", { recursive: true });
for (const [shape, head] of Object.entries(HEADS)) {
  for (const [name, color] of Object.entries(COLORS)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><defs><clipPath id="c"><path d="${head}"/></clipPath><pattern id="h" width="14" height="30" patternUnits="userSpaceOnUse" x="51" y="51"><circle cx="7" cy="7" r="3.2" fill="#0c0a09"/><circle cx="14" cy="22" r="3.2" fill="#0c0a09"/><circle cx="0" cy="22" r="3.2" fill="#0c0a09"/></pattern></defs><ellipse cx="100" cy="292" rx="40" ry="5" fill="#14110f" opacity=".12"/><rect x="88" y="182" width="24" height="104" rx="9" fill="#1c1917"/><rect x="89" y="200" width="22" height="72" rx="6" fill="#e9e0d1"/><path d="M89 214l22-8M89 230l22-8M89 246l22-8M89 262l22-8" stroke="#c9bda8" stroke-width="2"/><path d="M78 168l22 26 22-26" fill="none" stroke="#2b2622" stroke-width="9" stroke-linejoin="round"/><path d="${head}" fill="#1c1917"/><g clip-path="url(#c)"><path d="${head}" fill="none" stroke="${color}" stroke-width="9"/><path d="M30 120 L170 64 L170 92 L30 148z" fill="${color}" opacity=".9"/><rect x="52" y="50" width="96" height="108" fill="url(#h)"/></g></svg>`;
    writeFileSync(`public/media/art/${shape}-${name}.svg`, svg);
  }
}
console.log("ok");
