import Fastify from 'fastify'
import cors from '@fastify/cors'
import { env } from './config/env.js'
import { authRoutes } from './modules/auth/routes.js'
import { dashboardRoutes } from './modules/dashboard/routes.js'

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: env.corsOrigins.length ? env.corsOrigins : true,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
})

app.get('/health', async () => {
  return { status: 'ok', db: env.isSupabaseConfigured() ? 'supabase' : 'mock', ts: new Date().toISOString() }
})

await authRoutes(app)
await dashboardRoutes(app)

// Central error handler
app.setErrorHandler((err: any, _req, reply) => {
  const status = err.status ?? err.statusCode ?? 500
  const code = err.code ?? 'INTERNAL_ERROR'
  const message = err.message ?? 'Internal error'
  if (status >= 500) app.log.error(err)
  reply.status(status).send({ error: { code, message } })
})

const start = async () => {
  env.validate()
  try {
    await app.listen({ port: env.port, host: env.host })
    app.log.info(`MyTracker API listening on ${env.host}:${env.port} (supabase=${env.isSupabaseConfigured() ? 'on' : 'mock'})`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
