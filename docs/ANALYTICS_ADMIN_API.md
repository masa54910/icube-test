# Admin analytics API contract

`GET /api/admin/analytics?range=today|7d|30d|all` is a server-side, authenticated endpoint consumed by `public/admin/analytics/index.html`.

The endpoint must query the dedicated Supabase project with a server-held key, filter `is_test = false`, apply the UTC date range, and return:

```json
{
  "overview": {"players": 0, "sessions": 0, "gameStarts": 0, "completedStages": 0, "averageActiveSeconds": 0, "medianActiveSeconds": 0, "totalActiveSeconds": 0, "testStarts": 0, "testCompletes": 0},
  "stages": [{"stageId":"1-1","starts":0,"completions":0,"clearRate":0,"averageSeconds":0,"hintPercent":0}]
}
```

Require Supabase Auth (or equivalent server-side admin authorization) before querying. Do not proxy arbitrary table names, accept client-supplied SQL, or expose a service-role key. Return `401` for unauthenticated requests and `503` when analytics is not configured.
