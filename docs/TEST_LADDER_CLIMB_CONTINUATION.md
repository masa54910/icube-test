# TEST ladder climb continuation

2026-09-13. Supersedes the floor-height clamp described in LADDER_DISMOUNT_Q2_F_REPORT.md.

Root cause: Standard's column ladders can span several floors, while Q3 has separate short ladders. Additionally, rendered rails extend through the destination room but the shared controller stopped at its floor height.

Shared climb bounds now use the destination room ceiling minus capsule height and clearance. Climbing checks collision; W release holds position and W resumes. No section-specific runtime branch or geometry changes. At or above the destination floor, Jump alone starts the supported same-floor dismount. A higher starting position reduces the dismount arc to avoid the ceiling. Normal jump constants and Camera code are unchanged.

Verification: full existing suite 500/500 passed; strengthened Q3 20-cycle release/resume and dismount test passed (41 targeted tests). Production build passed. Browser fixture runner now crosses floor height, holds 1.5 seconds, resumes W for 0.4 seconds, then jumps and checks same-floor support. This is scripted input in the browser, not physical-device manual QA. Camera continuity and physical-device checks are not newly certified by this change.
