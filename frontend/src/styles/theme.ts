export const theme = {
  colors: {
    bgApp: '#030712',
    bgSidebar: '#0b0f19',
    bgCard: '#111827',
    border: '#1f2937',
    borderFocus: '#374151',
    textPrimary: '#f8fafc',
    textSecondary: '#9ca3af',
    textMuted: '#4b5563',
    accent: '#38bdf8',
    accentHover: '#0284c7',
    edgeStroke: '#38bdf8',
    error: '#ef4444',
  },
  typography: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    codeFont: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    lineHeightEditor: 24,
  },
  sizes: {
    nodeSize: 28,
    sidebarWidth: 300,
    borderRadius: 8,
  },
  shadows: {
    node: '0 2px 6px rgba(0, 0, 0, 0.5)',
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    drawer: '4px 0 16px rgba(0, 0, 0, 0.6)',
  },
  breakpoints: {
    mobile: 768,
  },
} as const;

export type Theme = typeof theme;