// @ts-check

/**
 * A theme is a coherent set of design tokens (color, radius, font stack,
 * shadow, button style) tuned for a local-business vertical. Themes are
 * intentionally *data*, not CSS — `styles.js` turns whichever one is active
 * into CSS custom properties on the shadow host, so a single small template
 * string still generates every look.
 *
 * @typedef {Object} LeadBoxThemeTokens
 * @property {string} accent Primary accent color (trigger/submit button, focus rings).
 * @property {string} accentInk Text color on top of `accent`.
 * @property {string} bg Dialog/surface background.
 * @property {string} ink Primary text color.
 * @property {string} muted Secondary/help text color.
 * @property {string} border Input/divider border color.
 * @property {string} error Error text/border color.
 * @property {string} success Success accent (checkmark, success text).
 * @property {string} radius Corner radius for the dialog + trigger button.
 * @property {string} radiusSm Corner radius for inputs/small controls.
 * @property {string} font Font stack.
 * @property {string} shadowTrigger Box-shadow for the floating trigger button.
 * @property {string} shadowDialog Box-shadow for the modal dialog.
 */

/**
 * @typedef {Object} LeadBoxTheme
 * @property {LeadBoxThemeTokens} light Base (light-mode) tokens.
 * @property {Partial<LeadBoxThemeTokens>} dark Overrides applied on top of
 *   `light` (and the default theme's `dark`) when dark mode is active.
 */

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", Times, serif';
const FRIENDLY = '"Trebuchet MS", Verdana, Tahoma, sans-serif';
const STURDY = '"Arial Narrow", Arial, Helvetica, sans-serif';

/**
 * Theme presets, one per local-business vertical named in the brief, plus
 * `default`. Every theme is a full token set (not a diff) so each one reads
 * clearly on its own; `resolveThemeTokens` layers `dark` on top when needed.
 * @type {Record<string, LeadBoxTheme>}
 */
export const THEMES = {
  default: {
    light: {
      accent: '#2563eb',
      accentInk: '#ffffff',
      bg: '#ffffff',
      ink: '#111827',
      muted: '#6b7280',
      border: '#e5e7eb',
      error: '#b91c1c',
      success: '#16a34a',
      radius: '12px',
      radiusSm: '8px',
      font: SANS,
      shadowTrigger: '0 4px 14px rgba(0, 0, 0, 0.2)',
      shadowDialog: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },
    dark: {
      bg: '#1a1a1a',
      ink: '#e5e7eb',
      muted: '#9ca3af',
      border: '#333333',
      shadowDialog: '0 20px 60px rgba(0, 0, 0, 0.6)',
    },
  },

  // Hair/nail/beauty salons: soft, warm, rounded — inviting rather than corporate.
  salon: {
    light: {
      accent: '#c2609e',
      accentInk: '#ffffff',
      bg: '#fff8fb',
      ink: '#3b0f28',
      muted: '#8a6478',
      border: '#f3d9e8',
      error: '#c0355c',
      success: '#3f9d6e',
      radius: '20px',
      radiusSm: '14px',
      font: FRIENDLY,
      shadowTrigger: '0 8px 20px rgba(194, 96, 158, 0.35)',
      shadowDialog: '0 24px 48px rgba(59, 15, 40, 0.22)',
    },
    dark: {
      bg: '#241019',
      ink: '#f7e3ee',
      muted: '#c79bb2',
      border: '#4a2436',
    },
  },

  // Plumbers/electricians/contractors: bold, high-contrast, no-nonsense.
  trades: {
    light: {
      accent: '#d97706',
      accentInk: '#111827',
      bg: '#ffffff',
      ink: '#1c1917',
      muted: '#78716c',
      border: '#e7e5e4',
      error: '#b91c1c',
      success: '#15803d',
      radius: '4px',
      radiusSm: '3px',
      font: SANS,
      shadowTrigger: '0 6px 0 rgba(0, 0, 0, 0.2), 0 10px 18px rgba(0, 0, 0, 0.28)',
      shadowDialog: '0 20px 50px rgba(0, 0, 0, 0.35)',
    },
    dark: {
      bg: '#1c1917',
      ink: '#f5f5f4',
      muted: '#a8a29e',
      border: '#3a3634',
    },
  },

  // Restaurants/cafes: warm, appetizing, a touch of tradition.
  restaurant: {
    light: {
      accent: '#b45309',
      accentInk: '#fffbeb',
      bg: '#fffaf0',
      ink: '#431407',
      muted: '#92603f',
      border: '#f0dcc0',
      error: '#b91c1c',
      success: '#4d7c0f',
      radius: '10px',
      radiusSm: '6px',
      font: SERIF,
      shadowTrigger: '0 8px 20px rgba(180, 83, 9, 0.3)',
      shadowDialog: '0 22px 50px rgba(67, 20, 7, 0.28)',
    },
    dark: {
      bg: '#241408',
      ink: '#fde8cf',
      muted: '#c9a37c',
      border: '#4a341c',
    },
  },

  // Dental/medical/wellness clinics: clean, calm, trustworthy.
  clinic: {
    light: {
      accent: '#0d9488',
      accentInk: '#ffffff',
      bg: '#ffffff',
      ink: '#0f172a',
      muted: '#64748b',
      border: '#e2e8f0',
      error: '#dc2626',
      success: '#0d9488',
      radius: '8px',
      radiusSm: '6px',
      font: SANS,
      shadowTrigger: '0 4px 12px rgba(13, 148, 136, 0.25)',
      shadowDialog: '0 16px 40px rgba(15, 23, 42, 0.16)',
    },
    dark: {
      bg: '#0f1720',
      ink: '#e2e8f0',
      muted: '#94a3b8',
      border: '#293548',
    },
  },

  // Auto repair/auto body shops: dark, mechanical, confident.
  auto: {
    light: {
      accent: '#dc2626',
      accentInk: '#ffffff',
      bg: '#ffffff',
      ink: '#18181b',
      muted: '#71717a',
      border: '#e4e4e7',
      error: '#b91c1c',
      success: '#16a34a',
      radius: '4px',
      radiusSm: '3px',
      font: STURDY,
      shadowTrigger: '0 6px 16px rgba(0, 0, 0, 0.35)',
      shadowDialog: '0 22px 50px rgba(0, 0, 0, 0.4)',
    },
    dark: {
      bg: '#121214',
      ink: '#f4f4f5',
      muted: '#a1a1aa',
      border: '#333336',
      accent: '#ef4444',
    },
  },

  // Law/accounting/consulting: restrained, precise, a little formal.
  professional: {
    light: {
      accent: '#1e3a5f',
      accentInk: '#ffffff',
      bg: '#ffffff',
      ink: '#1a1a2e',
      muted: '#5b6472',
      border: '#dfe3e8',
      error: '#9b2226',
      success: '#2f6f4e',
      radius: '6px',
      radiusSm: '4px',
      font: SERIF,
      shadowTrigger: '0 6px 16px rgba(26, 26, 46, 0.22)',
      shadowDialog: '0 20px 45px rgba(26, 26, 46, 0.22)',
    },
    dark: {
      bg: '#14141f',
      ink: '#e8e9ee',
      muted: '#9096a3',
      border: '#2c2e3d',
      accent: '#3b6ea5',
    },
  },
};

export const DEFAULT_THEME_NAME = 'default';

/** Ordered list of every valid theme name (for validation + the demo gallery). */
export const THEME_NAMES = Object.keys(THEMES);

/**
 * @param {string|undefined|null} name
 * @returns {boolean}
 */
export function isValidTheme(name) {
  return typeof name === 'string' && Object.prototype.hasOwnProperty.call(THEMES, name);
}

/**
 * @param {string|undefined|null} name
 * @returns {string} A valid theme name, falling back to `default`.
 */
export function resolveThemeName(name) {
  return isValidTheme(name) ? /** @type {string} */ (name) : DEFAULT_THEME_NAME;
}

/**
 * Resolve the full token set for a theme name + color scheme. Unset keys in
 * a preset's `dark` fall back to the default theme's `dark`, then to the
 * theme's own `light` value, so every theme stays fully specified.
 * @param {string|undefined|null} name
 * @param {'light'|'dark'} scheme
 * @returns {LeadBoxThemeTokens}
 */
export function resolveThemeTokens(name, scheme) {
  const theme = THEMES[resolveThemeName(name)];
  const base = { ...THEMES.default.light, ...theme.light };
  if (scheme !== 'dark') return base;
  return { ...base, ...THEMES.default.dark, ...(theme.dark || {}) };
}
