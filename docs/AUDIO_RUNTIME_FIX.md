# Audio Runtime Playback Failure — 2026-09-13

Status: runtime fix implemented; human listening acceptance PENDING.

## Confirmed root cause

Real browser, unmodified official YouTube SDK: `IN_PLAYABLES_ENV=false`,
`isAudioEnabled()=true`, but `onAudioEnabledChange` immediately delivered `false`.
The wrapper accepted that local/no-op notification as host authority.
AudioManager consequently showed `paused:["host"]`, `hostEnabled:false`,
zero loaded buffers and zero voices even after a trusted click.
Earlier tests that replaced the SDK script with an empty response missed this.

## Minimum fix

- Only subscribe to host audio state inside `IN_PLAYABLES_ENV`.
- Local audio remains governed by the existing BGM/SE preferences.
- Real host mute/unmute remains authoritative and is regression tested.
- Resume after a blocked first unlock now loads buffers before synchronizing BGM.
- No audio assets, mix, gameplay, geometry, save semantics or visual changes.

## Browser evidence (Brave, actual official SDK)

- Native HTMLAudio control accepted playback of the unchanged HOME OGG.
- Trusted click: context running, all 13 slots / 15 files decoded, output connected.
- HOME gain 0.25, actual Continue -> GAMEPLAY gain 0.22.
- Correct BGM diagnostic selection: gain 0.30, one active BGM voice.
- All ten SE test buttons started voices; BGM OFF and SE OFF stopped respective voices.
- Actual Space input emitted JUMP_START followed by FOOT_CONTACT.
- No captured Audio API errors; official SDK local/no-op warning remains expected.
- In-app diagnostic tab crashed during investigation; external browser used thereafter.

These are runtime observations, NOT human listening confirmation.
Full post-fix ladder/boost/memo/answer/correct gameplay traversal, visibility QA,
physical mobile, Windows output-device/mixer and human hearing remain unverified.

## Diagnostics

`/?audioDebug=1` in Vite development provides a DOM panel with context time,
unlock phase, mute reasons, gains, buffer status, recent events, native HOME player
and test buttons for all BGM/SE. The panel is behind import.meta.env.DEV and has
no production console logging. Linked from `/docs/AUDIO_QA.html`.

## Automated verification

- 403 tests PASS (32 files), including three new host/unmute regression cases.
- TypeScript and production Vite build PASS.
- Existing large JS chunk warning remains; no new build error.

## Progress

1. Reproduction / diagnostics: COMPLETE
2. Root cause: COMPLETE
3. Minimum runtime fix: COMPLETE
4. Browser tests: PARTIAL (listed above)
5. Automated regression / build: COMPLETE
6. Human listening acceptance: PENDING
