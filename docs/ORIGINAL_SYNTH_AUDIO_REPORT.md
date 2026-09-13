# Original Synth BGM + SE Production

Status: READY FOR AUDIO SELECTION

## Progress

1. Trailer method audit COMPLETE — original v1.2 PCM generator inspected; no trailer audio imported.
2. Generator COMPLETE — seeded offline PCM and Vorbis encoding; no external samples.
3. HOME COMPLETE — A/B/C, 80 seconds each.
4. GAMEPLAY COMPLETE — A/B/C, 112 seconds each.
5. SE COMPLETE — seven categories, ten candidates; Boost/Cube Place/Correct each A/B.
6. QA page COMPLETE — 16 browser playback checks, no page errors; desktop and 390px layout checked.
7. USER AUDIO SELECTION PENDING — no final asset chosen.
8. Final loop/mix/integration PENDING — deliberately deferred until selection.

## Verification and limitations

- 396 existing tests PASS. No runtime game source files changed.
- Candidates total 6,542,265 bytes (~6.24 MiB); WAV masters remain tools/audio/masters, not public. Candidate audio is under docs, outside production assets.
- Browser report: [results](audio-candidates/browser-qa.json). Playback state/progression and decode were tested, not a substitute for subjective listening.
- Mobile check is desktop browser resized to 390px, NOT PHYSICAL DEVICE TESTED. Actual touch unlock remains final integration QA.
- User review must assess perceived loudness, fatigue, beep density, loop smoothness and identity. No 15-minute fatigue PASS is claimed.
- Periodic pad oscillators and wrapped tails avoid abrupt pad restarts; OGG decoded seam and three full loops require final listening. RMS normalization is not equivalent to perceptual loudness matching.
- Correct candidates include a late shimmer targeting the existing 2.65s flash; actual visual/SE synchronization is not yet integrated or verified.
- Existing AudioManager remains unchanged and unapproved production slots remain silent. QA uses file playback, not a replacement game audio system.

## Select

HOME: A ambient / B more beeps / C clearer motif.
GAMEPLAY: A very quiet / B subtle pulse / C more chirps.
BOOST, CUBE PLACE, CORRECT: choose A or B; other effects have one option.

[Open selection page](AUDIO_QA.html). Rights/methods in [AUDIO_ASSET_RIGHTS](AUDIO_ASSET_RIGHTS.md). Reproduction parameters in [manifest](audio-candidates/manifest.json).
