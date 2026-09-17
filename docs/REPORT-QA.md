# REPORT-QA.md — MyTracker Manual QA + Fix Pass
*Date: 2026-09-02 · Branch: main (ahead origin/main by 3, uncommitted fix pass) · Env: darwin, Node 24, Vite 8.2, dev port 5175*

## 1. QA Summary
- **Goal:** TEST → IDENTIFY → FIX → RE-TEST → REPORT (no new feature dev beyond bug fixes).
- **Scope:** Auth, Global Nav, Dashboard, Project List, Create/Edit (multi-PM), Simple (prj-core) vs Structured (prj-utec → EFA/UTLITE), Overviews, Sub-Projects, Data Isolation, Teams, Contextual Roles, Permissions, Responsive, Dark Mode.
- **Overall:** Build previously RED due to managerIds filter regression and missing demo hint. Fixed 2 bugs at service/component layer. Health green: `tsc` PASS, `oxlint` PASS, `build` PASS. Core architecture (multi-PM, optional SubProject, isolation, capability permissions) verified intact. 1 P3 minor remains (dark theme tokens).

## 2. Environment
- `git status` before fix: 22 modified files from Build #1; after fix: +2 (`project.ts`, `login-page.tsx`). Working tree dirty (intentional fix pass).
- `vite.config.ts:1` `port 5173/5175`, alias `@→src`. `globals.css:1` brand `#F97316`, no `dark` variant.
- `constants/index.ts` `OTP_DEMO_HINT=123456`, `SESSION_STORAGE_KEY=mytracker.session`, `SIDEBAR_STORAGE_KEY`, `MAX_LIST_PAGE_SIZE=500`.
- Dev server `npm run dev --port 5175` → 200 HTML, SPA routing. No test script (`npm test` missing → N/A).

## 3. Pages Tested

| Page / Route | File | Result |
|---|---|---|
| `/login` | `features/auth/login-page.tsx:17` | PASS after fix (validation, hint) |
| `/verify` | `features/auth/verify-page.tsx:10` | PASS (cooldown, resend, error) |
| `/session` | `features/auth/session-page.tsx` | PASS (mytracker.session restore) |
| `/dashboard` | `features/dashboard/dashboard-page.tsx:20` | PASS (see §5) |
| `/projects` | `features/projects/pages/projects-list-page.tsx:72` | PASS after fix |
| `/projects/new` | same via drawer | PASS (multi-PM) |
| `/projects/:projectId` → `overview` | `project-workspace-overview-page.tsx:18` | PASS |
| `/projects/prj-core` (flat) | — | PASS |
| `/projects/prj-utec` (structured) | — | PASS |
| `/projects/prj-utec/sub-projects` | `project-sub-projects-page.tsx:18` | PASS (EFA+UTLITE cards) |
| `/projects/:pid/sub-projects/:sid/overview` | `sub-project-workspace-overview-page.tsx` | PASS |
| `/projects/prj-utec/teams` | `project-workspace-teams-page.tsx:12` | PASS (5 teams inc shared) |
| `/projects/*` nested `backlog/epics/sprints/board/releases/reports/files/settings` | `project-workspace-placeholder-page.tsx` / `sub-project-workspace-placeholder-page.tsx` | PASS (structure-gated placeholder by design) |
| Placeholders: `/employees`…`/admin`/`/settings/profile` | `features/placeholder/modules.tsx:25` | PASS |

## 4. Personas Tested

| Persona | `store/persona.ts` / `config/project-config.ts:61` | Scope | Result |
|---|---|---|---|
| super_admin (`user-ravi`) | `organization` all caps | PASS: sees 9 projects, can create/edit/archive/delete |
| project_manager (`user-rohit`) | `managed` (`role=manager`) | PASS: UTEC+CORE visible (manages), Aditi's exclusive portal hidden if not member |
| business_analyst (`user-aditi`) | `assigned` | PASS: UTEC via membership, BA column hidden |
| employee (`user-sara`) | `assigned` | PASS: limited columns, cannot create |
| qa (`user-priya`) | `assigned` | PASS: QA columns, cannot create |

All via `DEMO_ACTOR_BY_PERSONA` + `projectService.list(scope+actorId)` + `getWorkspaceContext` 404/403.

## 5. Project Contexts Tested
- **Simple `prj-core` (`hasSubProjects:false`)**: workspace nav = `flat` → Overview, Backlog, Epics, Sprints, Board, Releases + Teams/Reports/Files/Settings. Sub-Projects absent (correctly empty-state). `subProjects.length===0`→ message "No sub projects — this is a simple project." Verified in `project-workspace-navigation.ts:48` `workspaceStructure`.
- **Structured `prj-utec` (`hasSubProjects:true`)**: nav = `structured` → hides flat backlog/epics/sprints/board/releases at project level, exposes `Sub Projects` + `Teams`. Sub-projects EFA/UTLITE each own isolate sprints/stories/bugs/epics/releases + Level 3 nav `sub-project-workspace-navigation.ts:49`.
- **CASE C** (multiple teams without sub-projects): `prj-core` roster `→ manager+BA+lead+QA+designer+developer` via `projectMemberStore` diverse roles covering A/C.

## 6. Data Isolation Tests
- **Sprints:** `sprints.ts:10` `spr-efa-16/17` (`sprj-efa`) vs `spr-utlite-9/10` (`sprj-utlite`). `sprintRepository.listByContext({prj-utec, sprj-efa})` returns 2 only; `...sprj-utlite` returns 2 only; `sprintRepository.listByContext({prj-core})` returns 3 (no subProjectId). `match` filter prevents leak. **PASS.**
- **Stories:** `agile.ts:63` `st-EFA-101/102` vs `st-UTLITE-201/202` via `storyRepository.listByContext`. Isolation OK.
- **Bugs:** `bug-EFA-11` vs `bug-UTLITE-07` via `bugRepository.listByContext`. OK.
- **Epics:** `epic-efa-1` vs `epic-utlite-1` via `epicRepository.listByContext`. OK.
- **Releases:** `rel-efa-1.0` vs `rel-utlite-1.0` via `releaseRepository.listByContext`. OK.
- **prj-core leakage:** Flat sprints/stories never carry `subProjectId`, thus excluded from sub-project queries. **PASS.**
- **Workspace context:** `projectService.getWorkspaceContext` filters `subProjects`/`teams` by `projectId` only; sub-project workspace `subProjectService.getWorkspaceContext` requires subProject membership (403 otherwise). **PASS.**

## 7. Permission Tests
- **Capability `hasProjectCapability` `config/project-config.ts:148` + `lib/permissions.ts:8` `hasPermission`**: UI hides `New project` unless `projects.create`, Bulk Archive/Delete unless `projects.archive/delete`, Teams Add unless `projects.edit`. Verified per persona.
- **Route guards:** `RequireProjectAccess:21` 403 outside scope, 404 missing. `RequireSubProjectAccess:23` 403 when project membership exists but subProject membership missing (e.g., Rohit cannot open UTLITE, Aditi cannot open EFA) — `subProjectService.getWorkspaceContext` enforces. **PASS.**
- **No `role===` leak**: grep `role ===` only in `services/project.ts:189` scope derivation and `team-members.tsx:105` fixed UI lock — no scattered RBAC. **PASS.**

## 8. Responsive Tests
- **Desktop `lg` 1600px:** Sidebar 272/76 toggle (localStorage `mytracker.sidebar`), Header, `PageLayout` max 1600, tables pagination, cards grid `lg:grid-cols-2/3`.
- **Tablet/Mobile `<lg`:** Sidebar hidden → Sheet 272 `DashboardLayout:16`, Hamburger in Header, Workspace nav horizontal scroll `scrollbar-none`. Cards `grid-cols-1` stack, dialogs/drawers full width. **PASS** — no horizontal overflow observed in `project-workspace-layout.tsx:51`, `sub-project-workspace-layout.tsx:23`.
- **Remaining P3:** Tables rely on horizontal scroll on mobile (by design `DataTable` overflow-x).

## 9. Dark Mode Tests
- Tokens in `globals.css:8` define `:root` light only; no `.dark` or `prefers-color-scheme`. Tailwind v4 media dark not configured. Charts/cards/borders remain light. **Result:** FAIL (P3 minor) — not blocking per Build prompt; logged as remaining issue.

## 10. Bugs Found

### BUG-001 — P1 Major — Manager filter drops second PM — FIXED
- **Repro:** `/projects` persona `super_admin` → filter Manager=Aditi Sharma. Expected UTEC (managerIds [rohit,aditi]) visible. Actual: UTEC hidden (filter used exact `ownerId`).
- **Root cause:** `services/project.ts:198` `filters.ownerId=ownerId` exact + missing `managerIds` includes check; `searchAccessors` only ownerId.
- **Fix:** Service now `match(project=>ids.includes(params.ownerId))` + `managerSearchAccessor` joins all managers `src/services/project.ts:184`. Removes ownerId from store filter.
- **Files:** `src/services/project.ts:182`
- **Verification:** `npx tsc -b` PASS, `npm run build` PASS, manual: filter Aditi now returns UTEC + Portal (both Aditi PM).

### BUG-002 — P2 Normal — Login missing demo OTP hint — FIXED
- **Repro:** `/login` showed no hint; QA must know `123456`.
- **Root cause:** `login-page.tsx:60` lacked hint display (verify had it after resend).
- **Fix:** Added dashed primary box with `OTP_DEMO_HINT` `src/features/auth/login-page.tsx:60`.
- **Files:** `src/features/auth/login-page.tsx:1`
- **Verification:** Build PASS, visual check.

### BUG-003 — P3 Minor — No dark theme — DEFERRED
- **Repro:** System dark → still light, contrast OK but not dark.
- **Root cause:** `globals.css` no `.dark` vars, `vite.config.ts` no darkMode class.
- **Files:** `src/styles/globals.css:1` (not changed this pass per scope).
- **Severity:** P3 cosmetic.

## 11. Remaining Issues
- P3 Dark mode as above.
- P3 `team-members.tsx:105` `fixed` locks manager/BA removal — intentional but not permission-driven.
- P3 `MAX_LIST_PAGE_SIZE=500` + DataTable pageSize 10 — no virtual scroll but OK for mock.
- No `npm test` suite.

## 12. Build / Typecheck / Lint Results
```
git status: 22+2 modified (uncommitted fix pass)
npx tsc -b --noEmit → PASS (0)
npm run lint (oxlint) → PASS (12 Fast Refresh warnings pre-existing)
npm run build (tsc -b && vite) → PASS 3046 modules 474.84kB gz 132.6kB
npm test → no script (N/A)
dev server 5175 → 200
```

## 13. Regression Results
After BUG-001/002 fixes: re-ran tsc+build; re-tested Create with 2 PMs (Rohit+Aditi → stored `managerIds:[rohit,aditi]`, displayed "Rohit Verma +1" in list `projectService.toListItem:110`, full names in overview `project-workspace-overview-page.tsx:28`), Edit pre-fills both via `projectToFormValues`, filter Aditi correctness, session persist. No regressions.

## 14. Recommended Next Development Task
**Build Project Overview enhancements (single screen)** — keep existing workspace-overview structure (header+BudgetCard+Timeline+Activity+SubProjects+Teams placeholders) and add real health/completion/budget widgets now architecture frozen, before starting Sub Projects CRUD or Backlog per Phases backlog (Phase 10→ Backlog is P1 but Overview is prerequisite).
