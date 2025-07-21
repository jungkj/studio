export const designTokens = {
  // Typography
  typography: {
    fontFamily: {
      primary: 'Monaco, Menlo, "Courier New", monospace',
      system: 'Monaco, Menlo, "Courier New", monospace',
      mono: 'Monaco, Menlo, "Courier New", monospace',
      pixel: '"Press Start 2P", cursive', // Keep for special cases only
    },
    fontSize: {
      '2xs': '0.625rem',    // 10px
      xs: '0.75rem',        // 12px
      sm: '0.875rem',       // 14px
      base: '1rem',         // 16px
      lg: '1.125rem',       // 18px
      xl: '1.25rem',        // 20px
      '2xl': '1.5rem',      // 24px
      '3xl': '1.875rem',    // 30px
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.3',
      relaxed: '1.5',
      loose: '1.8',
    },
  },

  // Spacing
  spacing: {
    px: '1px',
    0: '0px',
    0.5: '2px',
    1: '4px',
    1.5: '6px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
  },

  // Window constraints
  window: {
    minWidth: 240,
    minHeight: 180,
    defaultWidth: 400,
    defaultHeight: 300,
    titleBarHeight: 32,
    resizeHandleSize: 20,
  },

  // Z-index layers
  zIndex: {
    base: 1,
    window: 10,
    windowActive: 50,
    modal: 100,
    tooltip: 200,
    notification: 300,
  },

  // Animation
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      default: 'ease-in-out',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const;

export type DesignTokens = typeof designTokens;