# Roblox to Web Migration Map

| Roblox source | Meaning | Web implementation |
|---|---|---|
| `GameConfig.lua` | Shared constants, colors, room/ladder/camera values | `src/config.ts` |
| `StageRegistry.lua` | Ordered 31-problem catalog | `src/stages/stage-data.ts` |
| `AlphabetDefinitions.lua` | Letter voxel coordinates and ten fixed choices | `src/stages/stage-data.ts` |
| `DigitDefinitions.lua` | Seven-segment voxel coordinates and ten fixed choices | `src/stages/stage-data.ts` |
| `Stage03_*.lua` | Eleven shape-test definitions | `src/stages/stage-data.ts` |
| `VoxelUtil.lua` | Normalization, connectivity, reachability | `src/stages/stage-utils.ts` |
| `AnswerChoiceUtil.lua` | Correct-shape derivation, decoy generation, shuffle | `src/stages/stage-utils.ts` |
| `StageBuilder.lua` | Room shells, openings, ladders, spawn, answer pad | `src/game/WorldBuilder.ts` |
| `SpawnService.lua` | Spawn transform and movement constants | `src/game/PlayerController.ts` |
| Roblox Humanoid/truss | Walk, collision, climb | `src/game/PlayerController.ts` explicit NORMAL/LADDER states |
| `CameraController.client.lua` | Gameplay camera and LOOK UP snapshot/restore | `src/game/CameraController.ts` |
| `AnswerPointService.lua` | Nearby prompt and player lock | `src/game/Game.ts`, `src/ui/UIController.ts` |
| `AnswerService.lua` | Two-attempt authoritative answer state | `src/game/Game.ts` local state machine |
| `AnswerController.client.lua` | Choice grid, wrong/correct UI, reveal cinematic | `src/ui/UIController.ts`, `src/game/Game.ts` |
| `HUDController.client.lua` | Stage/time/menu HUD | `src/ui/UIController.ts` |
| `PlayerDataService.lua` | Persistent progress and best records | `src/platform/PlayablesSDK.ts`, `src/game/SaveData.ts` |
| `SoundController.client.lua` | Event hooks with blank asset IDs | No shipped audio assets; platform audio state remains wired |
| Roblox remotes | Client/server state events | Typed local events and explicit state machine |
| Roblox DataStore | Server persistence | `ytgame.game.loadData/saveData` in Playables; localStorage only outside Playables |
| Roblox SocialService invites | Friend challenge prompts | Omitted: in-game sharing prompts are disallowed by Playables requirements |
| Roblox character celebration | Jump and raised arms | Original procedural celebratory light/voxel animation; no Roblox avatar asset |

## Intentional platform adaptations

- Default third-person uses an original procedural humanoid. POV is available through the HUD or V. InputController, PlayerController, Character, and CameraController are separated; both modes share movement and collision.
- HTML/CSS/Canvas UI replaces ScreenGui and ViewportFrame.
- Physics is deterministic kinematic collision rather than a general-purpose rigid-body engine.
- No external asset fetches, analytics, ads, sharing, or backend calls.
- Playables pause/resume callbacks are the only lifecycle visibility mechanism.
