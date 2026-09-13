# Synth Audio v2 — Melodic BGM + Gameplay SE Expansion

Status: READY FOR AUDIO SELECTION v2

## Progress closure

1 Existing mix/code audit COMPLETE. 2 Generator v2 COMPLETE. 3 HOME D/E/F COMPLETE. 4 GAMEPLAY D/E/F COMPLETE. 5 Movement samples/hooks COMPLETE. 6 Answer/Correct samples/hooks COMPLETE. 7 Correct Scene BGM COMPLETE. 8 Candidate playback and targeted browser event QA COMPLETE; full perceptual sync/fatigue QA remains below.

## Changes

Old pad fundamentals included D3 and dominated long gaps. v2 removes those low-mid pad fundamentals, uses only A4/E5/F#5 at .0007 source amplitude (old .008–.011), and foregrounds short phrases at 1.25s HOME / 1.65s Gameplay intervals. Final RMS target remains -29.63 dBFS, so master volume is not increased. This is a source mix audit, not a measured listener preference or spectral-A/B certification.
Six phrase variants derive from D–A–E–B–F#, with partial/reordered/octave forms. No drums, ominous bass or dramatic development. D is melodic, E adds answering chirps, F adds short arpeggios.

Footstep events originate from the actual procedural animation phase at alternating stance-extension points. Not a movement-key timer. Stop/airborne/landing suppressed. Game guard suppresses ladder top assist; Boost reduces footstep gain. Variation uses three pitch offsets. Current active renderer is procedural; future GLB requires its own contact markers (not falsely driven by fallback phase).
Ladder events use the same climb phase and stop when movement stops. E sound occurs only after an accepted Answer Point entry, not a Memo confirmation. Correct Scene BGM switches once when sceneReady is reached; Result keeps it, existing stage/Home transitions crossfade onward. No game physics/camera/quiz/scene visual rules changed.

## QA

- 399 automated tests PASS (396 prior plus contact cadence/stop tests and Correct Scene BGM reuse).
- Production build PASS; game JS 744.93 kB / gzip 209.60 kB. Existing >500kB warning remains. Candidate audio not shipped in dist.
- 19 individual browser audio files decoded and progressed; no page errors. Desktop screenshot and 390px overflow check PASS.
- Actual keyboard movement: forward, turn, stop, restart -> contact events; stopped and Full Memo -> no step events.
- Actual E entry -> one answerEnter; selected Correct -> Correct Scene BGM state, Result reached.
- ROUTE 1-1 ladder QA uses fixture positioning at ladder base, then actual W/S: up, stop, restart, down, top exit -> event assertions PASS. This is not a full route playthrough. [Ladder trace](audio-v2/ladder-qa.json).
- [Browser trace](audio-v2/browser.json) retains first-pass pending ladder note; separate ladder trace supersedes that note only.
- AudioManager production remains silent until formal selection; explicit development links audition all hooks with D/E/F sets. QA choice is not saved. No external audio or samples.

## Remaining (not claimed PASS)

- User selection of HOME and Gameplay, plus Correct Scene approval.
- Perceptual 15-minute fatigue test, physical mobile/touch device test, headphone mix judgement.
- Frame/audio waveform measurement of flash peak and visual foot-contact alignment (current tests verify phase-derived events, not audiovisual perception).
- Full v2 mixed-answer Incorrect/Direct Memo, Boost combined listening and transition stress tests before final adoption.
- Final decoded loop seam mastering, final rights/adoption manifest, preload/memory/FPS comparison after selection.

User selection is the Phase 1 stop. No final BGM is adopted by the agent.
