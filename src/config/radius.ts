export const radius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
} as const

export const radiusPx = radius

export const radiusClass = {
  button: 'rounded-xl',
  input: 'rounded-xl',
  card: 'rounded-2xl',
  dialog: 'rounded-2xl',
  sheet: 'rounded-l-2xl',
  badge: 'rounded-full',
} as const
