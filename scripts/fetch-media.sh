#!/usr/bin/env bash
# Haalt de Higgsfield-beelden en -video's op en zet ze klaar in public/media.
# Draaiend racket: 72 frames uit de turntable-video (webp, 900 px).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/media
mkdir -p "$OUT/turntable" .media-src
BASE=https://d8j0ntlcm91z4.cloudfront.net/user_3DTi6Z7G6lm7S5aYIwHXC1iM486

get() { curl -fsSL --retry 3 -o ".media-src/$2" "$BASE/$1"; }

get hf_20261018_154639_238f9448-4665-401e-acc5-3c0015374361.png hero-racket.png
get hf_20261018_154512_63dcff56-9939-4224-8821-62e6ec89d319.png racket-power.png
get hf_20261018_154512_31c30192-c63f-4937-92cf-5d9395b513ca.png racket-control.png
get hf_20261018_154512_f5904eca-e887-4b88-86c8-98cf1ce472c9.png racket-allround.png
get hf_20261018_154512_cc0f48ae-0122-483b-91df-25fb04b65a4d.png racket-light.png
get hf_20261018_154512_425acc78-c2fb-407a-be1e-381a48042440.png exploded.png
get hf_20261018_154512_7c4bbe6b-1264-4f9f-9373-a1a8423a89b0.png carbon-macro.png
get hf_20261018_154512_4dea2664-b93f-468e-812e-c056ca85a43d.png player-smash.png
get hf_20261018_154512_118eda62-18b0-4a7c-975f-bb9fbf498f14.png coach-testcenter.png
get hf_20261018_154512_c94d6ac0-8c7c-49b4-a233-c8844260a10f.png racket-wall.png
get hf_20261018_155156_e58f43c1-4772-4916-9536-0298e0543086.mp4 turntable.mp4
get hf_20261018_155159_c228f783-f4da-4308-84e2-d7f8e911a4b4.mp4 hero-loop.mp4

# Foto's: max 2000 px breed, webp kwaliteit 82 (bestandsnamen blijven .png-namen als .webp)
for f in .media-src/*.png; do
  n=$(basename "$f" .png)
  ffmpeg -loglevel error -y -i "$f" -vf "scale='min(2000,iw)':-2" -quality 82 "$OUT/$n.webp"
done

# Hero-video: 1280 px, zonder audio, klein genoeg voor autoplay
ffmpeg -loglevel error -y -i .media-src/hero-loop.mp4 -an -vf "scale=1280:-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart -pix_fmt yuv420p "$OUT/hero-loop.mp4"

# Turntable: 72 frames gelijk verdeeld over de video
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 .media-src/turntable.mp4)
ffmpeg -loglevel error -y -i .media-src/turntable.mp4 -vf "fps=72/${DUR},scale=900:-2" -c:v libwebp -quality 78 "$OUT/turntable/f%03d.webp"

echo "Klaar: $(ls "$OUT"/*.webp | wc -l) foto's, $(ls "$OUT/turntable" | wc -l) frames"
du -sh "$OUT"
