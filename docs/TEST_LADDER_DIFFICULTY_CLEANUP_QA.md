# TEST Ladder + Difficulty + CUBE MEMO Cleanup

Date: 2026-09-13

Status: IMPLEMENTED — NORMAL-INPUT BROWSER QA INCOMPLETE. Not READY FOR USER QA acceptance.

## Progress

1. Shared runtime/code-path audit: COMPLETE. Actual user-device symptom reproduction: pending.
2. Shared controller fix: COMPLETE at code/unit-test level; normal-input repeated ladder QA pending.
3. TEST geometry revision: COMPLETE; human timing validation pending.
4. Memo HUD cleanup: COMPLETE.
5. Fresh memo storage isolation: COMPLETE.
6. Calibration/i18n/responsive: implemented; limited viewport checks complete, physical touch not tested.
7. Regression/build: COMPLETE. Full normal-input Q1–Q5 browser play: BLOCKED by available input tooling.

## Confirmed controller defect

TEST, Standard and ROUTE use the same `Game.player` PlayerController instance and `player.update` call. TEST wraps stage identity for memo isolation, not ladder physics.

The prior exit guard cleared whenever `world.ladderAt(position)` no longer returned the released ladder. The intended safe top-exit target already lies outside that volume, so the guard was removed on the next update. Contact re-entry after the cooldown could capture the ladder without a new command.

The new regression reproduced this: climb, exit, idle outside the volume, re-enter contact coordinates without input. It failed before and passed after the fix. This controlled coordinate fixture demonstrates the latch defect, **not** a completed reproduction of every user-device fall.

The released-rail latch now persists until neutral input followed by a new movement command, or a new Jump/Down press. Time and volume crossing alone do not unlock it. Near-contact grounded snaps also validate the short path against world collision before changing position/yaw. Jump height/distance, gravity, walking speed and ladder speed are unchanged.

Automated Q3: 20 simulated climbs, both ladders, five-second supported-floor idle: PASS. Normal-input browser Q3 20/20: NOT TESTED. Left/right/rear/upper five repetitions each: NOT TESTED. Existing direction, down-climb, jump-down and representative Standard/ROUTE tests pass but are not physical-input substitutes.

## Revised Set A geometry and synthetic baseline

|Question|Cubes old → new|Floors|Ladders|Difficulty old → new|Baseline|
|---|---:|---:|---:|---:|---:|
|Q1|10 → 10|1|0|35 → 23|1:34|
|Q2|14 → 13|2|1|43 → 38|2:09|
|Q3|18 → 16|3|2|61 → 53|2:44|
|Q4|24 → 19|3|2|78 → 59|3:06|
|Q5|26 → 21|3|2|83 → 63|3:18|

Q1 removes ladder/extra protrusion and uses one simple bend. Q2–Q4 eliminate distracting extras and reduce route complexity. Q5 retains a seven-step straight, four horizontal turns, two vertical transitions and its existing safe four-cube boost. All shapes are connected, integer, unique, canonical-derived and still ordered by difficulty. Standard and ROUTE 1 geometry are unchanged.

Baseline sum: **12:51**. The v2 Average synthetic model adds 15% hesitation to baseline thinking/traversal/interaction time: **14:47 total**, Q5 **3:48**. A 20% Q5 hesitation sensitivity case is **3:58**. These are assumptions, not observations. Slower profiles exceed these targets; initial-user completion time still needs actual playtesting.

Twelve synthetic profiles recalculated: Novice 390; Careful 703; Average 605; Fast 658; Accurate 809; Memo-heavy 711; No-Memo 585; Route-strong 610; Vertical-weak 484; Expert 864; Fast+Accurate 844; Near-perfect 949.

Score formula, thresholds and labels remain unchanged. Lower geometry difficulty slightly lowers the near-perfect synthetic ceiling (951 → 949). No compensating formula tweak was made. Revised sessions record baseline version `synthetic-a-2` and geometry revision 2.

## Save compatibility and Memo

Old in-progress TEST sessions without geometryRevision retain original geometry and baseline until completion. New TEST sessions use revision 2. Previous results/raw scores are not recalculated or deleted. TEST memo epoch and question ID stay isolated.

The existing memo constructor already starts with one origin; extra cubes came from restored saved notes or explicit dev fixtures, not automatic canonical initialization. New Game previously reused those same storage keys. It now creates a fresh saved `memoRunId` namespace, without deleting the old notes. Continue/Reload and Retry use that namespace. Legacy saves without this optional field still restore original notes. No migration purges authored memo data.

The upper-right full-Memo shortcut was removed along with its update references. Mini Memo still opens Full Memo; Q5 guidance targets Mini.

## Browser observations

On the normal root game, no QA fixture buttons:

- New Game → Mini → Full: `1 / 256`, only START.
- +3: `4 / 256`.
- Reload → Continue → Mini → Full: restored `4 / 256`.
- Upper-right action row has only POV/Look Up/Menu; Mini remains.
- 390×844 normal Gameplay and 844×390 resumed TEST Q2: HUD/Mini do not overlap. The latter has TEST HUD at y78.8–106.8 and Mini x728–824/y84–197.8.
- These were viewport emulation, not physical mobile/touch validation.
- Browser console error log empty in the inspected session.
- Home viewport override reset and Home left open. Existing test Q2 session preserved (not restarted); elapsed time advanced during inspection and it was returned to Home.
- A dedicated new-game memo namespace was created for the normal-game QA and contains the three QA-added cubes; prior notes remain stored untouched. Another New Game begins fresh again.

The available browser API provides single key presses, not held-key duration. A single W did not produce reliable continuous traversal. No hidden game-state injection is counted as normal play. Required normal Q1–Q5 playthrough, Q3 repetitions, Q5 ladders and human timing are therefore still outstanding.

## Final automated verification

`npm test`: **459/459 PASS**, 38 files.

`npm run build`: PASS, 89 modules. Game JS 782.08 kB (gzip 221.31 kB); CSS 51.44 kB (gzip 12.18 kB). Existing >500 kB chunk warning remains.

Coverage includes revised/legacy geometry, answer uniqueness, memo fresh/restore/isolation, shared controller, repeated simulated top exits, Standard/ROUTE, Direct Submission, audio, score and save tests. This does not replace the outstanding browser acceptance checks.

## Required next verification

1. Use a **new TEST session** for reduced geometry; Continue intentionally preserves old runs.
2. Play Q1–Q5 with normal input; record actual clear times including memo/answer.
3. Q3 climb→stop 20 times; side/rear/upper contacts five each; record falls and input sequence.
4. Q5 both ladders: top exit, idle, jump down, contact from all directions.
5. Real mobile touch Mini/Answer/TEST HUD, no overlap and usable controls.

Do not close the Gate as READY before these results are obtained.
