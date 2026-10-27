// Trekt de kopvormen (rond, druppel, diamant) over uit vrijstaande racketfoto's en schrijft ze naar
// src/lib/racket-heads.json (viewBox 200 x 300, kop van y=12 tot ~176, breedste punt 156 eenheden).
// Gebruik: node scripts/trace-heads.mjs   (daarna node scripts/racket-art.mjs voor de tekeningen)
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SRC = { rond: "lab-r-tour", druppel: "lab-d-tour", diamant: "lab-x-pro" };

async function trace(file) {
  const { data, info } = await sharp(`public/media/eigen-lijn/${file}-vrij.webp`).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const rows = [];
  for (let y = 0; y < H; y++) {
    let l = -1, r = -1;
    for (let x = 0; x < W; x++) if (data[y * W + x] > 128) { if (l < 0) l = x; r = x; }
    rows.push(l < 0 ? null : [l, r]);
  }
  const top = rows.findIndex(Boolean);
  const widths = rows.map((v) => (v ? v[1] - v[0] : 0));
  const maxW = Math.max(...widths);
  const widest = widths.indexOf(maxW);
  const cx = (rows[widest][0] + rows[widest][1]) / 2;
  // Onderkant van de kop: waar het hart (de open driehoek boven de grip) begint, dus waar het midden een flink stuk
  // doorzichtig is. Gaatjes in het slagvlak zijn veel kleiner dan het hart.
  let bottom = widest;
  for (let y = widest; y < H; y++) {
    let run = 0;
    while (y + run < H && data[(y + run) * W + Math.round(cx)] <= 128) run++;
    if (run > H * 0.04) { bottom = y; break; }
  }
  // Halve breedte per rij, symmetrisch, gladgestreken en zonder deuken: tot het breedste punt alleen breder, daarna alleen smaller
  const half = [];
  for (let y = top; y <= bottom; y++) {
    let sum = 0, k = 0;
    for (let d = -6; d <= 6; d++) if (rows[y + d]) { sum += (rows[y + d][1] - rows[y + d][0]) / 2; k++; }
    half.push(sum / k);
  }
  const wi = widest - top;
  for (let i = 1; i <= wi; i++) half[i] = Math.max(half[i], half[i - 1]);
  for (let i = half.length - 2; i > wi; i--) half[i] = Math.max(half[i], half[i + 1]);
  const s = 156 / maxW;
  // Alle koppen even lang (162 eenheden, ongeveer 27 cm), zodat ze op hetzelfde hart en dezelfde grip passen
  const sy = 162 / (half.length - 1);
  const n = 40;
  const right = [];
  for (let i = 0; i <= n; i++) {
    const t = Math.pow(i / n, 1.35); // dichter bij de bovenkant, waar de bocht het scherpst is
    const j = Math.round(t * (half.length - 1));
    right.push([100 + half[j] * s, 12 + j * sy]);
  }
  const yb = 12 + (half.length - 1) * sy;
  const last = right[right.length - 1];
  // Onderkant: afgeronde hoek en een zachte boog naar het midden, waar de kop overgaat in het hart
  const corner = [100 + (last[0] - 100) * 0.6, yb + 3];
  const ring = [[100, 12], ...right.slice(1), corner, [100, yb + 4], [200 - corner[0], corner[1]], ...right.slice(1).reverse().map(([x, y]) => [200 - x, y])];
  return { path: smooth(ring), info: { widest: (wi / (half.length - 1)).toFixed(2), len: (yb - 12).toFixed(0), bottomW: (half[half.length - 1] * 2 * s).toFixed(0) } };
}

// Catmull-Rom door de punten, als kubische Bézier-curven
function smooth(p) {
  const f = (v) => v.toFixed(1);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

const out = {};
for (const [shape, file] of Object.entries(SRC)) {
  const t = await trace(file);
  out[shape] = t.path;
  console.log(shape, t.info);
}
writeFileSync("src/lib/racket-heads.json", JSON.stringify(out, null, 2) + "\n");
