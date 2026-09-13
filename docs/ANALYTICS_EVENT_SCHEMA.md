# Event schema

Each event has `eventId` (unique), `eventName`, anonymous/session UUIDs, UTC `occurredAt`, `appVersion`, platform, coarse device class, orientation, language, bounded JSON payload, and `isTest`.

Core names: `session_start`, `session_end`, `game_start`, `stage_start`, `stage_complete`, `stage_abandon`, `answer_attempt`, `hint_used`, `cube_memo_open`, `cube_memo_submit`, `cube_test_start`, `cube_test_question_complete`, `cube_test_complete`. Retries and language changes are optional.
