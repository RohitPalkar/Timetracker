import { create } from 'zustand'
import { personaForRole } from '@/config/dashboard-config'
import type { DashboardPersona } from '@/types/dashboard'
import { useAuthStore } from './auth'

/**
 * Demo persona selection — SHARED across the Projects List and the Project /
 * Sub Project workspace guards.
 *
 * The persona switcher on the Projects List is local-only state in other
 * pages, which breaks workspace access: the guard re-derived the persona from
 * the session role and ignored the selected persona (e.g. switching to Super
 * Admin still resolved a managed-scope actor → 403). Lifting the selection
 * here keeps the list, workspace and sub-project guards consistent.
 */
const sessionPersona = (): DashboardPersona => personaForRole(useAuthStore.getState().authUser?.roleId)

interface DemoPersonaState {
  persona: DashboardPersona
  setPersona: (persona: DashboardPersona) => void
  resetPersona: () => void
}

export const useDemoPersonaStore = create<DemoPersonaState>((set) => ({
  persona: sessionPersona(),
  setPersona: (persona) => set({ persona }),
  resetPersona: () => set({ persona: sessionPersona() }),
}))

/** Convenience hook — current demo persona plus the setter. */
export function useDemoPersona() {
  const persona = useDemoPersonaStore((state) => state.persona)
  const setPersona = useDemoPersonaStore((state) => state.setPersona)
  return { persona, setPersona }
}
