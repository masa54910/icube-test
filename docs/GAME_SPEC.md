# i CUBE TEST Web Game Specification

## Product statement

i CUBE TEST is a single-player 3D spatial-memory puzzle. The player explores the inside of a connected voxel structure, infers its exterior shape, and then chooses the matching shape from ten candidates. The full exterior is never exposed before a correct answer.

## Release scope

- 31 problems matching the current Roblox registry
- Three groups: Alphabet Test, Digit Test, Shape Test
- Desktop keyboard/mouse controls
- Touch virtual movement and camera drag
- Responsive portrait, landscape, square, and ultrawide layouts
- LOOK UP camera control
- Explicit ladder state with up/down movement
- Answer point, 10-choice quiz, two attempts
- Incorrect retry, failure, replay, stage select
- Correct glow, reduced-motion-aware flash, exterior reveal, result, next stage
- Local fallback save outside YouTube; Playables cloud save inside YouTube
- English and Japanese UI, chosen from the Playables language API when available

No multiplayer, account, backend, chat, store, user-generated content, ads, or external network services are included.

## Game states

`BOOT → LOADING → TITLE → STAGE_SELECT → EXPLORATION → QUIZ → ANSWER_RESULT → REVEAL → STAGE_RESULT → EXPLORATION | STAGE_SELECT | COMPLETE`

`PAUSED` is an overlay state controlled only by the YouTube Playables SDK callbacks. State-changing input is rejected while paused or during reveal transitions.

## Canonical stage model

```ts
interface StageDefinition {
  id: string;
  numericId: number;
  group: 1 | 2 | 3;
  level: number;
  displayName: string;
  difficulty: number;
  rooms: readonly [number, number, number][];
  start: readonly [number, number, number];
  ladders: readonly { id: string; from: Vec3Tuple; to: Vec3Tuple }[];
  choices?: readonly VoxelShape[];
}
```

Stage geometry, correct answer, and exterior reveal all use the same `rooms` array. This removes the historical risk of exploration geometry disagreeing with the answer.

## World scale

The web port scales one 32-stud Roblox room to 6 world units. A room is a navigable chamber, not a solid cube during exploration. Shared horizontal boundaries are open. Exterior boundaries have opaque white panels. Vertical adjacency creates a hatch and ladder.

The reveal uses the same coordinates rendered as solid, separated white voxels with gray edges.

## Player

- Eye height: 1.65 world units
- Collision radius: 0.34 world units
- Walk speed: 3.0 world units/s, proportional to the Roblox 16-stud/s speed after scale conversion
- Desktop: WASD or arrows; mouse drag or pointer lock for view
- Mobile: left virtual stick; drag the right side to look
- Escape closes the current modal where possible and is never cancelled with `preventDefault()`

The player cannot leave the union of rooms on the current floor. Movement through a shared room boundary is permitted. Vertical movement is only possible while attached to a defined ladder.

## Ladder state

Entering a ladder activation volume exposes context-sensitive UP and DOWN controls. Pressing forward/up or the up button attaches the player to the ladder. While attached, horizontal motion is locked, vertical motion is driven at a fixed speed, and the player exits at a valid connected room level. Jump is not a ladder substitute.

## Camera

- Explore FOV: 70 degrees
- Pitch range: -82 to +82 degrees
- LOOK UP: press-and-hold; snapshot yaw/pitch, blend to +88 degrees, and restore the exact snapshot on release
- Quiz: gameplay camera frozen behind DOM UI
- Reveal: exterior voxel group framed from an elevated three-quarter view

The fidelity revision defaults to third-person with an original procedural humanoid. The HUD or V switches to POV and back. Both modes share movement. Camera rays stop against expanded room-shell colliders. LOOK UP saves and restores mode, yaw, pitch, distance, and FOV without accumulating drift.

## Quiz rules

- Exactly 10 shuffled candidates
- Exactly one correct candidate
- Candidate voxel edges remain visible at small sizes
- Two attempts per run
- First miss: selected card marked wrong and disabled; player may retry or return to exploration
- Second miss: run fails; correct shape is not revealed
- Correct: start cinematic immediately after validation

Alphabet and digit problems use the ten canonical letter/digit shapes as their choice sets. Shape-test problems use deterministic connected decoys generated from the canonical shape.

## Correct sequence

The web cinematic follows the current Roblox timing envelope:

- 0.85 s selected-card glow
- 0.32 s flash in
- transition to exterior reveal under flash
- 0.68 s flash out
- 0.25 s pause
- 0.30 s result-panel fade

When `prefers-reduced-motion` is set, movement is shortened and the flash opacity is limited. Correct/incorrect status uses text, iconography, and borders—not color alone.

## Progress and scoring

Save schema version 1 stores completed stage ids, best milliseconds, best attempts, and last played stage. Locale is not stored because YouTube requires use of its language setting. Save occurs after a clear and on SDK pause. The score sent to YouTube, if available, is total completed problems and matches the save.

## Completion

Clearing problem 3-11 after all earlier problems displays a clear end-of-content message. Stage select and replay remain available.
