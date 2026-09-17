import { getSupabaseService } from './client.js'
import fs from 'fs'
import path from 'path'
async function run() {
  const svc = getSupabaseService()
  if (!svc) { console.log('[seed] Skipping — Supabase not configured (mock mode)'); return }
  const sql = fs.readFileSync(path.resolve('src/db/seeds/001_seed.sql'),'utf8')
  console.log('[seed] Applying 001_seed.sql ...')
  // @ts-ignore
  const { error } = await svc.rpc('exec_sql' as any, { sql } as any)
  if (error) console.warn('[seed] rpc failed, run manually in SQL editor:', error.message)
  else console.log('[seed] done')
}
run().catch(e => { console.error(e); process.exit(1) })
