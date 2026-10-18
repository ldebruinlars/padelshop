---
target: Racket Lab homepage
total_score: 19
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 3
target_identity: "file:/home/user/padel-site/src/app/page.tsx"
target_fingerprint: "sha256:78798d14024b8d83f5baf49bc6a8f3498ea8117161d76ede358936e942fff7d6"
target_path: /home/user/padel-site/src/app/page.tsx
timestamp: 2026-10-18T16-34-16Z
slug: src-app-page-tsx
---
# Critique: Racket Lab homepage (src/app/page.tsx)
Method: dual-agent (A: design review · B: detector + browser), plus separate technical QA.

## Heuristics (score 19/32, Acceptable; 7 and 10 n/a, Persuade surface)
1 Status 2 · 2 Real world 3 · 3 Control 2 · 4 Consistency 2 · 5 Error prevention 2 · 6 Recognition 3 · 7 n/a · 8 Aesthetic 3 · 9 Recovery 2 · 10 n/a

## Specificity
The offer (test with a coach at Poort Padel, fee back on purchase, coach-scored power/control) is specific. The cinematic shell (letters, 360, exploded, marquee) is category-generic Bullpadel-style; the differentiator appears only in section 7.

## Priority issues
- [P0] Mouse-wheel scrolling dead on desktop (Lenis ref empty at effect time). FIXED.
- [P1] Hero H1 near-invisible (multiply mask). Improved: brighter media, lime outline layer.
- [P1] Finder contradictory advice, non-testable picks, no back. FIXED.
- [P1] Booking had no contact fields / not real. FIXED: name+email, Netlify Forms, error state. Open: cancellation policy, coach photos, carry finder picks into booking.
- [P2] No mobile nav; megamenu keyboard trap. FIXED.

## Detector
CLI 0 (regex-only). Browser: low-contrast marquee (fixed), 10px badges (fixed), dark-glow / stripes on racket illustration (intentional), kicker-above-heading x5 (house eyebrow style), nested stat tiles (accepted), marquee (has hover pause + reduced motion).

## Open questions
Test centre in the hero? Cancellation policy? Supabase for real availability?
