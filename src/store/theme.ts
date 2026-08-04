import { create } from 'zustand'
import { THEME_STORAGE_KEY } from '@/constants'

export type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function resolve(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function applyTheme(theme: Theme) {
  const resolved = resolve(theme)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.style.colorScheme = resolved
}

const initial = getInitialTheme()
applyTheme(initial)

export const useTheme = create<ThemeState>((set) => ({
  theme: initial,
  resolvedTheme: resolve(initial),
  setTheme: (theme) =>
    set(() => {
      applyTheme(theme)
      localStorage.setItem(THEME_STORAGE_KEY, theme)
      return { theme, resolvedTheme: resolve(theme) }
    }),
}))

/** Listen for OS-level theme changes when in "system" mode. */
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useTheme.getState()
    if (state.theme === 'system') {
      useTheme.setState({ resolvedTheme: resolve('system') })
      applyTheme('system')
    }
  })
}