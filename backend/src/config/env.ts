import dotenv from 'dotenv'
dotenv.config()

function requireEnv(name: string, fallback?: string): string | undefined {
  const v = process.env[name] ?? fallback
  return v
}

export const env = {
  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseAnonKey: requireEnv('SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  port: parseInt(requireEnv('PORT', '3001')!, 10),
  host: requireEnv('HOST', '0.0.0.0')!,
  corsOrigins: (requireEnv('CORS_ORIGINS', 'http://localhost:5173') ?? '').split(',').map(s => s.trim()).filter(Boolean),
  demoAuthFallback: (requireEnv('DEMO_AUTH_FALLBACK', 'true') ?? 'true') === 'true',
  isSupabaseConfigured(): boolean {
    return Boolean(this.supabaseUrl && this.supabaseAnonKey && this.supabaseServiceRoleKey)
  },
  validate(): void {
    if (!this.corsOrigins.length) console.warn('[env] CORS_ORIGINS empty — defaulting to *')
  }
}
