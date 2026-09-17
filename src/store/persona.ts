import { create } from 'zustand'
import { personaForRole } from '@/config/dashboard-config'
import type { DashboardPersona } from '@/types/dashboard'
import { useAuthStore } from './auth'

/**
 * @deprecated Demo persona switching has been removed from production UI.
 * Persona is now derived directly from the authenticated session
 * (`personaForRole(authUser.roleId)`). This store is retained only for
 * backward-compatibility and will be deleted once all callers are migrated
 * to `useAuth` + `personaForRole`.
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

/** @deprecated Use `personaForRole(useAuth().authUser?.roleId)` instead. */
export function useDemoPersona() {
  const persona = useDemoPersonaStore((state) => state.persona)
  const setPersona = useDemoPersonaStore((state) => state.setPersona)
  return { persona, setPersona }
}
