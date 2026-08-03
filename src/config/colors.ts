/**
 * Color tokens — mirrors of the CSS variables in styles/globals.css.
 * Use CSS variables for styling; use this module for runtime needs
 * (charts, canvas, inline SVGs).
 */
export const colors = {
  brand: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  surface: {
    background: '#fafafa',
    surface: '#ffffff',
    muted: '#fafafa',
    subtle: '#f5f5f6',
  },
  semantic: {
    primary: '#f97316',
    primaryStrong: '#ea580c',
    primarySoft: '#fff7ed',
    accent: '#fb923c',
    success: '#22c55e',
    successSoft: '#f0fdf4',
    warning: '#f59e0b',
    warningSoft: '#fffbeb',
    danger: '#ef4444',
    dangerSoft: '#fef2f2',
    info: '#3b82f6',
    infoSoft: '#eff6ff',
    foreground: '#111827',
    mutedForeground: '#71717a',
    border: '#ececec',
    borderStrong: '#d9d9de',
  },
  chart: {
    1: '#f97316',
    2: '#3b82f6',
    3: '#10b981',
    4: '#8b5cf6',
    5: '#f59e0b',
    6: '#ef4444',
  },
} as const

export const CHART_PALETTE: string[] = [
  colors.chart[1],
  colors.chart[2],
  colors.chart[3],
  colors.chart[4],
  colors.chart[5],
  colors.chart[6],
]
