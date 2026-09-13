# CUBE MEMO — Stage 1-1 prototype contract

## Scope / Visual Source of Truth

Only `numericId === 1` exposes CUBE MEMO. No other stage is enabled.
The user-provided white CUBE MEMO mock (`memo-fix-qa/official-mock.png`) is the layout, color and interaction reference. The Home Cube Cross informs the beveled white miniature material. The mock is a QA reference, not a game background or text texture.

## Coordinates

`memo = canonical room coordinate − stage.start`, component by component.
One memo unit represents one room/voxel (six world units in the game).
X/Y/Z are the original stage axes; Y is up. In Stage 1-1, `stage.start = [0,0,0]`, so both coordinate sets coincide. Initial player forward is +X. No normalization, shape rotation, or camera-dependent coordinate transform is applied.

The immutable origin `[0,0,0]` has ID `origin`. START is its 3D label. Orbit only changes the memo camera. Perspective projection is used for picking, never for hint comparison.

Face selection selects the dominant normal axis and sign. A face drag locks this pair until release. +3/+5 extend from the selected cube along that signed axis. An empty stock drop snaps to integer X/Z on the workspace ground; a drop onto a cube adds its outward face neighbor. The ground lowers if a negative-Y cube is added; existing coordinates do not change.

Prototype safety bounds: integer coordinates −24…24 per axis, 256 total cubes including origin, 100 undo snapshots. Duplicate positions and invalid coordinates are rejected. Continuous placement is one undo transaction.

## Hint contract

The existing incorrect-answer branch unlocks the hint only for Stage 1-1. The quiz and two-attempt rules are unchanged. Hint evaluation is exact coordinate membership, not whole-shape matching. Only coordinates already present when the player invokes the hint are recorded as lit. Missing answer positions are never added or displayed. Other cubes render white while retaining their note colors.

`hintUnlocked`, `hintUsed` and the lit-coordinate set are outside edit history. Undo/Redo/Clear cannot refund a consumed hint. Reopening/reloading preserves these values. Adding a previously absent correct cube after the hint does not reveal it. Re-adding a previously lit coordinate retains the known highlight.

Memo persistence uses the existing separate `icube-memo:stage_1_1` key. Progress save and SDK are untouched. Storage exceptions fall back to session memory. Version 1 valid note coordinates/colors are migrated, but its incorrectly unguarded hint flags are not trusted; version 2 stores guarded hint state.

## Input / lifecycle

The modal explicitly overrides inherited `pointer-events: none`. The WebGL canvas is absolutely contained in the central viewport only. Panel buttons do not overlap the canvas. Gameplay input is disabled independently. Memo camera/drag/UI listeners remain active. Close X, footer and Escape resume gameplay; player position, camera and elapsed time are not reset. Visibility/SDK resume checks respect an open memo.

Only one lazily created memo renderer is retained. The stock image is a one-time render of the same rounded geometry and lighting; it is not a CSS square. A small duplicate drag source remains inside the viewport on short mobile landscape screens. Pointer cancellation discards ghosts. Two-finger touch cancels placement and zooms. The memo renders only when dirty; the gameplay render loop skips rendering while memo is active.

## QA interpretation

Browser tests use the real production bundle in Edge via Playwright. The existing game instance is exposed only by the test response interceptor, not shipped in the app. Hint QA uses a documented terminal-position fixture, then real E, choice and submit actions. The comparison miniature is a synthetic, non-answer visual fixture. Neither substitutes for the actual drag/edit tests. Physical mobile devices and the hosted YouTube runtime are not tested.
