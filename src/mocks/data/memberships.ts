import type { ProjectMembership } from '@/types'
import { daysAgo } from './users'

/**
 * Project Memberships for UTEC — the core relationship model.
 *
 * Project-level memberships grant access to the parent project workspace.
 * Sub-project-level memberships (subProjectId set) grant access to that
 * specific sub-project ONLY — PM A (Rohit) cannot open UTLITE and PM B (Aditi)
 * cannot open EFA.
 */
export const DEMO_PROJECT_MEMBERSHIPS: ProjectMembership[] = [
  // ---- UTEC project-level (both PMs, shared support roles) ----
  {
    id: 'mem-utec-rohit',
    userId: 'user-rohit',
    projectId: 'prj-utec',
    role: 'manager',
    capacity: 100,
    startedAt: daysAgo(90),
  },
  {
    id: 'mem-utec-aditi',
    userId: 'user-aditi',
    projectId: 'prj-utec',
    role: 'manager',
    capacity: 100,
    startedAt: daysAgo(90),
  },
  {
    id: 'mem-utec-priya',
    userId: 'user-priya',
    projectId: 'prj-utec',
    role: 'business_analyst',
    capacity: 100,
    startedAt: daysAgo(85),
  },

  // ---- EFA sub-project memberships (PM A = Rohit) ----
  {
    id: 'mem-efa-rohit',
    userId: 'user-rohit',
    projectId: 'prj-utec',
    subProjectId: 'sprj-efa',
    role: 'manager',
    capacity: 100,
    startedAt: daysAgo(80),
  },
  {
    id: 'mem-efa-ravi',
    userId: 'user-ravi',
    projectId: 'prj-utec',
    subProjectId: 'sprj-efa',
    teamId: 'team-utec-dev-a',
    role: 'lead',
    capacity: 100,
    startedAt: daysAgo(80),
  },
  {
    id: 'mem-efa-arjun',
    userId: 'user-arjun',
    projectId: 'prj-utec',
    subProjectId: 'sprj-efa',
    teamId: 'team-utec-dev-a',
    role: 'developer',
    capacity: 100,
    startedAt: daysAgo(76),
  },
  {
    id: 'mem-efa-kiran',
    userId: 'user-kiran',
    projectId: 'prj-utec',
    subProjectId: 'sprj-efa',
    teamId: 'team-utec-dev-a',
    role: 'developer',
    capacity: 100,
    startedAt: daysAgo(70),
  },
  {
    id: 'mem-efa-priya',
    userId: 'user-priya',
    projectId: 'prj-utec',
    subProjectId: 'sprj-efa',
    teamId: 'team-utec-qa-a',
    role: 'business_analyst',
    capacity: 60,
    startedAt: daysAgo(78),
  },
  {
    id: 'mem-efa-lakshmi',
    userId: 'user-lakshmi',
    projectId: 'prj-utec',
    subProjectId: 'sprj-efa',
    teamId: 'team-utec-qa-a',
    role: 'qa',
    capacity: 100,
    startedAt: daysAgo(70),
  },

  // ---- UTLITE sub-project memberships (PM B = Aditi) ----
  {
    id: 'mem-utlite-aditi',
    userId: 'user-aditi',
    projectId: 'prj-utec',
    subProjectId: 'sprj-utlite',
    role: 'manager',
    capacity: 100,
    startedAt: daysAgo(45),
  },
  {
    id: 'mem-utlite-amit',
    userId: 'user-amit',
    projectId: 'prj-utec',
    subProjectId: 'sprj-utlite',
    teamId: 'team-utec-dev-b',
    role: 'lead',
    capacity: 100,
    startedAt: daysAgo(45),
  },
  {
    id: 'mem-utlite-dinesh',
    userId: 'user-dinesh',
    projectId: 'prj-utec',
    subProjectId: 'sprj-utlite',
    teamId: 'team-utec-dev-b',
    role: 'developer',
    capacity: 100,
    startedAt: daysAgo(42),
  },
  {
    id: 'mem-utlite-neha',
    userId: 'user-neha',
    projectId: 'prj-utec',
    subProjectId: 'sprj-utlite',
    teamId: 'team-utec-dev-b',
    role: 'developer',
    capacity: 100,
    startedAt: daysAgo(38),
  },
  {
    id: 'mem-utlite-lakshmi',
    userId: 'user-lakshmi',
    projectId: 'prj-utec',
    subProjectId: 'sprj-utlite',
    teamId: 'team-utec-qa-b',
    role: 'qa',
    capacity: 60,
    startedAt: daysAgo(40),
  },
  {
    id: 'mem-utlite-sara',
    userId: 'user-sara',
    projectId: 'prj-utec',
    subProjectId: 'sprj-utlite',
    teamId: 'team-utec-qa-b',
    role: 'designer',
    capacity: 50,
    startedAt: daysAgo(35),
  },

  // ---- Cross-context examples (same user, different role/team) ----
  // Arjun: developer in EFA (Dev A), lead in UTLITE via shared team — demonstrates contextual role.
  {
    id: 'mem-utlite-arjun-shared',
    userId: 'user-arjun',
    projectId: 'prj-utec',
    subProjectId: 'sprj-utlite',
    teamId: 'team-utec-shared',
    role: 'qa',
    capacity: 40,
    startedAt: daysAgo(30),
  },
  // Kiran: developer in EFA, also in shared team across both workstreams
  {
    id: 'mem-utlite-kiran-shared',
    userId: 'user-kiran',
    projectId: 'prj-utec',
    subProjectId: 'sprj-utlite',
    teamId: 'team-utec-shared',
    role: 'developer',
    capacity: 30,
    startedAt: daysAgo(30),
  },
  // Lakshmi already demonstrates QA across both sub-projects with two memberships (EFA + UTLITE).
  // Shared team membership for Lakshmi
  {
    id: 'mem-shared-lakshmi',
    userId: 'user-lakshmi',
    projectId: 'prj-utec',
    subProjectId: 'sprj-efa',
    teamId: 'team-utec-shared',
    role: 'qa',
    capacity: 30,
    startedAt: daysAgo(28),
  },
]
