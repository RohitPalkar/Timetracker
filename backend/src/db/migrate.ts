import fs from 'fs'
import path from 'path'
import { getSupabaseService } from './client.js'

async function run() {
  const svc = getSupabaseService()
  if (!svc) { console.log('[migrate] Skipping — Supabase not configured (mock mode)'); return }
  // Canonical migrations now live in supabase/migrations (Supabase CLI)
  const dir = path.resolve('../supabase/migrations')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort()
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8')
    console.log(`[migrate] Applying ${file} ...`)
    const { error } = await svc.rpc('exec_sql' as any, { sql } as any) as any
    if (error) {
      // Fallback: try via raw query using postgrest? exec via sql endpoint
      // For now, log and continue — user should run manually in Supabase SQL editor
      console.warn(`[migrate] ${file} rpc failed:`, error.message, '— please run manually in Supabase SQL editor')
    } else {
      console.log(`[migrate] ${file} done`)
    }
  }
}
run().catch(e => { console.error(e); process.exit(1) })
