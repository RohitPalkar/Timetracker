import { getSupabaseService } from '../../db/client.js'
import { ApiError } from '../../lib/errors.js'

interface AuthCtx {
  user: { id: string }
  organization: { id: string }
  roles: string[]
  permissions: string[]
}

function can(auth: AuthCtx, perm: string): boolean {
  return auth.permissions.includes('admin.all') || auth.permissions.includes(perm)
}

export async function listProjects(auth: AuthCtx, query: { search?: string; status?: string }) {
  const svc = getSupabaseService()!
  let q = svc.from('projects').select('*, project_managers(user_id), project_members(count)').eq('organization_id', auth.organization.id).is('deleted_at', null).order('created_at', { ascending: false })
  if (query.status) q = q.eq('status', query.status)
  if (query.search) q = q.ilike('name', `%${query.search}%`)
  const { data, error } = await q
  if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  // Enrich with counts via separate queries for managers/members/subprojects if needed
  const enriched = await Promise.all((data ?? []).map(async (p: any) => {
    const { count: subCount } = await svc.from('sub_projects').select('id', { count: 'exact', head: true }).eq('project_id', p.id).is('deleted_at', null)
    const { count: memberCount } = await svc.from('project_members').select('id', { count: 'exact', head: true }).eq('project_id', p.id).is('ended_at', null)
    const { data: managers } = await svc.from('project_managers').select('user_id').eq('project_id', p.id)
    return { ...p, sub_project_count: subCount ?? 0, member_count: memberCount ?? 0, manager_ids: (managers ?? []).map((m: any) => m.user_id) }
  }))
  return enriched
}

export async function getProject(auth: AuthCtx, projectId: string) {
  const svc = getSupabaseService()!
  const { data, error } = await svc.from('projects').select('*').eq('id', projectId).eq('organization_id', auth.organization.id).is('deleted_at', null).single()
  if (error || !data) throw new ApiError('Project not found', 404, 'NOT_FOUND')
  // Check membership access: org member can view if project exists in org; for stricter, check project_members
  const { data: managers } = await svc.from('project_managers').select('user_id').eq('project_id', projectId)
  const { data: members } = await svc.from('project_members').select('user_id, role').eq('project_id', projectId).is('ended_at', null)
  const { data: subs } = await svc.from('sub_projects').select('id, key, name, status, health, progress').eq('project_id', projectId).is('deleted_at', null)
  return { ...data, managers: managers ?? [], members: members ?? [], sub_projects: subs ?? [] }
}

export async function createProject(auth: AuthCtx, body: any) {
  if (!can(auth, 'projects.create') && !can(auth, 'project.create')) throw new ApiError('Forbidden', 403, 'FORBIDDEN')
  const svc = getSupabaseService()!
  const key = body.key.toUpperCase()
  // Check duplicate key in org
  const { data: existing } = await svc.from('projects').select('id').eq('organization_id', auth.organization.id).ilike('key', key).is('deleted_at', null).limit(1)
  if (existing && existing.length > 0) throw new ApiError('Project key already exists', 409, 'CONFLICT')

  const { data, error } = await svc.from('projects').insert({
    organization_id: auth.organization.id,
    key,
    name: body.name,
    description: body.description ?? null,
    status: body.status ?? 'active',
    health: body.health ?? 'healthy',
    type: body.type ?? null,
    client: body.client ?? null,
    start_date: body.start_date ?? null,
    end_date: body.end_date ?? null,
    budget: body.budget ?? 0,
    spent: body.spent ?? 0,
    tags: body.tags ?? [],
    has_sub_projects: body.has_sub_projects ?? false,
    created_by: auth.user.id,
  }).select().single()
  if (error || !data) throw new ApiError(error?.message ?? 'Failed to create project', 500, 'INTERNAL_ERROR')

  // Managers
  if (body.manager_ids?.length) {
    const rows = body.manager_ids.map((uid: string) => ({ project_id: data.id, user_id: uid }))
    const { error: mErr } = await svc.from('project_managers').insert(rows)
    if (mErr) throw new ApiError(mErr.message, 500, 'INTERNAL_ERROR')
  }
  // Members
  if (body.member_ids?.length) {
    const rows = body.member_ids.map((m: any) => ({
      organization_id: auth.organization.id,
      project_id: data.id,
      user_id: m.user_id,
      role: m.role ?? 'developer',
    }))
    const { error: memErr } = await svc.from('project_members').insert(rows)
    if (memErr) throw new ApiError(memErr.message, 500, 'INTERNAL_ERROR')
  }

  return data
}

export async function updateProject(auth: AuthCtx, projectId: string, body: any) {
  if (!can(auth, 'projects.edit') && !can(auth, 'project.update')) throw new ApiError('Forbidden', 403, 'FORBIDDEN')
  const svc = getSupabaseService()!
  const { data: existing, error: e1 } = await svc.from('projects').select('id').eq('id', projectId).eq('organization_id', auth.organization.id).is('deleted_at', null).single()
  if (e1 || !existing) throw new ApiError('Project not found', 404, 'NOT_FOUND')

  const patch: any = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.description !== undefined) patch.description = body.description
  if (body.status !== undefined) patch.status = body.status
  if (body.health !== undefined) patch.health = body.health
  if (body.type !== undefined) patch.type = body.type
  if (body.client !== undefined) patch.client = body.client
  if (body.start_date !== undefined) patch.start_date = body.start_date
  if (body.end_date !== undefined) patch.end_date = body.end_date
  if (body.budget !== undefined) patch.budget = body.budget
  if (body.spent !== undefined) patch.spent = body.spent
  if (body.tags !== undefined) patch.tags = body.tags
  if (body.has_sub_projects !== undefined) patch.has_sub_projects = body.has_sub_projects
  if (body.key !== undefined) patch.key = body.key.toUpperCase()

  if (Object.keys(patch).length) {
    patch.updated_at = new Date().toISOString()
    const { error } = await svc.from('projects').update(patch).eq('id', projectId)
    if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  }

  // Managers: replace if provided
  if (body.manager_ids !== undefined) {
    await svc.from('project_managers').delete().eq('project_id', projectId)
    if (body.manager_ids.length) {
      const rows = body.manager_ids.map((uid: string) => ({ project_id: projectId, user_id: uid }))
      await svc.from('project_managers').insert(rows)
    }
  }

  const { data } = await svc.from('projects').select('*').eq('id', projectId).single()
  return data
}

export async function deleteProject(auth: AuthCtx, projectId: string) {
  if (!can(auth, 'projects.delete') && !can(auth, 'project.archive')) throw new ApiError('Forbidden', 403, 'FORBIDDEN')
  const svc = getSupabaseService()!
  const { data: existing } = await svc.from('projects').select('id').eq('id', projectId).eq('organization_id', auth.organization.id).is('deleted_at', null).single()
  if (!existing) throw new ApiError('Project not found', 404, 'NOT_FOUND')
  const { error } = await svc.from('projects').update({ deleted_at: new Date().toISOString() }).eq('id', projectId)
  if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  return { ok: true }
}

// ── Sub-projects ───────────────────────────────────────────────────────────
export async function listSubProjects(auth: AuthCtx, projectId: string) {
  const svc = getSupabaseService()!
  const { data, error } = await svc.from('sub_projects').select('*').eq('project_id', projectId).eq('organization_id', auth.organization.id).is('deleted_at', null).order('created_at')
  if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  return data ?? []
}

export async function createSubProject(auth: AuthCtx, projectId: string, body: any) {
  if (!can(auth, 'subprojects.create')) throw new ApiError('Forbidden', 403, 'FORBIDDEN')
  const svc = getSupabaseService()!
  const { data: proj } = await svc.from('projects').select('id').eq('id', projectId).eq('organization_id', auth.organization.id).is('deleted_at', null).single()
  if (!proj) throw new ApiError('Project not found', 404, 'NOT_FOUND')
  const { data, error } = await svc.from('sub_projects').insert({
    organization_id: auth.organization.id,
    project_id: projectId,
    key: body.key.toUpperCase(),
    name: body.name,
    description: body.description ?? null,
    status: body.status ?? 'active',
    health: body.health ?? 'healthy',
    budget: body.budget ?? 0,
    spent: body.spent ?? 0,
    tags: body.tags ?? [],
    created_by: auth.user.id,
  }).select().single()
  if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  // Mark project has_sub_projects
  await svc.from('projects').update({ has_sub_projects: true }).eq('id', projectId)
  return data
}

export async function updateSubProject(auth: AuthCtx, subProjectId: string, body: any) {
  const svc = getSupabaseService()!
  const { data: existing } = await svc.from('sub_projects').select('id, project_id').eq('id', subProjectId).eq('organization_id', auth.organization.id).is('deleted_at', null).single()
  if (!existing) throw new ApiError('Sub-project not found', 404, 'NOT_FOUND')
  const patch: any = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.description !== undefined) patch.description = body.description
  if (body.status !== undefined) patch.status = body.status
  if (body.health !== undefined) patch.health = body.health
  if (body.key !== undefined) patch.key = body.key.toUpperCase()
  if (body.budget !== undefined) patch.budget = body.budget
  if (body.spent !== undefined) patch.spent = body.spent
  if (body.tags !== undefined) patch.tags = body.tags
  if (Object.keys(patch).length) {
    patch.updated_at = new Date().toISOString()
    const { error } = await svc.from('sub_projects').update(patch).eq('id', subProjectId)
    if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  }
  const { data } = await svc.from('sub_projects').select('*').eq('id', subProjectId).single()
  return data
}

export async function deleteSubProject(auth: AuthCtx, subProjectId: string) {
  const svc = getSupabaseService()!
  const { data: existing } = await svc.from('sub_projects').select('id').eq('id', subProjectId).eq('organization_id', auth.organization.id).is('deleted_at', null).single()
  if (!existing) throw new ApiError('Sub-project not found', 404, 'NOT_FOUND')
  const { error } = await svc.from('sub_projects').update({ deleted_at: new Date().toISOString() }).eq('id', subProjectId)
  if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  return { ok: true }
}

// ── Members ────────────────────────────────────────────────────────────────
export async function listMembers(auth: AuthCtx, projectId: string) {
  const svc = getSupabaseService()!
  const { data, error } = await svc.from('project_members').select('*, users(id, email, display_name)').eq('project_id', projectId).eq('organization_id', auth.organization.id).is('ended_at', null)
  if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  return data ?? []
}

export async function addMember(auth: AuthCtx, projectId: string, body: any) {
  const svc = getSupabaseService()!
  const { data: proj } = await svc.from('projects').select('id').eq('id', projectId).eq('organization_id', auth.organization.id).is('deleted_at', null).single()
  if (!proj) throw new ApiError('Project not found', 404, 'NOT_FOUND')
  // Verify user is in org
  const { data: mem } = await svc.from('organization_memberships').select('id').eq('organization_id', auth.organization.id).eq('user_id', body.user_id).eq('status','active').single()
  if (!mem) throw new ApiError('User not in organization', 400, 'VALIDATION_ERROR')
  const { data, error } = await svc.from('project_members').insert({
    organization_id: auth.organization.id,
    project_id: projectId,
    user_id: body.user_id,
    role: body.role ?? 'developer',
    capacity: body.capacity ?? 100,
  }).select().single()
  if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  return data
}

export async function removeMember(auth: AuthCtx, projectId: string, userId: string) {
  const svc = getSupabaseService()!
  const { error } = await svc.from('project_members').update({ ended_at: new Date().toISOString() }).eq('project_id', projectId).eq('user_id', userId).is('ended_at', null)
  if (error) throw new ApiError(error.message, 500, 'INTERNAL_ERROR')
  return { ok: true }
}
