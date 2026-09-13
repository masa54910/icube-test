# TEST Correct Scene Parity

2026-09-13

Root cause: TEST resultReady called finishTestQuestion, which advanced the session and backToTitle destroyed the CelebrationScene. Q5 began analysis immediately. The issue was not a next-question setTimeout.

Correct judgments now remain pending and persisted until explicit Next / See Results. The existing CelebrationScene, variants, camera, 720-degree/flash presentation, correct BGM and ordinary result-panel are reused. A single-use callback advances once. Q5 starts analysis only on its button. Correct pendingOutcome blocks solve-time accumulation. Reload + Continue rebuilds the saved question and replays its presentation without another judgment or attempt.

No changes to Standard/ROUTE showResult, stage geometry, scoring, audio assets, ladder or answer comparator. Existing incorrect/failure flow remains unchanged.

Browser QA (isolated test save, canonical Memo / terminal-front fixtures, not human solve-time data):
- Q1, Q2, Q4, Q5 direct Memo submissions: correct background retained, question-number modal, explicit next action.
- Q3 ten-choice submission: same retained scene/modal.
- Q2 waited, reloaded, continued: restored Q2 correct scene without re-answer. Solve time retained at 35188.3ms.
- Q5 See Test Results: analysis then CUBE SCORE. No automatic analysis before click.
- Q1 portrait 390x844 and landscape 844x390 inspected; shape/background visible and Next accessible. Physical mobile NOT TESTED.
- Found and fixed an invalid reload state transition during QA; restoration now follows Exploration → Quiz → AnswerResult → Reveal → StageResult, with no new answer judgment.

Tests: existing 500 passed; three added tests cover pending outcomes/time/reload for all five questions, valid restoration transitions, nine-language final CTA. Production build passed. Existing >500kB chunk warning remains.

Audio uses unchanged correct-scene playback and startStage gameplay crossfade. This Gate did not perform a new human listening certification. Correct-scene assets and existing responsive placement unchanged.
