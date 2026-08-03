/** 8-point spacing scale */
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const

export const layout = {
  sidebarWidth: 272,
  sidebarCollapsedWidth: 72,
  topbarHeight: 72,
  contentMaxWidth: 1600,
  drawerRight: 480,
  drawerLarge: 640,
  drawerBottomHeight: 420,
} as const

export type SpacingToken = keyof typeof spacing