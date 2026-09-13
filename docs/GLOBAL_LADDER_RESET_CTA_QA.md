# Global Ladder Behavior + Test Reset + Home CTA Reorder

2026-09-13 — READY FOR USER QA

## Confirmed causes and fix

Upper grounded contact previously required forward/backward input; without it, attachment waited for falling velocity and the airborne catch path. Five initial-yaw regression cases failed before the change. Top-exit protection was only time-based, and catch yaw was deferred during blending.

The shared PlayerController now accepts upper-floor contact in the existing volume without waiting for a fall, aligns yaw from the ladder rather than the camera, clears vertical/air momentum and holds height unless Down is explicitly pressed. Top exit releases attachment and provides 0.5 seconds of grace plus same-rail contact exclusion until the volume is left. Position/pose entry still uses the existing rail dimensions; there is no extended remote attraction or per-stage fix.

This audit confirmed the entry/re-capture hazards. It did not reproduce every timing variant of the user's original automatic-descent observation before patching; verification below proves the fixed scenarios, not every possible input sequence.

## Ladder verification

- Automated Q3: ten complete climbs followed by five seconds idle; no recapture or descent.
- Browser Q3: 10/10 held-W climbs followed by 1.5 seconds released-input idle. Each lower start was positioned by a dev-only fixture; movement then went through InputController and the live game frame/physics, not a teleport to the top.
- Browser Q3: upper safe-floor fixture, normal Jump input toward the hatch, lower-floor grounded result PASS.
- Automated representatives: three Standard ladder stages; ROUTE1-1/1-5/1-10; TEST Q3/Q5, all their ladders. A coverage assertion requires all eight representatives.
- Five starting yaws plus side/back contact offsets; no-input upper hold; explicit Down; Jump release; outside-volume non-attraction PASS.
- Existing jump-catch, down-climb and top-exit tests remain passing. No jump/gravity/speed/BOOST configuration or geometry changed.

## TEST reset

Secondary action in result details opens a localized confirmation explaining that only TEST score/history/session is cleared. Confirmation calls TestSession.clearResults; the optional TEST namespace is saved empty. Standard/Advanced completion, settings, Audio and regular Memo storage are untouched. Retake still retains results.

Browser used the isolated QA score created in the earlier TEST gate: saved score → details → clear → confirm → Home not measured → reload remains not measured. Ordinary Standard progress remained 2/31. The normal player's TEST save was not erased by the QA exercise.

## Home / languages / responsive

Main order: TEST / New Game / Continue / Stage Select / How To Play. TEST becomes Continue TEST during an active session. Runtime relabeling excludes this separate TEST button from the existing four-row translation pass.

All nine languages checked in-browser. Portrait390×844 and Landscape844×390 use 48px or greater main buttons (some localized descriptions produce approximately51px). Compact button padding/gaps reduce extra scrolling; Home Showcase scene and imagery are unchanged. Desktop ordering verified from actual DOM.

Physical Mobile: NOT TESTED. Viewport checks are emulation. Human unscripted ladder feel remains a User QA check; the browser ladder runs are explicitly fixture-assisted automated input.

## Final engineering evidence

- 451/451 automated tests PASS, 37 files.
- Production build PASS,88 modules; JS780.77kB/gzip221.01kB, CSS51.44kB/gzip12.18kB.
- Existing chunk-size advisory remains, not a build failure.
- Score formula/ranks, TEST/Standard/ROUTE geometry, Memo comparator/editing, answer rules, Audio, BOOST, Home Showcase and SDK unchanged.
- QA helper buttons remain DEV-only and are not production UI.

Progress: all six implementation/verification stages COMPLETE within the stated automated/browser scope.
