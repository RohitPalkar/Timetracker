import { getSupabaseService } from '../../db/client.js'
import { ApiError } from '../../lib/errors.js'

interface AuthCtx { user: { id: string }, organization: { id: string }, permissions: string[] }

function can(auth: AuthCtx, perm: string) { return auth.permissions.includes('admin.all') || auth.permissions.includes(perm) }

export async function listTeams(auth: AuthCtx) {
  const svc = getSupabaseService()!
  const { data, error } = await svc.from('teams').select('*, team_members(user_id)').eq('organization_id', auth.organization.id).is('deleted_at', null).order('created_at')
  if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  return (data ?? []).map((t: any) => ({ ...t, member_count: (t.team_members ?? []).length }))
}

export async function getTeam(auth: AuthCtx, teamId: string) {
  const svc = getSupabaseService()!
  const { data, error } = await svc.from('teams').select('*, team_members(user_id, role_override)').eq('id', teamId).eq('organization_id', auth.organization.id).is('deleted_at', null).single()
  if (error || !data) throw new ApiError('Team not found', 404, 'NOT_FOUND')
  return data
}

export async function createTeam(auth: AuthCtx, body: any) {
  if (!can(auth, 'teams.manage') && !can(auth, 'teams.view')) throw new ApiError('Forbidden', 403, 'FORBIDDEN')
  const svc = getSupabaseService()!
  const { data, error } = await svc.from('teams').insert({
    organization_id: auth.organization.id,
    name: body.name,
    description: body.description ?? null,
    type: body.type ?? 'cross_functional',
    created_by: auth.user.id,
  }).select().single()
  if (error || !data) throw new ApiError(error?.message ?? 'Failed', 500, 'INTERNAL_ERROR')
  if (body.member_ids?.length) {
    const rows = body.member_ids.map((uid: string) => ({ organization_id: auth.organization.id, team_id: data.id, user_id: uid }))
    await svc.from('team_members').insert(rows)
  }
  return data
}

export async function updateTeam(auth: AuthCtx, teamId: string, body: any) {
  const svc = getSupabaseService()!
  const patch: any = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.description !== undefined) patch.description = body.description
  if (body.type !== undefined) patch.type = body.type
  if (Object.keys(patch).length) {
    patch.updated_at = new Date().toISOString()
    const { error } = await svc.from('teams').update(patch).eq('id', teamId).eq('organization_id', auth.organization.id)
    if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  }
  if (body.member_ids !== undefined) {
    await svc.from('team_members').delete().eq('team_id', teamId)
    if (body.member_ids.length) {
      const rows = body.member_ids.map((uid: string) => ({ organization_id: auth.organization.id, team_id: teamId, user_id: uid }))
      await svc.from('team_members').insert(rows)
    }
  }
  const { data } = await svc.from('teams').select('*').eq('id', teamId).single()
  return data
}

export async function deleteTeam(auth: AuthCtx, teamId: string) {
  const svc = getSupabaseService()!
  const { error } = await svc.from('teams').update({ deleted_at: new Date().toISOString() }).eq('id', teamId).eq('organization_id', auth.organization.id)
  if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  return { ok: true }
}
