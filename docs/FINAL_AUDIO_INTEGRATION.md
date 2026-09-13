# Final Audio Selection + Full Integration

## Selection

- HOME F: melodic sequence with short arpeggio embellishments; more inviting than the sparse D arrangement and less chirp-led than E.
- GAMEPLAY D: retains short melodic phrases but omits the extra E/F ornaments, leaving more room for concentration and SE.
- Correct Scene: adopt the existing bright 24-second original motif arrangement.
- These choices are based on composition and signal audit. They are not a claim of verified subjective listening.

## Production

15 OGG assets / 2,032,107 bytes. HOME 80 seconds, GAMEPLAY 112 seconds, reward 24 seconds. Source WAV and rejected candidates are outside `public` and the production build.

`tools/audio/generate.mjs` preserves the synthesis method; `prepare-production.mjs` preserves selection, source IDs, seeds and hashes in `AUDIO_PRODUCTION_MANIFEST.json`. Third-party music and samples: NONE.

Production manifest is enabled without a QA query string. No gameplay, geometry, physics, answer or save semantics were changed in this gate.

Footstep A/B/C alternate; contact pitch changes subtly. Existing animation contact callbacks remain the timing source. Memo batches schedule up to five short notes, with pitches 1.00–1.10; a larger atomic editing batch is coalesced into this bounded flourish, not a separate audio event for every cube. Undo/redo do not emit placement events. Scheduled notes are stopped on pause/SE-off/stage change.

Output protection is linear below 0.8 and softly limits above it. Eight simultaneous BOOST voices measured a maximum 0.931. This safety test is deliberately louder than normal gameplay. Correct audio's source peak is at 2.6507 seconds, matching the existing approximately 2.65-second Flash timing.

## Objective browser verification

- `AUDIO_PRODUCTION_FLOW.json`: ten direct correct sequences across Standard 1/16/31 and ROUTE 1/5/10; direct incorrect returns to memo; shared-attempt terminal correct; actual BGM graph signal detected.
- `AUDIO_MOVEMENT_QA.json`: ladder ascent, stop, descent, top-exit silence; BOOST one-shot and tail stop on ROUTE 3/6/9/10.
- `AUDIO_SYSTEM_QA.json`: portrait/landscape touch unlock, footstep, touch terminal, memo, toggles, reload and stacked pause reasons.
- `AUDIO_FINAL_CHECKS.json`: actual settings DOM, mobile BOOST/direct correct, Correct→Home, missing-audio nonfatal, 15-file preview layout.
- `AUDIO_PERFORMANCE.json`: desktop headless Edge audio on/off approximately 60fps; initial navigation 548ms with zero audio requests before interaction; decoded PCM 85,792,256 bytes. This is an audio-toggle comparison, not a historical-build benchmark. Heap samples include garbage collection variability.
- `AUDIO_SIGNAL_AUDIT.json`: source peak/RMS/low-band/seam measurements. A seam delta alone does not establish subjective seamlessness.

## Final test results

- Full regression: 400 / 400 tests PASS (31 files).
- Production build: PASS. Total `dist`: 4,431,273 bytes. Main game JS: 746.48 kB (gzip 210.12 kB); pre-integration v2 JS was 744.93 kB.
- HOME real-time playback: at least 5 minutes. GAMEPLAY real-time playback: at least 15 minutes, including Standard, ROUTE and Full Memo. All snapshots maintain one BGM voice; browser errors: zero.
- Walking: 125.7 seconds, 296 contact cycles, stop silence PASS.
- These endurance runs validate continuity and bounded voice state, not subjective fatigue or physical speaker output.

## Limits / outstanding acceptance

- Physical mobile and actual YouTube host: NOT TESTED.
- Actual headed Edge tab switching PASS (`AUDIO_REAL_VISIBILITY.json`). A dedicated default-context CDP connection with `noDefaults: true` disables Playwright's focus emulation. Background tab becomes genuinely hidden, AudioContext suspends and its clock stops; foreground restores running state with exactly one BGM voice. No document visibility property was mocked.
- Playback endurance is logged separately in `AUDIO_ENDURANCE.json` and `AUDIO_WALK_ENDURANCE.json` when those real-time runs finish.
- Subjective fatigue, perceived loop seamlessness, pleasantness and mix preference have NOT been verified by listening. Headless playback and waveform measurements cannot substitute for them. Do not treat this document as full acceptance or mark all feel criteria PASS.
- The existing bundle-size warning above 500kB remains.

Preview: `/docs/AUDIO_PRODUCTION_QA.html`. Existing `/docs/AUDIO_QA.html` links to it and retains the candidate archive for reference.
