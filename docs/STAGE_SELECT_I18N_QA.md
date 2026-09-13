# Stage Select i18n Sync + Header Layout

Status: READY FOR USER QA

## Root cause

- Stage Select translated its DOM when opened but did not subscribe to runtime locale changes.
- The background Home language selector remained above the modal and visually overlapped its title.

## Changes

- Subscribe to the existing global document language change, rebuild only the open Stage Select, and preserve selected filter and list scroll position.
- Read the global locale for the modal selector. Keep existing locale persistence.
- Group language selector and Back on the right; wrap on narrow screens. Hide the background Home selector only while Stage Select is visible.
- Preserve stage definitions, stars, completion data and filtering logic. Stage/section proper names remain unchanged.

## Browser verification

- Open-modal switching: ja, en, fr, de, es, pt, ko, zh-CN, zh-TW PASS.
- Title, Back, Standard heading, categories, stage labels and clear/play status update with Home locale.
- Japanese digits filter remains French CHIFFRES after locale change, with 10 matching tiles.
- English persists through close, Home, reload and reopening Stage Select. Restored Japanese after QA.
- Desktop 1280×720: title, selector and Back do not overlap.
- Browser viewport emulation 390×844 and 844×390: French long title and controls do not overlap; list remains scrollable.
- Physical mobile: NOT TESTED.

## Automated verification

- 506 tests / 41 files PASS, including 3 added translation/subscription/header contract tests.
- Production build PASS. Existing large-chunk warning remains (game JS 784.81 kB).
- Automated header checks are source contracts; actual layout was checked separately in the browser.
