# MyTracker — DATABASE ARCHITECTURE V2 (Frozen for Migration)
> Status: **FREEZE** — Do not create migrations until approved
> Date: 2026-09-02
> Predecessor: `PHASE-0-ARCHITECTURE.md` v1

---

## 1. Complete Entity Inventory (68 entities grouped)

**Identity & Org (7):** `organizations`, `users`(public mirror of `auth.users`), `organization_memberships`, `departments`, `department_memberships`, `invitations`, `sessions_device` (optional)

**Projects (6):** `projects`, `project_managers` (M:N), `project_memberships`, `sub_projects`, `project_milestones`, `project_activities`

**Teams (4):** `teams`, `team_sub_projects` (M:N to sub_projects), `team_memberships`, `department_teams` (optional)

**Agile (11):** `sprints`, `epics`, `stories`, `story_subtasks`, `tasks` (if not story.storyType), `bugs`, `releases`, `release_items` (release ↔ stories+b location/bugs), `boards` (virtual, not table), `board_columns` (optional config), `story_links`

**Timesheets (5):** `work_logs` (legacy `time_logs`), `timesheets` (weekly header), `timesheet_entries` (day×project×task), `timesheet_approvals`, `holidays`

**Resource & Finance (5):** `allocations` (resource planning), `utilizations` (derived), `budgets` (or columns on projects/subs), `cost_entries`, `billing_periods`

**QA (4):** `test_cases`, `test_runs`, `test_results`, `bug_relations` (story←→bug already covers)

**Documents (3):** `folders`, `documents`, `document_acl`

**Collaboration (5):** `comments`, `attachments`, `mentions`, `activity_feed`, `audit_logs`

**Notifications & Surveys (4):** `notifications`, `notification_preferences`, `surveys`, `survey_responses` (+ `survey_questions`)

**AI Workspace (6):** `ai_agents`, `ai_prompts`, `ai_knowledge_docs`, `ai_knowledge_chunks` (RAG vector), `ai_usage_ledger`, `ai_interactions`

**Admin & Governance (4):** `roles`, `permissions`, `role_permissions`, `user_role_assignments` (org-scoped)

**Integration (2):** `integrations`, `webhooks` + `webhook_deliveries`

> Every tenant-owned row carries `organization_id` except global `organizations`, `roles/permissions` (global catalog but scoped assignment).

---

## 2. Complete ERD (ASCII)

```
organizations (1) ──* organization_memberships *── (1) users ──1 auth.users
    │1                    │                         ╱│
    │                     │                        ╱ │
    │*                    │                       ╱  │
projects *──1 org         │                      ╱   │
  │1──* project_managers *── users              ╱    │
  │1──* project_memberships (user,project,sub?,team?,role) ╱
  │1──* sub_projects ──* epics ──* stories ──* story_subtasks
  ││      │1                │         │1         │        │1
  ││      │1                │         │          │        │
  ││      └──* sprints ─────┘         └──────────┘        │
  ││           │1──* stories.sprint_id (nullable)          │
  ││           │1──* bugs.sprint_id?                       │
  ││           │                                           
  │1──* teams ──* team_sub_projects *── sub_projects
  │1──* team_memberships *── users
  │1──* sprints (flat, sub_project_id NULL)
  │
  │──* reports (materialized, not table)
  │
documents (org/project/sub) ── attachments
notifications ── users
surveys ── responses
ai_* ── organizations
timesheets ── users/projects/sprints  (see §14)
```

---

## 3. Every Table — Columns Overview

Below is foundation + enterprise. **Foundation must ship first** (marked F). Others are V2 planned (P). Types: `uuid pk`, `timestamptz`, `text`, `numeric`, `int`, `bool`, `jsonb`.

### 3.1 Identity & Org (F)
**organizations** `id, name, domain unique partial, logo_url, plan (starter|growth|enterprise), seats_used, seats_total, timezone, week_starts_on, created_at, updated_at, deleted_at null`
**users** `id pk fk auth.users, email unique, name, designation, department_id fk nullable, avatar_url, utilization int, status (active|invited|suspended), location, joined_at, created_at, updated_at`
**organization_memberships** `id pk, organization_id fk, user_id fk, role_key (super_admin|org_admin|member), joined_at, left_at nullable`
**departments** `id pk, organization_id fk, name, parent_id nullable fk self, lead_user_id fk nullable, created_at`
**invitations** `id pk, organization_id fk, email, role_key, invited_by fk, token, status (pending|accepted|revoked), expires_at`

### 3.2 Projects (F)
**projects** `id pk, organization_id fk not null, key text not null, name, description, status (active|planned|completed|archived|on_hold), health (healthy|on_track|at_risk|critical), progress int, type (platform|product|client_delivery|internal|data|design), business_analyst_id fk nullable, client text, start_date date, end_date date, budget numeric, spent numeric, tags text[], has_sub_projects bool default false, created_at, updated_at, deleted_at`
**project_managers** `project_id fk, user_id fk, assigned_at, pk(project_id,user_id)`
**project_memberships** `id pk, organization_id fk not null, project_id fk not null, sub_project_id fk nullable, team_id fk nullable, user_id fk not null, role (owner|manager|lead|developer|qa|designer|business_analyst|consultant), capacity int, started_at, ended_at nullable, created_at` **see isolation: if sub_project_id set → check project_id = sub_project.project_id; if team_id set → check team.project_id = project_id**
**sub_projects** `id pk, organization_id fk not null, project_id fk not null, key text, name, description, status, health, progress, business_analyst_id fk nullable, start_date, end_date, budget, spent, tags text[], created_at, updated_at, deleted_at`
**project_milestones** `id pk, organization_id, project_id, title, date date, status (planned|in_progress|completed), created_at`
**project_activities** `id pk, organization_id, project_id, type (member|milestone|status|budget|settings|comment), actor_id fk nullable, action text, target text, created_at`

### 3.3 Teams (F)
**teams** `id pk, organization_id fk, project_id fk nullable (null = org-global team), name, description, type (development|qa|design|business_analysis|devops|cross_functional), created_at, updated_at, deleted_at`
**team_sub_projects** `team_id fk, sub_project_id fk, assigned_at, pk(team_id,sub_project_id)` — 0 rows = project-wide; N rows = shared across subs (replaces `teams.subProjectIds`)
**team_memberships** `id pk, organization_id, team_id fk, user_id fk, role_override text nullable (lead|member), capacity int, joined_at, left_at nullable, pk/team+user unique where left_at is null` — normalized from `teams.memberIds` array

### 3.4 Agile (F for sprints/epics/stories/bugs/releases; boards virtual)
**sprints** `id pk, organization_id not null, project_id fk not null, sub_project_id fk nullable, key text, name, goal text, status (planned|active|completed), start_date timestamptz, end_date, capacity_hours int, hours_logged int, velocity int, confidence numeric, created_at, updated_at, check(sub_project_id is null or sub_project.project_id=project_id)`
**epics** `id pk, organization_id, project_id, sub_project_id fk nullable, key text, name, summary, color, start_date, end_date, status (open|in_progress|done), points_total, points_done, story_count, created_at`
**stories** `id pk, organization_id, project_id, sub_project_id fk nullable, epic_id fk nullable, sprint_id fk nullable, release_id fk nullable, key text, title, description text, acceptance_criteria text[], status (todo|in_progress|in_review|qa|done), priority (highest..lowest), points int, assignee_id fk nullable, qa_id fk nullable, story_type (story|task|subtask), tags text[], due_date date, estimates jsonb {optimistic,likely,pessimistic}, ai_confidence numeric, created_at, updated_at, deleted_at`
**story_subtasks** `id pk, story_id fk, title, done bool, assignee_id fk nullable, due_date date, created_at`
**bugs** `id pk, organization_id, project_id, sub_project_id fk nullable, story_id fk nullable, key text, title, description, severity (blocker|critical|major|minor|trivial), status (open|assigned|fixing|ready_for_qa|verified|closed), assignee_id fk nullable, reporter_id fk not null, created_at, updated_at`
**releases** `id pk, organization_id, project_id, sub_project_id fk nullable, key text, name, version, description, status (planned|in_progress|released|deferred), start_date, release_date nullable, created_at, updated_at`
**release_items** `release_id fk, story_id fk nullable, bug_id fk nullable, check exactly one not null, pk(release_id, coalesce(story_id,bug_id))`

### 3.5 Timesheets (§14)
**timesheets** `id pk, organization_id, user_id, week_start date, status (draft|submitted|approved|rejected), submitted_at nullable, approved_by fk nullable, created_at` unique(user_id,week_start)
**timesheet_entries** `id pk, timesheet_id fk, organization_id, project_id fk nullable, sub_project_id fk nullable, story_id fk nullable, date date, hours numeric(4,2), description, billable bool, created_at`
**timesheet_approvals** `id pk, timesheet_id fk, approver_id fk, action (approved|rejected), comment, created_at`
**holidays** `id pk, organization_id, date date, name, is_half_day bool, created_at` unique(org,date)

### 3.6 QA (§15)
**test_cases** `id pk, organization_id, project_id nullable, sub_project_id nullable, title, steps jsonb, expected jsonb, created_at`
**test_runs** `id pk, test_case_id fk, sprint_id fk nullable, run_by fk, status (pass|fail|blocked), executed_at`

### 3.7 AI (§16)
**ai_agents** `id pk, organization_id, name, config jsonb, created_by fk, created_at`
**ai_prompts** `id pk, organization_id, agent_id fk nullable, title, body text, is_shared bool, created_at`
**ai_knowledge_docs** `id pk, organization_id, project_id nullable, title, source_url, status, created_at`
**ai_knowledge_chunks** `id pk, doc_id fk, chunk_index int, content text, embedding vector(1536) nullable, created_at` (pgvector)
**ai_usage_ledger** `id pk, organization_id, user_id, agent_id fk nullable, tokens_input int, tokens_output int, cost numeric, model text, created_at`
**ai_interactions** `id pk, organization_id, user_id, agent_id fk nullable, prompt text, response text, created_at`

### 3.8 Docs (§18)
**folders** `id pk, organization_id, project_id nullable, sub_project_id nullable, name, parent_id fk nullable, created_by, created_at`
**documents** `id pk, organization_id, project_id nullable, sub_project_id nullable, folder_id fk nullable, title, mime text, size int, storage_key text, version int, created_by, created_at, deleted_at`
**document_acl** `document_id fk, user_id fk nullable, team_id fk nullable, permission (view|edit|manage), pk(document_id, coalesce(user_id,team_id))`

### 3.9 Notifications/Survey/Reports etc.
**notifications** `id pk, organization_id, user_id (recipient), actor_id nullable, type, title, body, link_url nullable, read_at nullable, created_at` index user_id+read_at
**notification_preferences** `user_id fk, organization_id fk, channel (email|in_app), enabled bool, pk(user_id,org,channel)`
**surveys** `id pk, organization_id, project_id nullable, title, description, status (draft|open|closed), created_by, created_at`
**survey_questions** `id pk, survey_id fk, kind (nps|scale|text|choice), body text, options jsonb, required bool`
**survey_responses** `id pk, survey_id fk, respondent_id fk, answers jsonb, submitted_at`
**reports_cache** (optional materialized) `id pk, organization_id, kind, payload jsonb, generated_at` — aggregates not transactional

### 3.10 Governance
**roles** `id pk, organization_id nullable (null=global catalog), key (super_admin...finance) unique scoped, name, description, is_system bool`
**permissions** `id pk, key (PermissionKey) unique, label, module, description`
**role_permissions** `role_id fk, permission_id fk, pk(role_id,permission_id)`
**user_role_assignments** `id pk, organization_id fk, user_id fk, role_id fk, scope_type (org|project|sub_project|team), scope_id uuid nullable, granted_at` — explicit contextual role outside memberships (optional, overlaps membership.role)

### 3.11 Integrations
**integrations** `id pk, organization_id, provider (slack|jira|github|render...), config jsonb encrypted, enabled bool, created_at`
**webhooks** `id pk, organization_id, url, secret, events text[], enabled bool`

---

## 4. PK/FK Summary
All `id uuid pk default gen_random_uuid()`. FKs: `organizations.id` ← all `organization_id`; `users.id` ← `auth.users.id` (1-1); `projects → sub_projects/teams/sprints`; `sub_projects → team_sub_projects/sprints`; `teams → team_memberships/team_sub_projects`; `project_memberships` references `projects/sub_projects/teams/users` with checks (§3). On delete: `CASCADE` for membership/junctions (`project_managers`, `project_memberships`, `team_sub_projects`, `release_items`), `SET NULL` for nullable `assignee_id`, `RESTRICT` for users.

## 5. Unique Constraints
- `users(email)` lower unique, `organizations(domain)` lower unique where not null
- `projects(organization_id, lower(key))`, `sub_projects(project_id, lower(key))`, `sprints(project_id, coalesce(sub_project_id,'00000000…'), lower(name))` optional
- `organization_memberships(organization_id,user_id)`, `team_memberships(team_id,user_id) where left_at is null`, `project_managers(project_id,user_id)`, `timesheets(user_id, week_start)`, `invitations(org,email) where status=pending`

## 6. CHECK Constraints
- Enums via `check (status in (...))` per table (project status, health, sprint status, bug severity/status, role values)
- `project_memberships`: `check ((sub_project_id is null) or (project_id = (select project_id from sub_projects where id=sub_project_id)))` (deferred via trigger if PG check limitation → use trigger)
- `sprints`: same lineage check
- `stories/bugs`: `check (project_id = coalesce((select project_id from sprints where id=sprint_id), project_id))` optional but enforce via app unless DB trigger
- `timesheet_entries.hours between 0 and 24`, `budgets >=0`

## 7. Delete / Soft-Delete Strategy
- **Soft-delete** (`deleted_at timestamptz`) for enterprise audit: `projects`, `sub_projects`, `teams`, `stories`, `documents`, `users` (suspend). Queries `where deleted_at is null` by default via RLS/view.
- **Hard-delete** for junctions: `project_managers`, `team_sub_projects`, `release_items`, `mentions`, `survey_responses` (GDPR delete allowed).
- `deleted_at` + `deleted_by` where useful; retention policy.

## 8. Audit Strategy
- **Audit logs table** `audit_logs(id, organization_id, actor_id, entity_type, entity_id, action (create|update|delete|status_change), diff jsonb, ip, user_agent, created_at)` populated by triggers on critical tables (`projects`, `project_memberships`, `sprints`, `stories`).
- **Immutable:** `project_activities` mirrors activity feed but `audit_logs` is system truth.
- `created_at/updated_at` on all, `updated_by` where update-heavy (stories).

## 9. Tenant Isolation Strategy
- Every tenant table has `organization_id not null` indexed. All queries must `where organization_id = $1`. Service layer asserts `authUser organization_membership` before any project query.
- Project-scoped tables additionally `project_id`; sub-project-scoped additionally `sub_project_id nullable` — isolation via composite `WHERE` not trust of FE. EFA/UTLITE example enforced by `sprints`/`stories` queries `where organization_id=:org and project_id=:prj and (sub_project_id=:sub or sub_project_id is null for flat)`.
- Middleware resolves `organization_id` from `organization_memberships` (default active org) then scopes.

## 10. RLS Strategy
Enable `ENABLE ROW LEVEL SECURITY` on all tenant tables. Policies (service_role bypass):
- `USING (organization_id in (select organization_id from organization_memberships where user_id=auth.uid() and left_at is null))`
- `project_memberships` policy: `user_id=auth.uid() OR exists (select 1 from project_memberships pm where pm.project_id=row.project_id and pm.user_id=auth.uid() and pm.role in ('owner','manager') and pm.ended_at is null)` (manager sees all).
- `sub_projects/sprints/stories/bugs`: same org check + `project_membership` required; if row `sub_project_id not null` then also `exists (select 1 from project_memberships where sub_project_id=row.sub_project_id and user_id=auth.uid())`.
- `team_sub_projects`: project membership.

RLS is defense; service still `assertMembership`.

## 11. Authorization Model
```
auth.users (Supabase) → public.users (profile)
  → organization_memberships (org roles)
    → project_memberships (project+sub+team+role+capacity)
      → team_memberships (team role override)
        → roles/permissions resolution → Effective PermissionKey[] via role_permissions + project capability matrix
```
No `users.role` global. Capability example `projects.create` requires `organization_membership super_admin/org_admin` OR `project_membership role manager` for that project. Flat vs structured resolved via `project_memberships.sub_project_id` null vs not. JWT not authoritative; DB is.

## 12. Index Strategy (per query pattern)
- **Org isolation:** `idx_{table}_org org_id` on all tenant tables.
- **Project lists:** `idx_projects_org_key (org_id, lower(key))`, `idx_projects_org_status (org_id,status)`
- **Managers:** `idx_project_managers_user`, `idx_project_managers_project`
- **Membership lookups:** `idx_pm_org_proj_user (org,proj,user)`, `idx_pm_user_proj_sub (user,proj,sub)` for context switch; partial `where ended_at is null`.
- **Team cross-sub:** `idx_team_sub_projects_sub`, `idx_team_sub_projects_team`
- **Agile board:** `idx_stories_proj_sub_sprint (proj,sub,sprint_id)`, `idx_stories_assignee`, `idx_bugs_proj_sub`, `idx_sprints_proj_sub_status`
- **Timesheets:** `idx_timesheets_user_week`, `idx_entries_timesheet_date`
- **Notifications:** `idx_notifications_user_read (user_id, read_at)`
- **Vectors:** `ivfflat` on `ai_knowledge_chunks.embedding` (if pgvector).
- Avoid speculative: no index on `tags` unless GIN needed later.

## 13. Timesheet Model (§14)
`timesheets` header per user per week (iso Week `week_start` Monday), `timesheet_entries` day granularity linked to `project_id/sub_project_id/story_id` nullable for cross-project logging, `hours 0-24`, `billable`. `timesheet_approvals` manager queue. Query pattern: `where user_id=? and week_start=?` or `where project_id=? and date between`. Isolated via `organization_id`.

## 14. QA Model (§15)
`test_cases` tied to `project/sub` (or global), `test_runs` per sprint, `test_results` ignored in foundation. Bugs already agile-linked; `bug_relations` not needed (bugs already `story_id nullable`).

## 15. AI Model (§16)
`ai_agents` org-scoped, `ai_prompts` per agent, `ai_knowledge_docs` optionally project/sub scoped, `chunks` vectorized, `ai_usage_ledger` per user/agent aggregated for Reports, `ai_interactions` audit.

## 16. Reporting Model (§17)
Not separate tables—**materialized views** `reports_cache` + queries over `project_activities`, `audit_logs`, `timesheet_entries`, `ai_usage_ledger`, `sprint_velocity = sum(stories.points where sprint_id)`. No new transactional tables needed V2.

## 17. Document Model (§18)
`folders` hierarchy (`parent_id`), `documents` versioned (`version int` increment on update, not new row unless versioning required), `document_acl` team/user granularity, soft-delete via `deleted_at`.

## 18. Notification Model (§19)
`notifications` inbox per user (org scoped), `notification_preferences` per org+channel, `mentions` extracted from `comments` → creates notification.

## 19. Survey Model (§20)
`surveys` org/project optional, `survey_questions` 1-N, `survey_responses` jsonb answers, no per-answer table V2 (simplify).

## 20. Resource Planning Model (§21)
`allocations` `(user_id, project_id, sub_project_id nullable, team_id nullable, week_start, allocated_hours, role)` for capacity vs `timesheet_entries`; `utilizations` computed view.

## 21. Financial/Cost Model (§22)
Reuse `projects(budget,spent)` + `sub_projects(budget,spent)` + `cost_entries(id, org, project_id, sub_project_id nullable, amount, category, incurred_at)` + `budgets` if need period budgets (optional V2). `invoices` deferred.

## 22. Integration Model (§23)
`integrations` encrypted config, `webhooks(url, secret, events)` for project creation, sprint change, timesheet approval; `webhook_deliveries` log.

## 23. Migration Dependency Graph
`000 extensions/vector` → `001 organizations` → `002 users (auth FK)` → `003 organization_memberships/departments` → `004 roles/permissions/role_permissions` → `005 projects` → `006 project_managers` → `007 sub_projects` → `008 teams` → `009 team_sub_projects + team_memberships` → `010 project_memberships` → `011 sprints` → `012 epics/stories/story_subtasks/bugs/releases/release_items` → `013 timesheets + entries/holidays/approvals` → `014 documents/folders/acl` → `015 notifications/surveys` → `016 ai_*` → `017 audit_logs triggers` → `018 seed (org-acme + 5 test users + prj-core/utec EFA/UTLITE + memberships)` → `019 RLS policies`

## 24. API/Backend Module Mapping
`/api/v1` → `backend/src/modules/{auth,users,organizations,projects,subProjects,teams,sprints,epics, stories,bugs,releases,timesheets,documents,notifications,surveys,ai,admin}` each `routes→controller→service→repository`. Foundation only needs `auth,users,organizations,projects,projectManagers,projectMemberships,subProjects,teams,teamSubProjects,teamMemberships,sprints`.

## 25. Explicit Out-of-Scope for V2 Freeze
No `board` table (virtual on sprint+status), no `departments` hierarchy UI, no `integrations` impl, no `webhook_deliveries` automation, no `ai vector` prod tuning, no `reports_cache` materialization cron—all deferred post-migration.

---

## CONFLICTS with PHASE-0-ARCHITECTURE.md

**CONFLICT 1**
- CURRENT: §1.3 `Sprint/Board/Release/Epic/Story` *scoped to Sub Project* only.
- RECOMMENDATION: `sprints/stories/etc` must support **both** `sub_project_id NULL` (flat `Project→Sprint`) **and** `sub_project_id not null` (structured `Project→SubProject→Sprint`) per verified requirement §12/13.
- REASON: QA `prj-core` flat and `prj-utec` structured both must work; existing FE `sprint.ts:24` `listByContext` already implements this. V1 doc incorrectly forces every sprint through sub-project.

**CONFLICT 2**
- CURRENT: §6.1 `Team Organization Global`.
- RECOMMENDATION: `teams.organization_id + project_id nullable + team_sub_projects M:N` + `team_memberships` contextual. Team not global-only, not sub-project child.
- REASON: Requirement 7-8 shared team EFA+UTLITE proof `team-utec-shared` would be impossible.

**CONFLICT 3**
- CURRENT: §7 permission keys flat list.
- RECOMMENDATION: Add `project.members.*, subprojects.*, teams.*, sprints.*` keys per `types/permission.ts:11` V2 and capability-based not scoped to persona switcher.
- REASON: Already fixed in REPORT-QA.

**CONFLICT 4**
- CURRENT: `mytracker-architecture.md` (if exists at root) earlier draft may have `projects.manager_ids[]`; not in PHASE-0 but in legacy mocks `managerIds: string[]`.
- RECOMMENDATION: Never array; `project_managers` join table, API serializes `managerIds[]` at boundary.
- REASON: FK/RLS/indexing.

---

## DATABASE ARCHITECTURE V2 — Freeze Confirmation

Enterprise foundation as above, covering identities, contextual memberships (`project_memberships` + `team_memberships` + `team_sub_projects`), optional sub-project, sprint isolation, timesheets/AI/docs/notifications/surveys resource/finance governed models, with tenant isolation, soft-delete, audit, RLS defense + service authz, indexed for org/project/sub/sprint/user queries, migration graph ready.

**STOP** — no migrations, no FE/BE code changes, no Render provisioning. Await approval to generate `backend/supabase/migrations` in `backend/foundation` branch.

