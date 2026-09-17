# Answer Choices / CUBE MEMO Improvement

## A. Root Causes

- Choice duplication: Standard letter/digit libraries were not deduplicated under proper rotations; procedural Standard distractors used translation-only keys. 22 Standard stages contained equivalent choices. TEST and ROUTE already used proper rotation keys. Current and both historical TEST Q3 sets did **not** reproduce the reported duplicate.
- Color: palette supported the old white/navy/cyan family, not the requested five colors. Hint rendering overwrote user colors (including white for incorrect cubes). The store's color mutation itself worked. User color now remains visible; existing hint outlines indicate correctness.
- Orientation: answer preview was a disabled button with a fixed camera; CSS reduced it to 96px wide / 65px viewport height.
- Comparison: direct submission required exact START-relative XYZ coordinates. Translation and rotations were explicitly rejected.

## B. Duplicate Audit

See ANSWER_CHOICE_ROTATION_AUDIT.md for all 59 sets (31 Standard, 10 ROUTE, 3 archived prototypes, 5 current TEST, 10 historical TEST). All preserve ten choices and exactly one canonical answer. 22 Standard sets repaired; other sets retained. Test output includes duplicate indexes and canonical keys. Indexes are pre-shuffle, one-based.

## C. CUBE MEMO Changes

- Desktop answer preview: up to 280px wide / 210px viewport height; small screens: 150px / 120px, low-height: 150px / 100px.
- Mouse/touch Pointer Events orbit, pointer capture/cancellation, arrow keys, Home reset. View-only coordinates; no model mutation.
- Six palette colors: white/red/yellow/green/blue/orange. White is leftmost and selected by default, per the follow-up request. Nine-language labels. Old saved colors remain supported.
- Protected START cube behavior, add/delete, undo/redo and saved-data format retained.
- Hints retain positional diagnostics and cyan outlines without replacing colored faces.

## D. Shape Matching

- Shared ShapeEquivalence utility: minimum-coordinate normalization, sorted serialization, 24 right-handed bases, minimum key.
- Translation and all proper rotations accepted. Color ignored.
- Chiral reflected shapes rejected. An achiral shape's reflection is necessarily accepted when it is also a proper rotation of the original; reflection transforms themselves are never included.
- Duplicate/non-integer coordinates rejected by answer matching.

## E. Verification

- npm test: 49 files / 621 tests PASS (including white-first/default and six-color persistence).
- npm run build: PASS.
- npm run build:playables: PASS.
- npm run build:crazygames: PASS.
- Existing large-JS-chunk warning remains; no build failure.
- Browser: local Home → Standard → Memo; red placement and green recoloring visually confirmed.
- Browser: white is the leftmost palette button and selected on first open; all six buttons present.
- Browser: existing isolated TEST QA fixture → Q2 answer point → answer UI. Saved F memo restored. Mouse drag visibly changes preview orientation; ordinary choice submission shows 正解！.
- Browser viewport dimensions: 390×844 and 844×390; 150px preview remains inside panel. Not a physical phone test.
- Synthetic mouse and touch Pointer Events tested independently; data unchanged, cancellation stops motion.
- Physical mobile touch, full mobile game-flow QA and the originally reported Q3 screen remain unverified. Do not label these PASS.

## F. Changed Files

- src/game/ShapeEquivalence.ts
- src/game/MemoComparator.ts
- src/game/CubeMemo.ts
- src/stages/stage-utils.ts
- src/stages/route-choices.ts
- src/ui/MiniMemoView.ts
- src/ui/MemoViewport.ts
- src/ui/UIController.ts
- src/ui/mini-memo.css
- src/ui/cube-memo.css
- src/i18n/memo.ts
- tests/choice-audit.test.ts
- tests/shape-equivalence.test.ts
- tests/mini-memo-input.test.ts
- tests/cube-memo.test.ts
- tests/memo-direct.test.ts
- tests/mini-memo.test.ts
- docs/ANSWER_CHOICE_ROTATION_AUDIT.md
- docs/MEMO_IMPROVEMENT_QA.md

## G. Delivery

Local commit only. No push, deploy or platform resubmission. Pre-existing CrazyGames/platform changes excluded from this commit. Submitted artifacts and upload folders untouched.

## H. Gate

Implementation and automated validation PASS. Full acceptance BLOCKED pending original TEST Q3 reproduction evidence and physical mobile/touch QA. Do not claim the reported Q3 defect was reproduced or specifically repaired.
