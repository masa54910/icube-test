# i CUBE TEST Roblox Audit

Audit date: 2026-09-11 (Asia/Tokyo)

## Scope and source order

The audit treats the current Roblox project at `C:\Users\owner\Documents\Projects\CubeExplorerRoblox` as the source of truth. Historical chat material and the five supplied images are supporting references only.

Evidence priority used:

1. Current Luau source and current working tree
2. Current Git history
3. Current `README.md`
4. Supplied `GPT_HISTORY_ICUBE_TEST.md`
5. Supplied promotional and UI images

The Roblox project was inspected read-only. No source file, place file, Git configuration, commit, or publish state was changed.

## Repository state

- Repository: `CubeExplorerRoblox`
- Branch: `master`
- HEAD: `74e5545 restore point stage1-3 complete 31 puzzles`
- Earlier restore points: `50c40c2`, `e13fc9d`, `c2dcdb6`
- The working tree already contained a large uncommitted edit to `HomeController.client.lua` before this migration began. It is user-owned and was not modified.
- `Place1.rbxl` exists, while Rojo source is the authoritative implementation layer.
- The repository includes `tools/validate_stages.py` and `tools/static_audit.py`. The host had no system Python executable available during discovery, so those original Python scripts could not be executed. Equivalent web-side data validation is included in this port.

## Current game structure

The latest source contains 31 enabled problems, not a single H stage:

| Group | Problems | Content |
|---|---:|---|
| Stage 1 | 1-1 through 1-10 | C, E, F, H, I, L, O, P, T, U voxel letters |
| Stage 2 | 2-1 through 2-10 | Digits 0 through 9 built from seven-segment voxel definitions |
| Stage 3 | 3-1 through 3-11 | H-minus, T, L, 4, E, 5, A, 2, F, G, offset bridge |

The historical “H with the upper-right block missing” stage survives as current problem 3-1 (`stage_3_1`, numeric stage id 21). Its room coordinates contain a five-room left tower, a four-room right tower, and a three-room center bridge.

## Canonical geometry

- Room size: 32 x 32 x 32 Roblox studs.
- Wall thickness: 1 stud.
- Grid spacing: 8 studs.
- Vertical openings use a 13 x 22 stud hatch.
- Horizontal neighboring rooms omit the shared wall.
- Vertical neighboring rooms get matching floor/ceiling hatches.
- Stage origin: `(0, 112, 0)`.
- Player spawn: start room floor plus 4 studs, then `SpawnService` adds 2 studs on character pivot.
- Player movement: Roblox Humanoid defaults are explicitly reset to WalkSpeed 16 and JumpPower 50.
- Ladder implementation: anchored `TrussPart` segments, 2.5 x variable height x 2.5 studs, generated for each adjacent vertical room pair. Current Roblox behavior therefore relies on Roblox Humanoid truss climbing rather than a bespoke ladder script.

## Exploration and camera

- Camera uses Roblox Classic third-person mode, zoom range 7–15 studs, and a 1.5-stud humanoid camera offset.
- LOOK UP is a press-and-hold UI control. It snapshots camera type, subject, CFrame, and root-local camera transform.
- LOOK UP targets a point 120 studs above the player while positioning the camera 4 studs behind and 3.5 studs above the root.
- Blend speed is 10; return duration is 0.2 seconds. On release, the stored local transform is restored before control returns to the Roblox camera.
- Shift-based LOOK UP is absent from the current controller.
- Local-only exploration markers exist in Roblox (`M`, marker type, clear), but they are auxiliary rather than core game rules.

## Answer flow

- The answer point is a non-colliding glass/neon pad with an `E`/touch proximity prompt.
- Opening the quiz anchors the player.
- Exactly 10 choices are shown.
- The server owns correctness, used choices, and remaining chances.
- Maximum attempts: 2.
- First incorrect answer disables the selected choice and allows retry or return to exploration.
- Second incorrect answer ends the attempt without revealing the solution.
- Correct answer locks input, glows the selected card, dims the others, flashes white, reveals the canonical voxel shape, celebrates, and displays the result.

Measured correct-sequence timing from current code:

1. Correct card hold: 0.85 s
2. Flash in: 0.32 s
3. Full-flash dwell: about 0.18 s after tween completion
4. Flash out: 0.68 s
5. Result panel delay: 0.25 s
6. Result fade: 0.30 s
7. Avatar celebration: 0.28 s up + 0.35 s down

Reduced-flash mode limits the flash opacity instead of reaching full white.

## State and persistence

Roblox uses remotes between service modules and UI controllers rather than a single explicit state-machine class. Effective states are home, stage/exploration, answer, incorrect retry, failed, correct reveal, and result.

Saved progress includes schema version, latest problem, completed problem ids, best times, best attempts, total clears, total play time, settings, and achievements. DataStore failures fall back to in-memory data in Studio.

## Visual language

Current source and supplied images agree on:

- White/light-gray rooms and voxels
- Fine gray edge and wall-grid lines
- Dark navy text
- Cyan/blue accent light
- Minimal glow during play; strong glow only at answer/correct moments
- Clean laboratory presentation

The supplied Roblox-character imagery is treated as reference only and is not copied into the web build. The port uses original procedural geometry and UI.

## Conflicts resolved

| Topic | Historical material | Current source | Port decision |
|---|---|---|---|
| Stage count | H-minus emphasized as Stage 1 | 31 problems in three groups | Port all 31 canonical problem definitions |
| H-minus identity | Stage 1 | Current 3-1 / id 21 | Preserve geometry under current identity |
| Stage 1 behavior | Historical fixed H | Current letter problems | Current code wins |
| Camera | Promotional material suggests close interior view | Current Roblox uses Classic third-person | Updated fidelity gate: default third-person with original procedural character, optional POV; LOOK UP restores the prior mode and transform |
| Sharing | Roblox has invites/challenges | Platform-specific functionality | Fidelity QA home includes the requested INVITE FRIENDS row; it explains that Roblox invitations are unavailable and does not invoke sharing |
| Audio | Roblox hooks exist but IDs are blank | Silent current implementation | Web build ships without external audio assets |

## Verification gap

The user-provided Codex in-app browser tab successfully opened the public Roblox game page at `https://www.roblox.com/ja/games/124283162718176/ICube-TEST`. Pressing the play button produced Roblox's account/login modal. No credentials were supplied and no login or age-verification flow was attempted. Native Windows application control is also disabled in this host, so Roblox Studio could not be driven through Start → Exploration → Quiz → Incorrect → Retry → Correct → Result. No claim of hands-on play verification is made. Camera feel, truss-climb feel, mobile Roblox UI polish, and exact runtime rendering remain Checkpoint A items for user comparison.

This gap does not block a web implementation because the current code provides exact geometry, movement constants, answer rules, and cinematic timing. It does prevent declaring pixel/feel parity with the live Roblox client.
