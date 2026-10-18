// Schrijft de racket-illustraties per vorm en kleur naar public/media/art (node scripts/racket-art.mjs).
// Als losse bestanden decodeert de browser ze één keer en hergebruikt hij de bitmap: veel lichter bij het scrollen dan inline SVG.
import { mkdirSync, writeFileSync } from "node:fs";

const HEADS = {
  rond: "M100 22c44 0 70 30 70 76 0 44-28 78-70 78s-70-34-70-78c0-46 26-76 70-76z",
  druppel: "M100 18c40 0 66 32 66 80 0 46-28 80-66 80S34 144 34 98c0-48 26-80 66-80z",
  diamant: "M100 14c30 0 56 22 64 56l6 26c4 18-6 40-22 56l-22 22c-14 12-38 12-52 0l-22-22C36 136 26 114 30 96l6-26c8-34 34-56 64-56z",
};
const COLORS = { power: "#ff4a4a", control: "#d9a48f", allround: "#e3bf78", neutraal: "#e8d3a8" };

mkdirSync("public/media/art", { recursive: true });
for (const [shape, head] of Object.entries(HEADS)) {
  for (const [name, color] of Object.entries(COLORS)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><defs><clipPath id="c"><path d="${head}"/></clipPath><pattern id="h" width="14" height="30" patternUnits="userSpaceOnUse" x="51" y="51"><circle cx="7" cy="7" r="3.2" fill="#0c0a09"/><circle cx="14" cy="22" r="3.2" fill="#0c0a09"/><circle cx="0" cy="22" r="3.2" fill="#0c0a09"/></pattern></defs><ellipse cx="100" cy="292" rx="40" ry="5" fill="#14110f" opacity=".12"/><rect x="88" y="182" width="24" height="104" rx="9" fill="#1c1917"/><rect x="88" y="200" width="24" height="70" rx="6" fill="#2b2622"/><path d="M78 168l22 26 22-26" fill="none" stroke="#1c1917" stroke-width="9" stroke-linejoin="round"/><path d="${head}" fill="#1c1917"/><g clip-path="url(#c)"><path d="${head}" fill="none" stroke="${color}" stroke-width="9"/><path d="M30 120 L170 64 L170 92 L30 148z" fill="${color}" opacity=".9"/><rect x="52" y="50" width="96" height="108" fill="url(#h)"/></g></svg>`;
    writeFileSync(`public/media/art/${shape}-${name}.svg`, svg);
  }
}
console.log("ok");
