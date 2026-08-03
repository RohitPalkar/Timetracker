export const typography = {
  fontFamily: {
    sans: "'Geist Variable', 'Inter Variable', ui-sans-serif, system-ui, sans-serif",
    mono: "'Geist Mono Variable', ui-monospace, 'SF Mono', monospace",
  },
  sizes: {
    h1: { fontSize: 40, lineHeight: 48, weight: 600 },
    h2: { fontSize: 32, lineHeight: 40, weight: 600 },
    h3: { fontSize: 24, lineHeight: 32, weight: 600 },
    h4: { fontSize: 20, lineHeight: 28, weight: 600 },
    body: { fontSize: 16, lineHeight: 24, weight: 400 },
    caption: { fontSize: 14, lineHeight: 20, weight: 400 },
    label: { fontSize: 12, lineHeight: 16, weight: 500 },
    small: { fontSize: 11, lineHeight: 16, weight: 400 },
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const
