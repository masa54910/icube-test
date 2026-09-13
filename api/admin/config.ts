type ApiResponse = { status(code: number): ApiResponse; json(value: unknown): void };
export default function handler(_req: unknown, res: ApiResponse) {
  const url = process.env.SUPABASE_URL || process.env.VITE_ANALYTICS_URL || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_ANALYTICS_ANON_KEY || '';
  if (!url || !anonKey) { res.status(503).json({ error: 'analytics_not_configured' }); return; }
  res.status(200).json({ url, anonKey });
}
