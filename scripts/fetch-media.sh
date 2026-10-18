#!/usr/bin/env bash
# Haalt de Higgsfield-beelden op en zet ze klaar in public/media.
# De shopfoto's zijn tijdelijke placeholders tot de echte productfoto's uit de winkel er zijn.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/media
mkdir -p "$OUT/shop" .media-src
BASE=https://d8j0ntlcm91z4.cloudfront.net/user_3DTi6Z7G6lm7S5aYIwHXC1iM486

get() { curl -fsSL --retry 3 -o ".media-src/$2" "$BASE/$1"; }

# Testcenter (bestaand)
get hf_20261018_154512_118eda62-18b0-4a7c-975f-bb9fbf498f14.png coach-testcenter.png

# Hero en og.jpg komen uit de eigen fotoshoot (Google Drive: ACA_PoortPadel_29mei-5.jpg) en staan al in de repo:
# public/media/hero-poort-padel.webp (2400 px) en public/og.jpg (1200x630).

# Rackets op zandkleurige achtergrond (placeholders)
get hf_20261018_184812_ae9de76e-1ccc-44ce-89f9-370ee51127d1.png racket-volt-x.png
get hf_20261018_184812_1d4b51bc-cc35-43c4-bd38-1ef1fa22d8fd.png racket-aim-r.png
get hf_20261018_184814_7b7c97a6-7aad-4ea3-afdf-376d992e924d.png racket-flow-t.png
get hf_20261018_184814_8d6219d0-c45e-4312-8c16-3ada1c21bded.png racket-air-s.png
get hf_20261018_184812_9420d0ca-e6d8-4eb1-a68a-1a6d7aeff06b.png racket-blaze-d.png
get hf_20261018_184813_405d442e-9aea-4c80-94ca-01a8407453b6.png racket-edge-c.png
get hf_20261018_184813_f2001742-4934-4d2c-b77b-6c759bdf20d4.png racket-mix-a.png
get hf_20261018_184813_4ce74fc1-f6c2-41c5-b648-6ae1e5ddeacf.png racket-lite-k.png

# Categorieën (placeholders)
get hf_20261018_184813_964b96c0-6c78-44b4-b2a9-afa24123697c.png cat-schoenen.png
get hf_20261018_184812_03c0bd53-ad97-458f-8d45-0acf29b0308d.png cat-tassen.png
get hf_20261018_184813_9f06e40d-6fd2-4fdf-9c85-91a912e38647.png cat-ballen.png
get hf_20261018_184812_91dd6756-db35-4757-a0b3-c5a4eceadb1c.png cat-accessoires.png
get hf_20261018_184833_7828e03f-bbd9-4da5-b1ba-d42e903d65b7.png cat-kleding.png

for f in .media-src/*.png; do
  n=$(basename "$f" .png)
  case "$n" in
    racket-*) W=800; DIR="$OUT/shop" ;;
    cat-*) W=1200; DIR="$OUT/shop" ;;
    *) W=2000; DIR="$OUT" ;;
  esac
  ffmpeg -loglevel error -y -i "$f" -vf "scale=min($W\,iw):-2" -c:v libwebp -quality 80 "$DIR/$n.webp"
done

echo "Klaar: $(ls "$OUT"/shop/*.webp | wc -l) shopfoto's"
du -sh "$OUT"
