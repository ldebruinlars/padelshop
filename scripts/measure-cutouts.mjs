// Meet waar het racket in een vrijstaande foto staat (bovenkant kop, breedste punt, midden), zodat de sweet spot
// en het balanspunt in "Wat zit er in een racket?" op de juiste plek over de foto vallen.
// Gebruik: node scripts/measure-cutouts.mjs lab-r-tour lab-d-tour lab-x-pro
import sharp from "sharp";

const HEAD_MM = 260; // maximale kopbreedte volgens de FIP-regels; we schalen op de breedste rij van de kop

for (const slug of process.argv.slice(2)) {
  const file = `public/media/eigen-lijn/${slug}-vrij.webp`;
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const rows = [];
  for (let y = 0; y < h; y++) {
    let l = -1, r = -1;
    for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 128) { if (l < 0) l = x; r = x; }
    rows.push(l < 0 ? null : [l, r]);
  }
  const top = rows.findIndex(Boolean);
  let widest = 0, widestY = top, cx = 0;
  for (let y = top; y < top + (h - top) * 0.6; y++) {
    const rw = rows[y] ? rows[y][1] - rows[y][0] : 0;
    if (rw > widest) [widest, widestY, cx] = [rw, y, (rows[y][0] + rows[y][1]) / 2];
  }
  const pxPerMm = widest / HEAD_MM;
  const bottom = top + 455 * pxPerMm;
  console.log(JSON.stringify({ slug, w, h, top: +(top / h * 100).toFixed(2), bottom: +(bottom / h * 100).toFixed(2), cx: +(cx / w * 100).toFixed(2), widestY: +(widestY / h * 100).toFixed(2), headW: +(widest / w * 100).toFixed(2) }));
}
