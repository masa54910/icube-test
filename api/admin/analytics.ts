type ApiRequest = { method?: string; headers?: Record<string, string | string[] | undefined>; query?: Record<string, string | string[] | undefined> };
type ApiResponse = { status(code: number): ApiResponse; json(value: unknown): void; setHeader(name: string, value: string): void };
type EventRow = { event_id: string; event_name: string; anonymous_player_id: string; session_id: string; occurred_at: string; payload: Record<string, unknown>; is_test: boolean };

const env = (name: string) => process.env[name] ?? '';
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? '' : value ?? '';
const bearer = (req: ApiRequest) => {
  const value = first(req.headers?.authorization);
  return value.startsWith('Bearer ') ? value.slice(7) : '';
};
const jsonNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : 0;
const median = (values: number[]) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] ?? 0 : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
};
const rangeStart = (range: string) => {
  const now = Date.now();
  if (range === 'today') return new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString();
  if (range === '7d') return new Date(now - 7 * 86400000).toISOString();
  if (range === '30d') return new Date(now - 30 * 86400000).toISOString();
  return '';
};
const rest = async (url: string, key: string, path: string, init: RequestInit = {}) => {
  const response = await fetch(`${url}${path}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, ...(init.headers ?? {}) } });
  if (!response.ok) throw new Error(`Supabase request failed: ${response.status}`);
  return response.json() as Promise<unknown>;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); res.status(405).json({ error: 'method_not_allowed' }); return; }
  const url = env('SUPABASE_URL') || env('VITE_ANALYTICS_URL');
  const anon = env('SUPABASE_ANON_KEY') || env('VITE_ANALYTICS_ANON_KEY');
  const service = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anon || !service) { res.status(503).json({ error: 'analytics_not_configured' }); return; }
  const token = bearer(req);
  if (!token) { res.status(401).json({ error: 'unauthenticated' }); return; }
  let phase = 'auth';
  try {
    const authResponse = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
    if (!authResponse.ok) { res.status(401).json({ error: 'invalid_session' }); return; }
    const user = await authResponse.json() as { id?: string };
    if (!user.id) { res.status(401).json({ error: 'invalid_session' }); return; }
    phase = 'admin_lookup';
    const admins = await rest(url, service, `/rest/v1/admin_users?select=user_id&user_id=eq.${encodeURIComponent(user.id)}&limit=1`) as Array<{ user_id: string }>;
    if (!admins.length) { res.status(403).json({ error: 'forbidden' }); return; }
    const range = first(req.query?.range) || 'all';
    const start = rangeStart(range);
    const filter = start ? `&created_at=gte.${encodeURIComponent(start)}` : '';
    phase = 'events_query';
    const rows = await rest(url, service, `/rest/v1/analytics_events?select=event_id,event_name,anonymous_player_id,session_id,occurred_at,payload,is_test&is_test=eq.false${filter}&order=occurred_at.asc&limit=10000`) as EventRow[];
    const events = Array.isArray(rows) ? rows : [];
    const sessions = new Set(events.filter(e => e.event_name === 'session_start').map(e => e.session_id));
    const players = new Set(events.filter(e => e.event_name === 'session_start').map(e => e.anonymous_player_id));
    const gameStarts = events.filter(e => e.event_name === 'game_start').length;
    const completed = events.filter(e => e.event_name === 'stage_complete');
    const active = events.filter(e => e.event_name === 'session_end').map(e => jsonNumber(e.payload.activePlaySeconds));
    const tests = events.filter(e => e.event_name === 'cube_test_complete');
    const testStarts = events.filter(e => e.event_name === 'cube_test_start').length;
    const scoreValues = tests.map(e => jsonNumber(e.payload.cubeScore)).filter(v => v >= 0 && v <= 1000);
    const stageIds = [...new Set(events.map(e => String(e.payload.stageId ?? '')).filter(Boolean))];
    const stages = stageIds.map(stageId => {
      const starts = events.filter(e => e.event_name === 'stage_start' && e.payload.stageId === stageId);
      const completions = completed.filter(e => e.payload.stageId === stageId);
      const times = completions.map(e => jsonNumber(e.payload.effectivePlaySeconds)).filter(v => v > 0);
      const attempts = completions.map(e => jsonNumber(e.payload.answerAttempts)).filter(v => v >= 0);
      return { stageId, starts: starts.length, uniquePlayers: new Set(starts.map(e => e.anonymous_player_id)).size, completions: completions.length, clearRate: starts.length ? Math.round(completions.length / starts.length * 1000) / 10 : 0, firstTryRate: completions.length ? Math.round(completions.filter(e => e.payload.firstTry === true).length / completions.length * 1000) / 10 : 0, averageTime: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0, medianTime: Math.round(median(times)), averageAttempts: attempts.length ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length * 10) / 10 : 0, hintPercent: completions.length ? Math.round(completions.filter(e => e.payload.hintUsed === true).length / completions.length * 1000) / 10 : 0, memoPercent: completions.length ? Math.round(completions.filter(e => e.payload.memoUsed === true).length / completions.length * 1000) / 10 : 0, abandonRate: starts.length ? Math.round(events.filter(e => e.event_name === 'stage_abandon' && e.payload.stageId === stageId).length / starts.length * 1000) / 10 : 0 };
    });
    const questionComplete = events.filter(e => e.event_name === 'cube_test_question_complete');
    const questionFunnel = [1, 2, 3, 4, 5].map(n => ({ question: n, completes: questionComplete.filter(e => Number(e.payload.questionNumber ?? e.payload.questionIndex) === n).length }));
    const rankDistribution = Object.fromEntries(['S', 'A', 'B', 'C', 'D', 'E'].map(rank => [rank, tests.filter(e => e.payload.rank === rank).length]));
    res.status(200).json({ overview: { players: players.size, sessions: sessions.size, gameStarts, completedStages: completed.length, averageActiveSeconds: active.length ? Math.round(active.reduce((a, b) => a + b, 0) / active.length) : 0, medianActiveSeconds: Math.round(median(active)), totalActiveSeconds: active.reduce((a, b) => a + b, 0), testStarts, testCompletes: tests.length }, stages, cubeTest: { starts: testStarts, completes: tests.length, completionRate: testStarts ? Math.round(tests.length / testStarts * 1000) / 10 : 0, averageScore: scoreValues.length ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) : 0, medianScore: Math.round(median(scoreValues)), averageTotalTime: tests.length ? Math.round(tests.reduce((a, e) => a + jsonNumber(e.payload.totalEffectiveTime), 0) / tests.length) : 0, rankDistribution, questionFunnel } });
  } catch (error) {
    // Keep diagnostics useful without ever logging credentials or response bodies.
    console.error('[admin-analytics] backend failure', { phase, errorType: error instanceof Error ? error.name : 'unknown' });
    res.status(500).json({ error: 'analytics_backend_failure', phase });
  }
}
