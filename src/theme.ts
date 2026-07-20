import { createTheme, type PaletteMode } from '@mui/material/styles'

// Slate design tokens. These cover the soft
// tints / borders / severity colors that don't map cleanly onto MUI's
// standard palette; components import `slate` and use it in `sx`. The
// standard roles (primary/error/warning/success/background/text) are wired
// into the MUI palette below so default components pick them up too.
export const slate = {
  fonts: {
    ui: "'Manrope', system-ui, -apple-system, sans-serif",
    head: "'Space Grotesk', system-ui, sans-serif",
    serif: "'Source Serif 4', Georgia, serif",
  },
  bg: { app: '#F2F3F7', surface: '#FFFFFF' },
  border: '#E4E7EE',
  divider: '#EDEFF3',
  // Darkened from the original handoff values (#737B8C / #8A90A0) to clear
  // WCAG AA's 4.5:1 text contrast ratio against the app's light surfaces
  // (white, #F2F3F7, #F1F3F6) — the originals landed between 3.2:1 and
  // 4.3:1, flagged by Storybook's a11y addon (axe color-contrast). Extra
  // margin built in on top of the minimum, since read-only issue cards
  // render this text at 90% opacity (see IssuesList.tsx), which lightens
  // the effective on-screen color further.
  text: { primary: '#1B2130', secondary: '#4B5563', tertiary: '#565E6D' },
  accent: { main: '#7C3AED', soft: '#EFE9FC' },
  critical: { main: '#E11D48', softBg: '#FBF0F3', softBorder: '#F4D6DF', text: '#BE123C' },
  // `major.text` is a darker amber than `major.main`, used only where the
  // color renders as text (needs 4.5:1) rather than a decorative dot/border.
  major: { main: '#D97706', text: '#92400E' },
  success: {
    main: '#059669',
    softBg: '#E6F6EE',
    softBorder: '#C2E9D3',
    chipBorder: '#BBE7D3',
    // Darkened from #047857 — same opacity-blending margin as text.* above.
    text: '#065F46',
  },
  chip: { bg: '#F1F3F6', border: '#E0E3EA' },
  approveShadow: '0 6px 16px -4px rgba(124,58,237,0.55)',
} as const

// Severity → color helpers, used by the issues list + approve gate.
export const severityColor = {
  critical: slate.critical.main,
  major: slate.major.main,
  minor: slate.text.tertiary,
} as const

// Same idea, but for severity colors rendered as text (the issue card's
// severity label) rather than a decorative dot/progress-bar segment — those
// need to independently clear the 4.5:1 text contrast ratio.
export const severityTextColor = {
  critical: slate.critical.text,
  major: slate.major.text,
  minor: slate.text.tertiary,
} as const

export function getTheme(mode: PaletteMode) {
  const isLight = mode === 'light'
  return createTheme({
    palette: {
      mode,
      primary: { main: slate.accent.main },
      error: { main: slate.critical.main },
      warning: { main: slate.major.main },
      success: { main: slate.success.main },
      background: isLight
        ? { default: slate.bg.app, paper: slate.bg.surface }
        // Softer slate-grey rather than nearly-black, to stay in the same
        // family as the light-mode "Slate" tones instead of a stock black theme.
        : { default: '#1C1E24', paper: '#262933' },
      // Only override text/divider in light mode; omitting the keys in dark
      // mode (rather than setting them to `undefined`) lets MUI fall back to
      // its own dark-mode defaults instead of nulling out the whole object.
      ...(isLight
        ? {
            text: { primary: slate.text.primary, secondary: slate.text.secondary },
            divider: slate.border,
          }
        : {}),
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: slate.fonts.ui,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            borderRight: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
    },
  })
}
