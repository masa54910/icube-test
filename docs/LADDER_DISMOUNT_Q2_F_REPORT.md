# Ladder Jump Dismount / Terminal Collision / Q2 F / Memo Reset

Checked: 2026-09-13

## Implementation

- Shared PlayerController previously initiated a top exit automatically when W reached the top. It was not a TEST-only handler. W/idle now clamps to the ladder top and keeps attachment; Jump alone starts a 0.36-second collision-checked dismount arc to a supported point on the same upper floor. Normal jump/gravity settings are unchanged.
- Existing near-contact, facing correction and post-release input latch remain shared across all sections. No stage-specific ladder override was introduced.
- Answer visuals were excluded by the room-material-only collider collection. Eight static terminal parts are now registered as solid AABBs, including the tabletop, pedestal and monitor. Decorative floating geometry remains non-solid.
- New TEST revision 3 replaces Q2 alone with a 9-cube F. Q1/Q3/Q4/Q5 remain revision-2 geometry. Old in-progress revision-1/2 tests retain their geometry and baseline; start a new test to play F.
- Memo constructor already starts with one origin. Existing notes were being restored, not canonical-prefilled. Fresh-game Memo run namespaces isolate new initialization without deleting prior notes; Continue/Retry use the saved namespace. Explicit canonical prefill is restricted to the isolated TEST dev QA button.

## Q2 canonical (front +X right, +Y up)

```text
####
#...
###.
#...
```

Coordinates: (0,0,0), (0,1,0), (0,2,0), (0,3,0), (1,3,0), (2,3,0), (3,3,0), (1,1,0), (2,1,0).

One continuous stem ladder, two answer points. Exact canonical candidate x1, wrong candidates x9, no rotational duplicates tested. Difficulty 40, synthetic baseline 115 seconds. Score formula and rank thresholds unchanged. Set baseline 757 seconds; synthetic average including hesitation 870.55 seconds. These are NOT human timing measurements.

## Verification

- Automated: 39 files, 500 tests PASS. Includes 20 Q3 hold/Jump cycles, repeated directional contacts, terminal front/side/top/monitor blocking and interaction reachability, all 31 fresh Standard Memo origins, restoration and isolation, Q2 F canonical, unchanged other TEST shapes, existing Standard/ROUTE traversal with explicit Jump at the top.
- Browser Q3: first fixture run stopped at 6/20 with a combined interruption/timeout message (cause not retrospectively distinguishable). Diagnostic reason detail was added to the dev runner. Second run completed 20/20, alternating Q3 ladders: climb, 1.5-second attached hold, Jump, same-floor landing, 1-second idle without recapture. This uses fixture start positions and scripted InputController events in the real browser; it is NOT physical-user/manual traversal QA.
- Browser Q2: new isolated test revision 3, Full Memo 1/256, terminal-front fixture produces E prompt, actual E opens ten-choice F previews.
- Browser Standard: fresh New Game, 1-1 / 2-6 / 3-11 each Full Memo 1/256. ROUTE 1-1 also 1/256. Added +3 in the QA-created run, Reload + Continue restored 4/256.
- Test fixture save is isolated from the normal TEST score. Normal QA changed last-played stage and created a fresh Memo run; existing notes and clear records were not erased.

## Remaining user QA

- Physical device / human-operated Q3 20-cycle repeat and directional entry checks.
- Real-player front/side/jump terminal collision feel in Standard and TEST (automated collider coverage passed; browser E access passed).
- Q2 first-time solve duration is synthetic, not measured human performance.

Do not describe these remaining checks as passed. The implementation and automated/browser-fixture evidence are ready for inspection, but full human-input acceptance is pending.
