# Advanced ROUTE 1 — PURE ROUTE 10-Stage Production

Status: READY FOR USER QA

## Scope and architecture

- 10 production stages, IDs `advanced-route1-1` through `advanced-route1-10`, numeric IDs 101–110.
- Stage Select: STANDARD 31 / ADVANCED ROUTE 1 — PURE ROUTE 10. Prototype A-1–A-3 retained in archive, not shown in production selection; old IDs not reused.
- Ordered voxel path, chapter, answer point array, boost metadata. Canonical derives solely from route voxels. No protrusions, branches or extra dead ends beyond START/GOAL.
- Existing Memo engine, save format, hint rules, normal movement speed, jump physics, ladder mechanics, POV, LOOK UP, Standard data, SDK, Home and Correct timeline retained.

## Difficulty audit

| Stage | Cubes | Horizontal turns | Floors | Vertical transitions | Longest straight (cubes) | Answer Points | Boosts |
|---|---:|---:|---:|---:|---:|---:|---:|
|1-1|17|3|2|1|5|2|0|
|1-2|19|4|2|1|7|2|1|
|1-3|21|4|2|2|7|2|1|
|1-4|23|5|2|2|7|3|1|
|1-5|25|5|3|2|7|3|1|
|1-6|27|6|3|2|7|3|1|
|1-7|29|6|3|3|7|3|2|
|1-8|31|7|3|3|7|3|2|
|1-9|33|8|3|3|7|4|2|
|1-10|36|8|3|3|7|4|2|

Each graph has degree 1 at START/GOAL and degree 2 elsewhere. Vertical steps are excluded from yaw-turn count. 1-1 has two 2F answer opportunities. 1-3/1-4 return to 1F; 1-7 onward include ascent to 3F and descent to 2F. Cognitive difficulty is a design hypothesis, not a unit-test result; user playtesting remains essential.

## Multiple Answer Points / BOOST PAD

- 29 total answer entrances. The displayed 10-choice set, two attempts and hint unlock are shared within each stage; no checkpoint behaviour.
- Standard uses its original single position and offset unchanged.
- Terminals retain materials/contact shadows and independently fade/rotate by proximity.
- Boosts activate only on forward approach, accelerate/decelerate over a configured distance, and finish two cubes before a straight ends. Reverse approach does not activate. Collision remains enabled. Jump is suppressed during boost; normal jump physics are unchanged.
- Navy floor chevrons, soft cyan activation and reusable trail; faster visual jog cadence while boosting. No FOV change or external audio asset.

## Answers / Memo / save

- Every stage: exact normalized Canonical x1, easy x5, medium x3, similar x1; all 10 unique under 24 proper rotations. No protrusions in wrong candidates; modified paths are validated as continuous.
- Shared elevated camera and common scale. QA canonical and correct candidate render identically.
- Full/Mini Memo, complete and partial hints, missing-cube non-disclosure and stage isolation tested for all 10 stages. Retry retains notes. Reload/Continue tested for Route 1-7, without switching to Standard 1-7.
- All nine locales contain PURE ROUTE, BOOST PAD and shared-answer explanations. Runtime switching checked in the open help page.

## Browser verification and limits

- Edge headless, production bundle. Private game instance exposed only in the isolated browser response for observation/fixtures; no persistent production debug UI.
- 1-1 / 1-5 / 1-10: START to goal via real W/A/D and mouse controls, including ladders; Memo editing, correct selection, transition and Result. No position teleport in these full traversals. 1-5 and 1-10 crossed Boosts. Final 1-1 traversal opened both 2F Answer Points before answering.
- All 29 answer points: fixture positioning to individually exercise the real interaction/quiz handlers. Same answer order, shared incorrect attempt, Hint, Retry checked. Other seven routes have graph/connectivity and terminal fixture checks, not full keyboard traversals.
- Mobile emulation: 390×844 and 844×390, representative 1-1 / 1-5 / 1-10. Actual touch stick triggers Boost; Memo and answer display checked. Touch selection, scroll-to-submit, Correct/Result and Next Stage checked in both orientations.
- Physical phone, hosted YouTube execution and subjective difficulty: NOT TESTED here. A ladder exit requires steering away from the hatch, as before; no ladder mechanic was changed.

## Performance

Measurements are short (~2 s), warmed headless Edge samples on this PC, not physical-mobile GPU benchmarks.

| View | Stage | FPS | Draw calls | Triangles | Textures | JS heap bytes |
|---|---|---:|---:|---:|---:|---:|
|Desktop|1-1|60.16|378|34976|2|12581746|
|Desktop|1-5|60.21|521|39380|2|16136816|
|Desktop|1-10|60.00|472|37640|2|28134621|
|Mobile portrait|1-1|60.14|244|28204|2|16890982|
|Mobile portrait|1-5|59.98|310|30138|2|13307424|
|Mobile portrait|1-10|60.12|310|30138|2|23999125|
|Mobile landscape|1-1|60.09|383|35132|2|19536678|
|Mobile landscape|1-5|60.19|613|43138|2|18862160|
|Mobile landscape|1-10|60.11|503|38962|2|20205665|

An initial cold 1-1 sample was ~37.8fps; after a 2 s warmup it was ~60.2fps. Six repeated 1-10 starts stabilized at 360 renderer geometries / 2 textures after warmup. This is a bounded resource check, not a proof of absence of every leak. Frustum culling is retained; no meshes for inactive stages are created.

Production bundle: 721.88 kB / gzip 202.81 kB, versus preceding answer-fix bundle 709.98 kB / gzip 198.46 kB. Existing >500 kB chunk warning remains.

## Tests / evidence

- 281 automated tests PASS; production TypeScript/Vite build PASS.
- Standard 31 answer positions/counts and Canonical choices validated. Existing movement, jump, ladder, camera, Memo and rendering tests PASS.
- Standard geometry source SHA256: `F25CF95D3524A2521685211BEDC44FCE880D068DD619F63E2AB5442BEEA05CF9`.
- [Canonical + choices + route overview](ROUTE1_ANSWER_QA.html)
- [1-1 final full traversal](route1-qa/full-play-101-final.json), [1-5 / 1-10 full traversal](route1-qa/full-play.json)
- [29 point checks](route1-qa/points.json), [mobile / performance](route1-qa/mobile-performance.json), [touch Result / Next and resource check](route1-qa/final-smoke.json)
- [1-1 result](route1-qa/full-101.png), [1-5 result](route1-qa/full-105.png), [1-10 result](route1-qa/full-110.png)

## Remaining user QA

Physical-device responsiveness/performance; whether the length, folds and floor changes form a satisfying difficulty curve; whether 1-1 feels appropriately Advanced and 1-10 is demanding without being unfair. No ROUTE 2/3 stages were added.
