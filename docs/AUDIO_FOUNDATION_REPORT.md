# BGM + Sound Effects Minimal Integration

Status: **BLOCKED — APPROVED AUDIO ASSETS REQUIRED**

## Progress closure

1. Existing Audio / SDK Audit — COMPLETE: no approved audio; existing SDK host audio/pause callbacks available.
2. AudioManager Architecture — COMPLETE for empty-slot foundation.
3. BGM Integration — state/slots COMPLETE; audible crossfade/loop tuning BLOCKED.
4. Gameplay SE Integration — event hooks COMPLETE; sound alignment/listening BLOCKED.
5. CUBE MEMO / Answer SE — commit counts and shared verdict hooks COMPLETE; per-cube stagger/pitch tuning BLOCKED.
6. Settings / Pause / Visibility — foundation COMPLETE.
7. Audio Asset / Rights Audit — BLOCKED: all nine files and rights evidence missing.
8. Browser QA + Regression — silent foundation COMPLETE; audible and physical-device QA BLOCKED.

## Implemented

- One shared AudioManager, nine manifest slots, approval/same-origin gating, first trusted pointer/key interaction unlock, nonfatal missing/failing audio.
- Home/Game BGM state, 0.8s outgoing fade, incoming gain ramp, same-state reuse, Correct duck 40%. No approved tracks loaded.
- Jump launch, existing landing-feedback impact strength, actual Boost acceleration and end, Memo committed additions, changed Answer selection, both correct/incorrect sources.
- BGM/SE toggles in Home Menu; nine-language labels; separate optional local preference key. SDK/host mute and tab pause compose rather than overwrite each other.
- Up to eight SE voices; one active and one retiring BGM; bounded 128-event trace. No unlimited timer/event queue.

## Evidence

- Automated: **396 / 396 PASS**, including seven new audio tests. Tests with synthetic API doubles cover BGM reuse, independent toggles, overlapping pause reasons, bounded voices, no unapproved fetch, nonfatal load errors, and placement commit-only emission.
- Production Build PASS. Existing >500kB chunk warning remains.
- Edge/Playwright: actual trusted desktop/touch unlock; settings/reload; Jump and Landing one event each; Boost one event; Memo +3 and overlapping +5 emit actual new counts 3 and 2; Undo/Redo emit none; Direct Incorrect and 10-choice Correct; repeated selection emits once; hidden-tab pause fixture; empty asset slots do not create voices. See [browser record](audio-qa/results.json).
- Scope note: Stage/Boost positioning uses fixture setup; inputs and answer/Memo buttons use browser UI. Host audio playback was validated with API doubles, not a live YouTube host. Physical iOS/Android devices not tested.
- Representative ROUTE, no sound assets: **60.3 fps**, 532 draw calls, JS heap ~25.3MB, 2-second sample. This is not loaded-audio performance approval or a full memory-leak soak test.
- Build JS gzip 206.62 → 209.27kB; CSS gzip 11.33 → 11.41kB: **~2.73kB compressed initial code increase**. Audio assets **0 bytes**. No comparable baseline wall-clock load measurement; `readyMs` is a single browser-run sample, not a proven load-time regression delta.

## Remaining / Stop

All nine approved audio files required: see [rights and required assets](AUDIO_ASSET_RIGHTS.md). No web assets were acquired or generated. No claims of commercial/redistribution/YouTube rights clearance.

After delivery: normalize by listening, align Correct SE peak to existing Flash (~2.65s), time per-cube +3/+5/continuous sound with visual placement, verify LIGHT/NORMAL/STRONG balances, BGM loop/crossfade, 10–15min fatigue test, loaded-audio performance and physical-device QA. Current batch placement remains atomic; count metadata is ready but staggered per-cube SE is not represented as finished.

Stage geometry, physics values, answers, Direct Judge, Hint semantics, progress-save schema, Correct visuals, Home Showcase and Roblox are unchanged. Tests cover the existing Standard 31 and ROUTE 10 data/logic; no claim of manually replaying all 41 stages in this audio foundation pass.
