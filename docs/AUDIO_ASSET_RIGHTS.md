# Audio Asset Rights — 2026-09-13

Status: **READY FOR AUDIO SELECTION — ORIGINAL SYNTH AUDIO**

## v2 — Melodic Synth candidates (current, 2026-09-13)

Status: READY FOR AUDIO SELECTION v2. v1 A/B/C are archived, not current candidates.
Generator: `tools/audio/generate.mjs`; masters: `tools/audio/masters-v2`; compressed files and exact seeds/date/parameters: [v2 manifest](audio-v2/manifest.json).
Generated specifically for i CUBE TEST. Third-party audio samples: NONE. No external music service. Existing provenance statement below remains applicable.

| Names | Method / purpose |
|---|---|
| home-D/E/F | 80s melodic phrases / computer sequence / arpeggio, sine-partial plucks and delay |
| gameplay-D/E/F | 112s softer phrases / chirps / arpeggios, same motif vocabulary |
| correct-scene | 24s brighter phrase loop; same original motif |
| se-footstep-A/B/C | .18s filtered noise plus short boot contact resonances |
| se-ladder-climb-A | .28s filtered rustle/contact envelope |
| se-answer-enter-A | .42s confirmation tone then oscillator sweep |
| se-correct-A | 3.3s confirmation, 5 notes during spin, simultaneous shimmer onset 2.63s targeting flash |
| se-incorrect-A | .55s gentle two-note descent |
| se-jump-A / se-land-A / se-boost-A / se-cube-place-A / se-answer-select-A | Original v1 synthesis techniques retained, regenerated with recorded v2 seeds |

All files use the same generator, 2026-09-13 generation date, no third-party samples. License provenance is original offline synthesis, not third-party stock licensing. No Content ID registration performed. Rights metadata is not a guarantee of immunity from false claims.
Runtime QA: explicit DEV `?audioQA=D` (or E/F) loads candidates. Production manifest still has no adopted files. Production does not fetch docs assets. No permanent HOME/GAMEPLAY selection made. SE and Correct Scene are auditionable, pending final mix approval.

See [v2 report](SYNTH_AUDIO_V2_REPORT.md) for measured QA and remaining subjective checks.

## Current direction: original offline synthesis (supersedes research below)

Generated specifically for i CUBE TEST. No third-party music. No third-party audio samples. No external music-generation service, account, license purchase or credit use. Historical free-music and service research below is NOT the current adoption plan.

- Date: 2026-09-13; precise generation timestamp and per-file seeds: [manifest](audio-candidates/manifest.json).
- Generator: `tools/audio/generate.mjs` — original PCM synthesis, sine partials, seeded filtered noise, envelopes, equal-power pan and delay. 48 kHz stereo, 16-bit WAV masters, Vorbis candidates.
- Method reference audited read-only: user's `2026-09-12/i-cube-test/outputs/icube-trailer/scripts/audio-v12.mjs`. Reused design approach (seeded synthesis/WAV output), not the trailer's dramatic score or audio files.
- Masters: `tools/audio/masters/`, outside public/production bundle. Candidates: `docs/audio-candidates/`, not registered in production manifest.
- Reproduction: set `ICUBE_FFMPEG` to an installed FFmpeg binary and run `node tools/audio/generate.mjs` from project. Generator records seeds and parameters; pin Node/FFmpeg versions for bit-identical compressed output.
- Motif: D–A–E–B–F# with open fifth/add9 sonority; sparse glass tones, no drums or dramatic development. No claim of globally unique melody or copyright registration. No Content ID registration performed; third-party false claims cannot be guaranteed absent.
- This is locally authored synthesized output, not a third-party asset license grant. FFmpeg is an encoding tool, not a source of music samples. No audio attribution obligation from external samples is introduced.

| Names | Purpose / generation | Samples |
|---|---|---|
| home-A/B/C | 80s pad, soft pulse, sparse electronic/glass motif; Ambient / beep / motif variants | NONE |
| gameplay-A/B/C | 112s neutral pad, sparse lower motif; quiet / pulse / chirp variants | NONE |
| se-boost-A/B | 1.2s filtered noise and integrated rising oscillator | NONE |
| se-cube-place-A/B | .22s short harmonic snap, distinct pitches | NONE |
| se-correct-A/B | 3.3s ascending notes and shimmer around 2.65s | NONE |
| se-jump-A | .32s soft noise sweep | NONE |
| se-land-A | .48s low tone plus filtered impact | NONE |
| se-answer-select-A | .13s digital tone | NONE |
| se-incorrect-A | .55s soft descending tone | NONE |

Candidate mastering uses common BGM RMS target (-29.63 dBFS), SE target (-18.42 dBFS) with peak cap; this is a numeric comparison aid, NOT a claim of perceptual loudness equality. User listening decides final mix. Periodic pads/wrapped event tails support loop candidates; final decoded-loop listening and 15-minute fatigue QA remain after selection. +5 pitch demo is QA-only. Actual placement synchronization, landing-strength and Correct timing integration remain selection-phase work.

No formal HOME/GAMEPLAY selection made. Existing AudioManager and all nine production slots unchanged. Gameplay, physics, saves, SDK, Home and Roblox untouched.

## Historical research (superseded; no assets adopted)

## Superseding BGM direction — 2026-09-13

Existing free BGM adoption is CANCELLED by the user's latest instruction. Prior candidate tables below are historical research only. HOME and EXPLORATION will instead be newly generated for i CUBE TEST with a shared motif. See [Original BGM production packet](ORIGINAL_BGM_PRODUCTION.md) for official-service comparison, proposed motif and six unsubmitted prompts. No generation occurred; no generated-output rights or metadata are fabricated. Paid/account access requires user action and unresolved rights require clearance. SE may still use separately cleared free assets. All nine manifest slots remain unchanged and unapproved.

## Acquisition research update — 2026-09-13

The user now authorizes free, no-account acquisition after rights clearance. No asset was adopted or downloaded in this pass. Content ID status for the shortlisted BGM remains unverified; CC0 is not evidence of absence from fingerprint databases. Per the requested stop condition, acquisition and integration are paused. Existing manifest and game code are unchanged.

### Official source comparison

| Source | Commercial / game embedding / redistribution | YouTube / Content ID | Attribution / modification | Decision |
|---|---|---|---|---|
| [Kenney](https://kenney.nl/support), [Interface Sounds](https://kenney.nl/assets/interface-sounds) | Official CC0 game assets permit commercial use; CC0 permits distribution | Copyright permission covers audiovisual use; no explicit Content ID status found on inspected pages | Not required / permitted under CC0 | SE source shortlist only; individual sounds not selected or auditioned |
| [OpenGameArt](https://opengameart.org/content/outer-space-loop) | Individual candidate CC0 licenses permit commercial copying and redistribution | YouTube use permitted under CC0 copyright grant; individual Content ID status unverified | Not required / permitted under CC0 | BGM shortlist only; not approved |
| [Pixabay license](https://pixabay.com/service/license-summary/), [FAQ](https://pixabay.com/service/faq/) | Creative incorporation distinguished from prohibited standalone distribution; not an unconditional raw-file redistribution grant | FAQ explicitly notes contributor/distributor Content ID registration | Attribution not required; adaptation allowed subject to terms | Not selected; no asset-specific clearance |
| [Incompetech Content ID FAQ](https://incompetech.com/music/royalty-free/youtube-contentid.html) | Full game license audit not completed after Content ID screening failure | Official FAQ describes pre-registration and attribution-related claims | Attribution and claim-resolution workflow discussed | Excluded for this Gate's low-claim requirement |

CC0 scope and limitations: [Creative Commons official deed](https://creativecommons.org/publicdomain/zero/1.0/). CC0 allows commercial copying, modification and distribution, but does not warrant third-party rights or certify the copyright status of a work. No assertion of zero future claims is made.

### BGM candidate screening (not listening approval)

All entries below are CC0 on their distribution pages. Durations are NOT MEASURED; no files were downloaded. Links provide the source preview/download entry. Descriptions are publisher metadata, not a claim of having auditioned the tracks. Content ID is UNVERIFIED for every entry. Selected: NONE.

| Slot | Candidate / creator | Original file | Loop evidence / preliminary fit |
|---|---|---|---|
| Home | [Outer Space Loop / wipics](https://opengameart.org/content/outer-space-loop) | outer_space.mp3 | Space/synth/loop tags; first rights-confirmation candidate |
| Home | [Heavenly Loop / isaiah658](https://opengameart.org/content/heavenly-loop) | Heavenly Loop.ogg | Author describes seamless dreamy ambient; short-loop fatigue needs listening |
| Home | [Galactic Temple / yd](https://opengameart.org/content/galactic-temple) | GalacticTemple.zip (OGG inside) | Space background; seamless loop not established |
| Gameplay | [Persistence / cinameng, copyright notice James Gargette](https://opengameart.org/content/persistence) | persistence-loopshort.mp3 | Space ambient texture; loop-named version; first rights-confirmation candidate |
| Gameplay | [MindStream / DST](https://opengameart.org/content/mindstream) | DST-MindStream.mp3 | Ambient/chill/loop metadata; techno influence needs fatigue screening |
| Gameplay | [The Insurgent / Eponasoft](https://opengameart.org/content/insurgent) | The_Insurgent.mp3 | Rejected stylistic shortlist: creepy tag conflicts with non-horror direction; loop unverified |

### Progress and required decision

- Source screening performed; complete asset-by-asset legal audit NOT complete.
- Home / Gameplay: three metadata candidates each; duration, preview listening and final selection PENDING.
- SE: Kenney pack shortlisted; seven individual selections PENDING.
- Content ID audit BLOCKED; download, mix, browser listening, physical-device and YouTube-host QA NOT RUN.
- Tests/build NOT rerun in this research-only pass; previous foundation results are historical, not formal-audio verification.
- Added production audio: 0 bytes. No new performance result or feel PASS is claimed.
- Next safe step: obtain creator confirmation for Outer Space Loop and Persistence covering authorship, Content ID registration/distributors, game-bundled redistribution and YouTube Playables use. External messages require user authorization; none sent.

## Existing foundation / unfilled slots

No audio files found in the project (excluding dependencies/build output). No external audio was downloaded, purchased, synthesized or bundled. Audio asset bytes: **0**.

All nine manifest entries have `url: null`, `approved: false`, `rights: null`. Empty/unapproved entries are never fetched. Supplying a file alone does not mark its rights approved.

| File / slot | Purpose | Loop | Target duration | Rights |
|---|---|---|---|---|
| bgm-home / homeBgm | Quiet space/ambient Home | Yes | 60–180 s | Not supplied |
| bgm-gameplay / gameplayBgm | Low-distraction exploration | Yes | 90–240 s | Not supplied |
| se-jump / jump | Short soft takeoff | No | 0.1–0.4 s | Not supplied |
| se-land / land | Foot contact; volume/pitch variants | No | 0.1–0.5 s | Not supplied |
| se-boost / boost | Short futuristic whoosh | No | 0.5–1.5 s | Not supplied |
| se-cube-place / cubePlace | Ceramic/mechanical snap | No | 0.05–0.25 s | Not supplied |
| se-answer-select / answerSelect | Quiet selection tick | No | 0.05–0.2 s | Not supplied |
| se-correct / correct | Shimmer/resolve, peak near flash | No | 1–3 s | Not supplied |
| se-incorrect / incorrect | Soft low digital tone | No | 0.2–0.6 s | Not supplied |

For **each** supplied file include Source, Creator/Service, License text or evidence, Commercial Use permission, Game Redistribution permission, YouTube use permission, and Attribution requirement/text. These are all **unverified**, not approved, for every slot above.

Use compressed MP3/OGG for BGM, WAV/OGG/MP3 for short SE. Do not supply long uncompressed BGM WAV for shipping. Approval records go into `src/audio/manifest.ts`; assets must be same-origin bundled files, not external runtime URLs.

## Required next pass

Import → rights review → manifest approval → measured normalization → event/peak alignment → browser listening → physical-device QA. Gameplay BGM fatigue/loop test: 10–15 minutes. No audible-quality or mobile-device approval is claimed in this Gate.

## Event mapping and current limits

| Event | Hook | Slot |
|---|---|---|
| JUMP_START | Actual launchJump, not held key frames | jump |
| FOOT_CONTACT | Existing landing-feedback transition, impact strength | land |
| BOOST_START | First actual acceleration frame; invalid-direction entry does not fire | boost |
| BOOST end | Explicit stop; stage/Home also clears SE | — |
| MEMO_CUBE_COMMIT | Committed addBatch only, actual committed count | cubePlace |
| ANSWER_SELECT | Different selected 10-choice candidate | answerSelect |
| ANSWER_CORRECT | Shared beginCorrectReveal for both answer sources | correct |
| ANSWER_INCORRECT | Accepted incorrect attempt in either source | incorrect |

Undo/Redo/color/delete and Ghost do not emit placement events. The current batch API commits all cubes atomically. The foundation records each batch's count and emits **one provisional sound trigger per commit**, not staggered per-cube playback. Temporal +3/+5 sound/presentation alignment and pitch variation are intentionally **pending approved assets**, without changing Memo editing semantics in this pass.

## Lifecycle / resource design

One lazily unlocked AudioContext; BGM state HOME/GAMEPLAY/NONE. At most one active track plus one fading track; up to eight effect voices, bounded 128-event diagnostic history. Same gameplay state does not restart a track. Correct requests 40% BGM duck. SDK pause, host audio mute and hidden-tab reasons are independent. Effects stop on pause and are not replayed on resume. Settings use `icube-audio-preferences`, not progress save.

No active audio is available to judge crossfade, loop seams, final levels, loaded-audio FPS or heap. Tests use non-audible API doubles, not license-cleared audio.
# Final production adoption — 2026-09-13

This section supersedes earlier candidate-only and external-service research statuses below.

- Production method: original programmatic synthesis using `tools/audio/generate.mjs`.
- Third-party music: NONE. Third-party samples: NONE. No external music service used.
- Selected HOME: F (melody plus short arpeggio). Selected GAMEPLAY: D (least decorative, spaced melodic sequence). Correct Scene: existing original version adopted.
- Production preparation: `tools/audio/prepare-production.mjs`; complete per-file source IDs, seeds, byte counts and SHA-256 are in `AUDIO_PRODUCTION_MANIFEST.json`.
- Generated masters remain in development tooling; only 15 selected OGG files ship under `public/assets/audio/` (2,032,107 bytes).
- No third-party attribution or sample redistribution restrictions apply to this synthesis pipeline. This records source provenance, not a guarantee of copyright exclusivity or immunity from erroneous automated Content ID claims.
- No Content ID registration was performed. No account, purchase, subscription or third-party download was used.
- Approval basis: user's Final Audio Selection + Full Integration instruction authorizes Codex to choose and adopt these original files.
- Auditory preference/fatigue and physical-device certification are distinct from signal measurements and browser playback tests.
