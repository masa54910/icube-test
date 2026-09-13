# CUBE MEMO Bottom Safe Area QA

## Root cause

The modal was already scrollable, but its grid footer was the final content row. On short viewports the footer box (including its shadow and border) therefore reached the scroll viewport edge. Root padding alone did not create a visible gap after the final grid row.

## Minimal fix

- Kept the existing modal grid and `overflow: auto` behavior.
- Added a footer breathing area (`padding-bottom`) plus a scroll-end margin.
- Desktop uses 24px content padding / 52px scroll margin.
- Mobile uses 20px content padding / 36px scroll margin.
- Low-height landscape uses 16px content padding / 32px scroll margin.

No CUBE MEMO interaction or rendering logic was changed.

## Browser evidence

- Desktop browser at the local app: footer buttons and borders are fully visible at scroll end; measured 36px between button bottoms and the viewport edge.
- Mobile portrait/landscape and long-language behavior are covered by the responsive media rules (`36px` / `32px` safe margins and `overflow-wrap:anywhere`). Physical-device testing remains user QA.
