type ApiRequest = { method?: string; headers?: Record<string, string | string[] | undefined>; query?: Record<string, string | string[] | undefined> };
type ApiResponse = { status(code: number): ApiResponse; json(value: unknown): void; setHeader(name: string, value: string): void };
type EventRow = { event_id: string; event_name: string; anonymous_player_id: string; session_id: string; occurred_at: string; payload: Record<string, unknown>; is_test: boolean };
type FeedbackRow = { created_at:string; rating_usability:number; difficulty:string; rating_fun:number; rating_cube_memo:number|null; cube_memo_unused:boolean; rating_replay:number; comment:string|null; traffic_source:string|null };
import { aggregateCubeTestFunnel } from '../../src/lib/admin/funnel';

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
class SupabaseRestError extends Error {
  constructor(public status: number, public bodyKeys: string[]) { super(`Supabase request failed: ${status}`); }
}
const rest = async (url: string, key: string, path: string, init: RequestInit = {}) => {
  // Secret keys are not JWTs: use them only as the PostgREST apikey.
  // No incoming user token (and no Secret Key) is forwarded as Authorization.
  const response = await fetch(`${url}${path}`, { ...init, headers: { ...(init.headers ?? {}), apikey: key } });
  if (!response.ok) {
    let bodyKeys: string[] = [];
    try { const body = await response.clone().json() as Record<string, unknown>; bodyKeys = Object.keys(body).slice(0, 8); } catch { /* non-JSON response */ }
    throw new SupabaseRestError(response.status, bodyKeys);
  }
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
    const projectRef = url.match(/^https?:\/\/([^.]+)\.supabase\.co/i)?.[1] ?? 'unknown';
    console.info('[admin-analytics] config', {
      projectRef,
      servicePresent: Boolean(service),
      serviceLength: service.length,
      servicePrefixValid: service.startsWith('sb_secret_'),
      anonPresent: Boolean(anon),
      adminAuthHeaderSource: 'service_key',
      incomingTokenForwardedToAdmin: false,
    });
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
    const feedbackRows = await rest(url, service, `/rest/v1/beta_feedback?select=created_at,rating_usability,difficulty,rating_fun,rating_cube_memo,cube_memo_unused,rating_replay,comment,traffic_source&is_test=eq.false${filter}&order=created_at.desc&limit=10000`) as FeedbackRow[];
    const contactRows = await rest(url, service, `/rest/v1/beta_feedback_contacts?select=id,marketing_consent&created_at=gte.${encodeURIComponent(start || '1970-01-01T00:00:00.000Z')}&limit=10000`) as Array<{id:string;marketing_consent:boolean}>;
    const events = Array.isArray(rows) ? rows : [];
    const sessions = new Set(events.filter(e => e.event_name === 'session_start').map(e => e.session_id));
    const players = new Set(events.filter(e => e.event_name === 'session_start').map(e => e.anonymous_player_id));
    const gameStarts = events.filter(e => e.event_name === 'game_start').length;
    const completed = events.filter(e => e.event_name === 'stage_complete');
    const active = events.filter(e => e.event_name === 'session_end').map(e => jsonNumber(e.payload.activePlaySeconds));
    const tests = events.filter(e => e.event_name === 'cube_test_complete');
    const testStarts = new Set(events.filter(e => e.event_name === 'cube_test_start').map(e => e.anonymous_player_id)).size;
    const testCompletes = new Set(tests.map(e => e.anonymous_player_id)).size;
    const scoreValues = tests.map(e => jsonNumber(e.payload.cubeScore)).filter(v => v >= 0 && v <= 1000);
    const sessionStarts = events.filter(e => e.event_name === 'session_start');
    const trafficSources = [...new Set(sessionStarts.map(e => String(e.payload.trafficSource || 'direct')))].map(source => {
      const sourceSessions = new Set(sessionStarts.filter(e => String(e.payload.trafficSource || 'direct') === source).map(e => e.session_id));
      const sourceEvents = events.filter(e => sourceSessions.has(e.session_id));
      const starts = new Set(sourceEvents.filter(e => e.event_name === 'game_start').map(e => e.session_id));
      const testStartSessions = new Set(sourceEvents.filter(e => e.event_name === 'cube_test_start').map(e => e.session_id));
      const testCompleteSessions = new Set(sourceEvents.filter(e => e.event_name === 'cube_test_complete').map(e => e.session_id));
      const activeSeconds = sourceEvents.filter(e => e.event_name === 'session_end').map(e => jsonNumber(e.payload.activePlaySeconds)).filter(v => v >= 0);
      return { source, players: new Set(sessionStarts.filter(e => String(e.payload.trafficSource || 'direct') === source).map(e => e.anonymous_player_id)).size, sessions: sourceSessions.size, gameStarts: starts.size, gameStartRate: sourceSessions.size ? Math.round(starts.size / sourceSessions.size * 1000) / 10 : 0, cubeTestStarts: testStartSessions.size, cubeTestCompletes: testCompleteSessions.size, cubeTestCompletionRate: testStartSessions.size ? Math.round(testCompleteSessions.size / testStartSessions.size * 1000) / 10 : 0, avgActiveSeconds: activeSeconds.length ? Math.round(activeSeconds.reduce((a, b) => a + b, 0) / activeSeconds.length) : 0 };
    }).sort((a, b) => b.sessions - a.sessions);
    const stageIds = [...new Set(events.map(e => String(e.payload.stageId ?? '')).filter(Boolean))];
    const stages = stageIds.map(stageId => {
      const starts = events.filter(e => e.event_name === 'stage_start' && e.payload.stageId === stageId);
      const completions = completed.filter(e => e.payload.stageId === stageId);
      const explicitAbandons = events.filter(e => e.event_name === 'stage_abandon' && e.payload.stageId === stageId);
      const abandons = Math.max(explicitAbandons.length, starts.length - completions.length);
      const abandonTimes = explicitAbandons.map(e => jsonNumber(e.payload.effectivePlaySecondsAtAbandon ?? e.payload.effectivePlaySeconds)).filter(v => v >= 0);
      const times = completions.map(e => jsonNumber(e.payload.effectivePlaySeconds)).filter(v => v > 0);
      const attempts = completions.map(e => jsonNumber(e.payload.answerAttempts)).filter(v => v >= 0);
      return { stageId, starts: starts.length, uniquePlayers: new Set(starts.map(e => e.anonymous_player_id)).size, completions: completions.length, abandons, clearRate: starts.length ? Math.round(completions.length / starts.length * 1000) / 10 : 0, firstTryRate: completions.length ? Math.round(completions.filter(e => e.payload.firstTry === true).length / completions.length * 1000) / 10 : 0, averageTime: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0, medianTime: Math.round(median(times)), averageAttempts: attempts.length ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length * 10) / 10 : 0, hintPercent: completions.length ? Math.round(completions.filter(e => e.payload.hintUsed === true).length / completions.length * 1000) / 10 : 0, memoPercent: completions.length ? Math.round(completions.filter(e => e.payload.memoUsed === true).length / completions.length * 1000) / 10 : 0, abandonRate: starts.length ? Math.round(abandons / starts.length * 1000) / 10 : 0, averageAbandonTime: abandonTimes.length ? Math.round(abandonTimes.reduce((a, b) => a + b, 0) / abandonTimes.length) : 0, medianAbandonTime: Math.round(median(abandonTimes)) };
    });
    const funnel = aggregateCubeTestFunnel(events);
    const questionFunnel = funnel.questionFunnel;
    const funnelSteps = [{ step: 'start', count: funnel.starts }, ...questionFunnel.map(q => ({ step: `q${q.question}`, count: q.completes })), { step: 'complete', count: funnel.completes }];
    const stepDropOff = funnelSteps.slice(1).map((current, index) => { const previous = funnelSteps[index]?.count ?? 0; return { from: funnelSteps[index]?.step ?? 'start', to: current.step, count: Math.max(0, previous - current.count), rate: previous ? Math.round((previous - current.count) / previous * 1000) / 10 : 0 }; });
    const rankDistribution = Object.fromEntries(['S', 'A', 'B', 'C', 'D', 'E'].map(rank => [rank, tests.filter(e => e.payload.rank === rank).length]));
    const feedback = Array.isArray(feedbackRows) ? feedbackRows : [];
    const avg=(values:number[])=>values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10:0;
    const difficultyDistribution=Object.fromEntries(['very_easy','easy','just_right','hard','very_hard'].map(k=>[k,feedback.filter(f=>f.difficulty===k).length]));
    const memoRated=feedback.filter(f=>!f.cube_memo_unused&&Number.isFinite(f.rating_cube_memo));
    const feedbackSummary={count:feedback.length,averageUsability:avg(feedback.map(f=>f.rating_usability)),averageFun:avg(feedback.map(f=>f.rating_fun)),averageReplay:avg(feedback.map(f=>f.rating_replay)),difficultyDistribution,memo:{used:feedback.filter(f=>!f.cube_memo_unused).length,unused:feedback.filter(f=>f.cube_memo_unused).length,averageRating:avg(memoRated.map(f=>f.rating_cube_memo!))},emailRegistrations:Array.isArray(contactRows)?contactRows.length:0,marketingConsents:Array.isArray(contactRows)?contactRows.filter(c=>c.marketing_consent).length:0,details:feedback.slice(0,500)};
    res.status(200).json({ overview: { players: players.size, sessions: sessions.size, gameStarts, completedStages: completed.length, averageActiveSeconds: active.length ? Math.round(active.reduce((a, b) => a + b, 0) / active.length) : 0, medianActiveSeconds: Math.round(median(active)), totalActiveSeconds: active.reduce((a, b) => a + b, 0), testStarts, testCompletes }, stages, trafficSources, cubeTest: { starts: testStarts, completes: testCompletes, completionRate: testStarts ? Math.round(testCompletes / testStarts * 1000) / 10 : 0, averageScore: scoreValues.length ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) : 0, medianScore: Math.round(median(scoreValues)), averageTotalTime: tests.length ? Math.round(tests.reduce((a, e) => a + jsonNumber(e.payload.totalEffectiveTime), 0) / tests.length) : 0, rankDistribution, questionFunnel, stepDropOff }, feedback: feedbackSummary });
  } catch (error) {
    // Keep diagnostics useful without ever logging credentials or response bodies.
    console.error('[admin-analytics] backend failure', {
      phase,
      errorType: error instanceof Error ? error.name : 'unknown',
      status: error instanceof SupabaseRestError ? error.status : undefined,
      responseKeys: error instanceof SupabaseRestError ? error.bodyKeys : undefined,
    });
    res.status(500).json({ error: 'analytics_backend_failure', phase });
  }
}
