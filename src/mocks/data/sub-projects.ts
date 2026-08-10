import type { SubProject } from '@/types'
import { daysAgo, daysFromNow } from './users'

/**
 * Sub Projects under UTEC — each runs as an independent delivery unit with its own
 * manager, budget, and cadence while reporting into the parent project.
 */
export const DEMO_SUB_PROJECTS: SubProject[] = [
  {
    id: 'sprj-efa',
    projectId: 'prj-utec',
    key: 'EFA',
    name: 'EFA',
    description:
      'Everyday Financial Assistant — the in-app mobile assistant for balances, transfers, and spend insights.',
    status: 'active',
    health: 'at_risk',
    progress: 52,
    ownerIds: ['user-rohit'],
    businessAnalystId: 'user-priya',
    startDate: daysAgo(80),
    endDate: daysFromNow(70),
    budget: 820000,
    spent: 438000,
    tags: ['mobile', 'assistant', 'payments'],
    updatedAt: daysAgo(1),
  },
  {
    id: 'sprj-utlite',
    projectId: 'prj-utec',
    key: 'UTLITE',
    name: 'UTLITE',
    description:
      'Unified Transaction Ledger & Integration Layer — the shared ledger, reconciliation, and bank-integration backbone for UTEC.',
    status: 'active',
    health: 'on_track',
    progress: 24,
    ownerIds: ['user-aditi'],
    businessAnalystId: 'user-priya',
    startDate: daysAgo(45),
    endDate: daysFromNow(160),
    budget: 760000,
    spent: 214000,
    tags: ['ledger', 'integrations', 'payments'],
    updatedAt: daysAgo(0),
  },
]
