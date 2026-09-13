# YouTube Playables Requirements Baseline

Checked: 2026-09-11 against the English official documentation.

Primary sources:

- [Getting started](https://developers.google.com/youtube/gaming/playables/reference/getting_started?hl=en)
- [SDK reference](https://developers.google.com/youtube/gaming/playables/reference/sdk?hl=en)
- [Integration requirements](https://developers.google.com/youtube/gaming/playables/certification/requirements_integration)
- [Stability and performance](https://developers.google.com/youtube/gaming/playables/certification/requirements_stability)
- [Design requirements](https://developers.google.com/youtube/gaming/playables/certification/requirements_design)
- [Privacy and data](https://developers.google.com/youtube/gaming/playables/certification/requirements_privacydata)
- [Accessibility](https://developers.google.com/youtube/gaming/playables/certification/requirements_accessibility?hl=en)
- [Certification overview](https://developers.google.com/youtube/gaming/playables/certification/requirements?hl=en)
- [Revision history](https://developers.google.com/youtube/gaming/playables/certification/revisionhistory)

## Implemented requirements

- Root `index.html` loads `https://www.youtube.com/game_api/v1` before game code.
- `firstFrameReady()` is called after the first rendered loading/title frame.
- `gameReady()` is called only after save/language initialization completes and the title UI is interactable.
- Environment detection checks both `ytgame` and `ytgame.IN_PLAYABLES_ENV`.
- Cloud `loadData()` is awaited before any cloud `saveData()`.
- Material progress is saved after stage clear and on pause.
- Save schema is versioned and migration-safe.
- `isAudioEnabled()` and `onAudioEnabledChange()` are integrated even though the release has no audio assets.
- `onPause()` stops input, timers, animation updates, and WebGL rendering; `onResume()` restarts one loop only.
- No Page Visibility API is used.
- No external calls other than the official Playables SDK script.
- The game is a single-page application.
- All bundle references are relative (`base: './'`).
- Output file names use only alphanumeric characters, `_`, `-`, and `.`.
- Touch and mouse cover every interaction; keyboard is additionally supported.
- Resize preserves state; orientation is never locked.
- Escape is not cancelled.
- UI is responsive across narrow portrait through ultrawide aspect ratios.
- The final problem has an explicit end-of-content state.
- No in-game exit, external links, login UI, sharing prompt, QR code, or personal-data collection.
- Code is minified by Vite but not obfuscated.
- Procedural visuals keep the initial and total bundle small.

## Certification budgets

| Metric | Requirement | Project target |
|---|---:|---:|
| Initial bundle | MUST < 30 MiB; SHOULD < 15 MiB | < 1 MiB raw where practical |
| Total bundle | MUST < 250 MiB | < 2 MiB |
| Individual file | MUST < 30 MiB; SHOULD < 512 KiB | split chunks if needed |
| Save data | MUST < 3 MiB; SHOULD < 500 KiB | < 32 KiB |
| Load to interaction | SHOULD < 5 s | < 2 s on normal desktop connection |
| Peak JS heap | MUST < 512 MiB | < 128 MiB target |
| File count | MUST <= 8000 | < 30 |

## External certification gates

The following cannot be truthfully completed by a local build alone:

- Hosted Playables SDK Test Suite pass in the developer environment
- Developer Portal bundle ingestion/analyzer result
- Android YouTube app device pass
- iOS YouTube app device pass
- Publisher/developer metadata and accessibility tag submission
- YouTube/partner review and certification decision

These remain Checkpoint B/C actions and are listed in `CERTIFICATION_CHECKLIST.md`.

