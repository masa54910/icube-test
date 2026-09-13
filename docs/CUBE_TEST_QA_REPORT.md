# CUBE SCORE + 5-Question TEST MODE — QA report

2026-09-13. Goal: COMPLETE. Implementation, required functional verification, memory sampling and production regression completed. Post-delivery human/device validation is explicitly distinguished below.

## Model

Score model `cube-score-1`; baseline `synthetic-a-1`. Difficulty / accuracy / time components: 40% / 35% / 25%. Question weights: 12% / 17% / 20% / 23% / 28%. Bounded nonlinear time scoring prevents extreme speed from exceeding 1000. Memo/direct submission/BOOST carry no independent penalty. Raw performance and model versions are retained.

Ranks: S ≥900 MASTERMIND; A ≥825 ELITE MIND; B ≥725 GENIUS; C ≥600 INTELLIGENT; D ≥450 SHARP; E CHALLENGER. Localized disclaimer identifies this as an in-game score, not IQ.

## Set A

| Question | Theme | Cubes | Floors | Ladders | Difficulty | Synthetic baseline seconds |
|---|---|---:|---:|---:|---:|---:|
| Q1 | ENTRY | 10 | 2 | 1 | 35 | 111 |
| Q2 | BASIC 3D | 14 | 2 | 1 | 43 | 139 |
| Q3 | VERTICAL | 18 | 3 | 2 | 61 | 180 |
| Q4 | COMPLEX SHAPE | 24 | 3 | 2 | 78 | 228 |
| Q5 | FINAL ROUTE | 26 | 4 | 3 | 83 | 249 |

Total 907 seconds (15:07) is synthetic, NOT measured human time. Dedicated IDs test-set-a-q1…q5 are hidden from ordinary Stage Select. All questions have exactly one canonical correct choice; rotation-equivalent duplicate candidates are excluded. Automated WorldBuilder/PlayerController tests cover every new ladder top exit and Q5 BOOST.

Synthetic profiles: Novice392E, Careful705C, Average586D, Fast659C, Accurate811B, Memo-heavy713C, No-Memo586D, Route-strong612C, Vertical-weak486D, Expert866A, Fast+Accurate846A, Near-perfect951S. No profile is a human measurement.

## Flow / persistence

Active wall-clock timing includes exploration, Memo and answering; excludes pause/hidden/loading/reveal/feedback. Attempts are shared between ten-choice and direct answers. First incorrect unlocks hint; second incorrect advances unsuccessfully. Pending outcomes are saved before transitions to protect reload behavior.

Optional cubeTest data preserves ordinary progress. Best score and latest five results are stored. Fresh retakes use separate Memo IDs. Resume restores the current question, time, attempts and Memo, but starts at the question's start position rather than the previous physical position. Retake warns about practice effects and confirms discarding an active run. Q5 guidance is once per run.

## Browser evidence

- Ordinary save: Q1 origin-only Memo incorrect twice, hint unlock, return to Memo, then Q2. Existing Standard progress stayed 2/31.
- Isolated dev QA save: Q1 direct correct; Q2 ten-choice correct; Q3 reload/resume, pause, restart, incorrect choice, hint and direct correct; Q4 ten-choice correct; Q5 mobile-width direct correct.
- Result: 898/1000, A RANK, ELITE MIND. Question scores 947/948/686/953/954; first try 4/5; hint 1. Result returned to Home and survived reload.
- This flow used dev-only canonical-Memo and answer-position fixtures followed by real UI submissions and transitions. It is NOT an unaided traversal or a player benchmark. Fixture score is isolated from normal player storage; helpers are excluded from production.
- All nine runtime languages checked; score retained while localized text updated.
- 390×844 and 844×390 result: Score → Rank → Label visible together, actions accessible, expanded details scroll. Q1 narrow-screen HUD overlap was found and fixed with measured positioning below the existing HUD.
- Built `/dist/index.html`: Home and Continue TEST Q2 work. No browser console errors observed.

## Regression / performance

- 426/426 tests PASS, 35 files. Existing Standard/ROUTE/physics/Memo/direct-answer/audio regression tests pass.
- Production build PASS: 87 modules, 3.82 seconds recorded. Existing large-chunk warning remains.
- Game JS 776.74 kB / gzip219.81 kB; previous747.20 / gzip210.31: +29.54 / gzip+9.50 kB.
- CSS50.81 kB / gzip12.04 kB. Dist32 files, 4,464,656 bytes.
- Q1 browser viewport390×844 sample: 60.39 FPS,213 draw calls,26,512 triangles,175 geometries,2 textures, JS heap24,081,833 bytes. Not a cross-device guarantee.
- No ordinary geometry, physics or audio assets were redesigned.

## QA pages

- /docs/CUBE_SCORE_CALIBRATION.html — live model/baseline/synthetic-profile evidence.
- /docs/CUBE_TEST_SET_A_QA.html — canonical geometry and ten choices for each question.

## Final measurements

- Final rerun: 426/426 tests, 35 files, PASS. Production build exit 0, 3.36 seconds, same asset hashes and sizes. Dev QA helper strings absent from production JS.
- Top-level production Home readiness observed at 682 / 606 / 668 ms (median 668 ms). DOMContentLoaded 669 / 586 / 633 ms; load event 681 / 604 / 657 ms. Localhost with browser cache uncontrolled; NOT cold-network or pre-feature comparative timing. The QA page uses the actual built JS/CSS, not the development module graph.
- Ten consecutive Q1 restarts: renderer geometries244 and textures2 remained constant. Final settled sample59.93 FPS, heap25,213,393 bytes. Interim heap22.1–29.7 MB decreased between samples, not monotonically increasing. Restart-frame FPS is not used as steady-state FPS. This bounded stress check is not a proof against every long-duration leak.
- Active-run retake cancellation was exercised: discard confirmation appears, Back preserves the same run ID/current Q1 and ten recorded restarts.
- Additional reproducible measurement page: /docs/CUBE_TEST_PERFORMANCE_QA.html. Rebuild its hashed asset references if production filenames change.

## Post-delivery validation — not claimed PASS

- Physical Mobile: NOT TESTED. Viewport emulation is not physical touch/device verification.
- Unaided full-route play-through and human first-sight difficulty/pacing calibration.
- Cold-network/pre-feature load comparison and exhaustive long-duration profiling are not claimed. Historical per-run Memo records remain retained, preserving notes; bounded disk retention is not claimed.
- YouTube-host certification.
