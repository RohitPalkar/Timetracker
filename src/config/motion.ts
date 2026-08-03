export const motion = {
  duration: {
    fast: 180,
    base: 220,
    slow: 320,
  },
  easing: {
    out: [0.16, 1, 0.3, 1] as const,
    inOut: [0.4, 0, 0.2, 1] as const,
  },
  transition: {
    fast: { duration: 180, ease: [0.16, 1, 0.3, 1] },
    base: { duration: 220, ease: [0.16, 1, 0.3, 1] },
  },
} as const

export type TransitionPreset = keyof typeof motion.transition
